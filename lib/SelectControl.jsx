import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import AsyncSelect from 'react-select/async'
import { get, find, debounce } from 'lodash'
import { List, Map, fromJS } from 'immutable'
import { reactSelectStyles } from 'netlify-cms-ui-default/dist/esm/styles'
import Fuse from 'fuse.js'

import { formatGroupLabel } from './styles.jsx'

export class Control extends React.Component {

    constructor(props) {
        super(props)
        this.fuse = null

        this.state = {
            allOptions: null,
        }

        this.loadOptions = debounce(this.loadOptions.bind(this), 100, { leading: true, trailing:true, maxWait: 300 })
        this.fetchUrl = this.fetchUrl.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.fuzzySearch = this.fuzzySearch.bind(this)
        this.getFieldValues = this.getFieldValues.bind(this)
        this.processRawOption = this.processRawOption.bind(this)
        this.getOptions = this.getOptions.bind(this)
    }

    handleChange(selectedOption) {
        const { onChange, field } = this.props
        const isMultiple = field.get('multiple', fieldDefaults.multiple)
        const isEmpty = isMultiple ? !selectedOption?.length : !selectedOption

        if (field.get('required') && isEmpty && isMultiple) {
            onChange(List())
        } else if (isEmpty) {
            onChange(null)
        } else if (isMultiple) {
            const options = selectedOption.map(optionToString)
            onChange(fromJS(options))
        } else {
            onChange(optionToString(selectedOption))
        }
    }

    /**
     * Get field values
     */
    getFieldValues() {
        const { field } = this.props

        // Data options
        const valueField = field.get('value_field', fieldDefaults.value_field)
        const displayField = field.get('display_field', fieldDefaults.display_field)
        // const searchField = field.get('search_field') || displayField
        // Grouped options
        const isGroupedOptions = !!field.get('grouped_options')
        const groupedValueField = field.getIn(['grouped_options', 'value_field'], fieldDefaults.value_field)
        const groupedDisplayField = field.getIn(['grouped_options', 'display_field'], fieldDefaults.display_field)
        // const groupedSearchField = field.getIn(['grouped_options', 'search_field']) || groupedDisplayField
        const groupedDataPath = field.getIn(['grouped_options', 'data_path'])
        // Fetch options
        const url = field.get('url')
        const refetchUrl = field.get('refetch_url', fieldDefaults.refetch_url)

        const method = field.getIn(['fetch_options','method'], fieldDefaults.fetch_options.method)
        const headers = field.hasIn(['fetch_options','headers']) ? field.getIn(['fetch_options','headers']).toObject() : fieldDefaults.fetch_options.headers
        const body = field.getIn(['fetch_options','body'], fieldDefaults.fetch_options.body)
        const paramsFunction = field.getIn(['fetch_options', 'params_function'])
        const dataPath = field.get('data_path')

        return {
            valueField,
            displayField,
            // searchField,
            isGroupedOptions,
            groupedValueField,
            groupedDisplayField,
            // groupedSearchField,
            groupedDataPath,
            url,
            refetchUrl,
            method,
            headers,
            body,
            paramsFunction,
            dataPath,
        }
    }

    fuzzySearch(term, data) {
        const processResults = (results) => results.length > 0 ? results.map(({ item }) => item) : []
        const {
            isGroupedOptions

        } = this.getFieldValues()

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
            dataPath,
        } = this.getFieldValues()


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

        /**
         * f
         */
        try {
            const res = await fetch(fetchParams.url, fetchParams.options)
                .then(data => data.json())
                .then(json => fromJS(dataPath ? get(json, dataPath.split('.'), json): json)) // drill JSON if selected

            return res
        } catch (e) {
            console.log(e)
        }
    }

    processRawOption(rawOptions){
        const {
            valueField,
            displayField,
            isGroupedOptions,
            groupedValueField,
            groupedDisplayField,
            groupedDataPath,
        } = this.getFieldValues()

        let processedOptions

        if (isGroupedOptions) {
            processedOptions = rawOptions.map(entry => ({
                label: entry.getIn(displayField.split('.')),
                ...(
                    // add options object key if size is greater than 1
                    entry.hasIn(groupedDataPath.split('.')) && entry.getIn(groupedDataPath.split('.')).count() > 1 ?
                        {
                            options: entry.getIn(groupedDataPath.split('.')).map(optionsEntry => {
                                return {
                                    value: optionsEntry.getIn(groupedValueField.split('.')),
                                    label: optionsEntry.getIn(groupedDisplayField.split('.')),
                                    groupData: optionsEntry
                                }
                            })
                        }
                    // Otherwise merge the label with its parent's label
                        :
                        {
                            value: entry.getIn([...groupedDataPath.split('.'), 0,...groupedValueField.split('.')]),
                            label: entry.getIn(displayField.split('.')) + /* Seperator */': ' + entry.getIn([...groupedDataPath.split('.'), 0,...groupedDisplayField.split('.')]),
                            groupData: entry.getIn([...groupedDataPath.split('.'), 0])
                        }
                ),
                // If groupedDataPath retrieves no result fallback to parents value
                ...(
                    !entry.hasIn(groupedDataPath.split('.')) &&
                    {
                        value: entry.getIn(valueField.split('.'))
                    }
                ),
                data: entry
            }))
            processedOptions = processedOptions
                .toArray()
                .map(item => ({
                    ...item,
                    ...(item.options && {
                        options: item.options.toArray()
                    })

                }))

        } else {
            processedOptions = rawOptions.map(entry => ({
                value: entry.getIn(valueField.split('.')),
                label: entry.getIn(displayField.split('.')),
                data: entry,
            })).toArray()
        }
        return processedOptions
    }

    async getOptions(term) {
        const { refetchUrl } = this.getFieldValues()

        // no options in-state or refetch url with each term
        if (!this.state.allOptions || refetchUrl) {
            // fetch options
            const rawOptions = await this.fetchUrl({ term })

            // process options -> store in state
            await this.setState({
                allOptions: this.processRawOption(rawOptions)
            })
        }

        if (term) {
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
            value,
            field,
            forID,
            classNameWrapper,
            setActiveStyle,
            setInactiveStyle,
        } = this.props

        const isMultiple = field.get('multiple', fieldDefaults.multiple)
        const isClearable = !field.get('required', fieldDefaults.required) || isMultiple

        const selectedValue = getSelectedValue({
            options: this.state.allOptions,
            value,
            isMultiple,
        })

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
                isSearchable
                onBlur={setInactiveStyle}
                onFocus={setActiveStyle}
                placeholder=""
                value={selectedValue}
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
}


const fieldDefaults = {
    value_field: 'value',
    label_field: 'label',
    multiple: false,
    required: true,
    refetch_url: true,
    fetch_options: {
        headers: {},
        method: 'GET',
        body: undefined
    }
}


function optionToString(option) {
    return option && option.value ? option.value : ''
}

function getSelectedValue({ value, options, isMultiple }) {
    if (!options) return

    if (isMultiple) {
        const selectedOptions = List.isList(value) ? value.toJS() : value

        if (!selectedOptions || !Array.isArray(selectedOptions)) {
            return null
        }

        let selectedValues = []
        selectedOptions.forEach(value => {
            const result = options.find(o => o.value === value)
            if (result) {
                selectedValues.push(result)
                return
            }
            options.some(({options: nestedOptions, label}) => {
                if (!nestedOptions) return
                const result = find(nestedOptions, ['value', value])
                if (result) {
                    const formatedResult = {
                        ...result,
                        label: label + ': ' + (result.label || result.value)
                    }
                    selectedValues.push(formatedResult)
                    return true
                }
            })
        })

        if (selectedValues) {
            return selectedValues
        }

    } else {
        let selectedValue = find(options, ['value', value])

        if (selectedValue) return selectedValue

        // dig deeper
        options.some(({ options: nestedOptions }, item) => {
            if (!nestedOptions) return
            const result = find(nestedOptions, ['value', value])
            if (result) {
                selectedValue = result
                return true // break loop
            }
        })

        if (selectedValue) {
            return selectedValue
        } else {
            return null
        }
    }
}
