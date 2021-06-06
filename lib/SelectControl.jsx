import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import AsyncSelect from 'react-select/async'
import debounce from 'lodash/debounce'
import { reactSelectStyles } from 'netlify-cms-ui-default/dist/esm/styles'
import { validations } from 'netlify-cms-lib-widgets'
import Fuse from 'fuse.js'
import dlv from 'dlv'
import { formatGroupLabel } from './styles.jsx'
import { getOptionsFromInitialValue, optionToString } from './utils'


const fieldDefaults = {
    value_field: 'value',
    label_field: 'label',
    multiple: false,
    required: true,
    refetch_url: true,
    fuzzy_search: true,
    grouped_options: {
        flatten_singles: true
    },
    fetch_options: {
        headers: {},
        method: 'GET',
        body: undefined
    }
}

export class Control extends React.Component {

    constructor(props) {
        super(props)
        this.fuse = null
        this.count = 0

        this.state = {
            allOptions: null,
            selectedOptions: null,
            initialOptionsLoaded: false
        }

        this.loadOptions = debounce(this.loadOptions.bind(this), 100, { leading: true, trailing:true, maxWait: 300 })
        this.fetchUrl = this.fetchUrl.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.fuzzySearch = this.fuzzySearch.bind(this)
        this.getCMSValues = this.getCMSValues.bind(this)
        this.processRawData = this.processRawData.bind(this)
        this.getOptions = this.getOptions.bind(this)
    }

    handleChange(selectedOptions) {
        const { onChange, field } = this.props
        const isMultiple = field.get('multiple', fieldDefaults.multiple)
        const isEmpty = isMultiple ? !selectedOptions.length : !selectedOptions

        if (field.get('required') && isEmpty && isMultiple) {
            onChange([])
        } else if (isEmpty) {
            onChange(null)
        } else if (isMultiple) {
            const options = selectedOptions.map(optionToString)
            onChange(options)
        } else {
            onChange(optionToString(selectedOptions))
        }

        // push new selectedoptions to state, Component is controlled by this state
        this.setState({
            selectedOptions
        })
    }

    isValid() {
        const { field, value, t } = this.props
        const min = field.get('min')
        const max = field.get('max')

        if (!field.get('multiple')) {
            return { error: false }
        }

        const error = validations.validateMinMax(
            t,
            field.get('label', field.get('name')),
            value,
            min,
            max,
        )
        return error ? { error } : { error: false }

    }

    getCMSValues() {
        const { field } = this.props

        // Data options
        const valueField = field.get('value_field', fieldDefaults.value_field)
        const displayField = field.get('display_field', fieldDefaults.display_field)
        const dataPath = field.get('data_path')

        // Grouped options
        const isGroupedOptions = !!field.get('grouped_options')
        const groupedValueField = field.getIn(['grouped_options', 'value_field'], fieldDefaults.value_field)
        const groupedDisplayField = field.getIn(['grouped_options', 'display_field'], fieldDefaults.display_field)
        const groupedDataPath = field.getIn(['grouped_options', 'data_path'])
        const groupedFlattenSingles = field.getIn(['grouped_options', 'flatten_singles'], fieldDefaults.grouped_options.flatten_singles)

        // Fetch options
        const url = field.get('url')
        const method = field.getIn(['fetch_options','method'], fieldDefaults.fetch_options.method)
        const headers = field.hasIn(['fetch_options','headers']) ? field.getIn(['fetch_options','headers']).toObject() : fieldDefaults.fetch_options.headers
        const body = field.getIn(['fetch_options','body'], fieldDefaults.fetch_options.body)
        const paramsFunction = field.getIn(['fetch_options', 'params_function'])

        // Global settings
        const refetchUrl = field.get('refetch_url', fieldDefaults.refetch_url)
        const fuzzySearch = field.get('fuzzy_search', fieldDefaults.fuzzy_search)
        return {
            body,
            dataPath,
            displayField,
            fuzzySearch,
            groupedDataPath,
            groupedDisplayField,
            groupedFlattenSingles,
            groupedValueField,
            headers,
            isGroupedOptions,
            method,
            paramsFunction,
            refetchUrl,
            url,
            valueField,
        }
    }

    fuzzySearch(term, data) {
        const processResults = (results) => results.length > 0 ? results.map(({ item }) => item) : []
        const {
            isGroupedOptions

        } = this.getCMSValues()

        if (this.fuse) {
            const results = this.fuse.search(term)
            return processResults(results)
        }

        let searchKeys = [
            {
                name: 'label',
                weight: 0.5
            }
        ]

        if (isGroupedOptions) {
            searchKeys.push({ name: 'options.label', weight: 0.6 })
        }

        let fuseOptions = {
            // TODO: custom getFn function
            keys: searchKeys
        }

        this.fuse = new Fuse(data, fuseOptions)
        const results = this.fuse.search(term)

        return processResults(results)

    }

    async fetchUrl({ term }) {
        const {
            url,
            refetchUrl,
            method,
            headers,
            body,
            paramsFunction,
        } = this.getCMSValues()


        /**
         * Accumulate fetch parameters
         */
        let fetchParams = {}

        if (paramsFunction && typeof paramsFunction === 'function') {
            // create temporary variable to check whether it returns object
            const paramsFunctionObject = paramsFunction({
                term,
                url,
                method,
                headers,
                refetchUrl
            })
            if (
                paramsFunctionObject &&
                typeof paramsFunctionObject === 'object' &&
                paramsFunctionObject.url
            ) {
                fetchParams = paramsFunctionObject
            } else {
                console.error('\'params_function\' does not return a valid object. Please check your config file.' + '\n' + 'Received object: ' + JSON.stringify(paramsFunctionObject) + '\n' + 'Function: ' + paramsFunction)
            }
        } else {
            fetchParams = {
                url,
                options: {
                    method,
                    headers,
                    body
                }
            }
        }

        try {
            const res = await fetch(fetchParams.url, fetchParams.options)
            const data = await res.json()

            return data
        } catch (e) {
            console.log(e)
        }
    }

    processRawData(rawData){
        const {
            dataPath,
            valueField,
            displayField,
            isGroupedOptions,
            groupedValueField,
            groupedDisplayField,
            groupedDataPath,
            groupedFlattenSingles
        } = this.getCMSValues()

        const flatLabel = (parentLabel, childLabel) => `${parentLabel}: ${childLabel}`

        const structure = {
            groupedSingle: (parent, option = []) => ({
                'label': flatLabel(
                    dlv(parent, displayField), // parent label
                    dlv(option, groupedDisplayField) // child label
                ),
                'value': dlv(option, groupedValueField),
                '__dataGroup': option
            }),
            groupedMulti: (parent, options) => ({
                'label': dlv(parent, displayField),
                'options': options.map(itm => ({
                    'label': dlv(itm, groupedDisplayField),
                    'value': dlv(itm, groupedValueField),
                    '__dataGroup': itm
                }))
            }),
            single: (option) => ({
                'label': dlv(option, displayField),
                'value': dlv(option, valueField),
                '__data': option
            })
        }

        const rawOptions = dataPath ? dlv(rawData, dataPath) : rawData

        if (rawOptions) {
            const processedOptions = rawOptions.map(item => {
                const group = isGroupedOptions && dlv(item, groupedDataPath) // check for grouped data

                if (group && group.length) { // Construct grouped options
                    if (groupedFlattenSingles && group.length === 1) { // flatten single options to top level option
                        return structure.groupedSingle(item, group[0])
                    } else { // group options
                        return structure.groupedMulti(item, group)
                    }
                }
                // Treat single option
                return structure.single(item)
            })

            return processedOptions
        }

    }

    async getOptions(term) {
        const { refetchUrl, fuzzySearch } = this.getCMSValues()

        // no options in-state or refetch url with each term
        if (!this.state.allOptions || refetchUrl) {
            // fetch options
            const rawData = await this.fetchUrl({ term })

            // process options -> store in state
            await this.setState({
                allOptions: this.processRawData(rawData)
            })
        }


        // if there is not selected value but we have a value and it is the initial load then set selectedValues state
        if (
            this.props.value &&
            !this.initialOptionsLoaded &&
            !this.selectedOptions
        ) {
            const { field, value } = this.props
            const enrichedValues = getOptionsFromInitialValue({
                options: this.state.allOptions,
                isMultiple: field.get('multiple', fieldDefaults.multiple),
                value
            })

            if (enrichedValues) {
                this.setState({
                    selectedOptions: enrichedValues,
                    initialOptionsLoaded: true
                })
            }
        }

        if (term && fuzzySearch) {
            const searchResults = this.fuzzySearch(term, this.state.allOptions)
            return searchResults
        } else {
            return this.state.allOptions
        }
    }

    loadOptions(term, callback) {
        this.getOptions(term).then(options => callback(options))
    }

    render() {
        const {
            field,
            forID,
            classNameWrapper,
            setActiveStyle,
            setInactiveStyle,
        } = this.props

        const isMultiple = field.get('multiple', fieldDefaults.multiple)
        const isClearable = !field.get('required', fieldDefaults.required) || isMultiple
        const isSearchable = !(!field.get('fuzzy_search', fieldDefaults.fuzzy_search) && !field.get('refetch_url', fieldDefaults.refetch_url))

        return (
            <AsyncSelect
                defaultOptions
                className={classNameWrapper}
                inputId={forID}
                isClearable={isClearable}
                isMulti={isMultiple}
                formatGroupLabel={formatGroupLabel}
                loadOptions={this.loadOptions}
                onChange={this.handleChange}
                isSearchable={isSearchable}
                onBlur={setInactiveStyle}
                onFocus={setActiveStyle}
                placeholder=""
                value={this.state.selectedOptions}
                styles={reactSelectStyles}
            />
        )
    }
}
Control.propTypes = {
    onChange: PropTypes.func.isRequired,
    forID: PropTypes.string.isRequired,
    value: PropTypes.node,
    field: ImmutablePropTypes.map,
    fetchID: PropTypes.string,
    query: PropTypes.func.isRequired,
    queryHits: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
    hasActiveStyle: PropTypes.func,
    t: PropTypes.func,
}
