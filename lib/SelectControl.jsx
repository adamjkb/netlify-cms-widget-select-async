import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import AsyncSelect from 'react-select/async'
import { find, isEmpty, last, debounce } from 'lodash'
import { List, Map, fromJS } from 'immutable'
import { reactSelectStyles } from 'netlify-cms-ui-default/dist/esm/styles'
import fuzzy from 'fuzzy'


const fieldDefaults = {
    value_field: 'value',
    label_field: 'label',
    multiple: false,
    required: true,
    cache_options: false,
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

function convertToOption(raw) {
    if (typeof raw === 'string') {
        return { label: raw, value: raw }
    }
    return Map.isMap(raw) ? raw.toJS() : raw
}

function getSelectedValue({ value, options, isMultiple }) {
    if (isMultiple) {
        const selectedOptions = List.isList(value) ? value.toJS() : value

        if (!selectedOptions || !Array.isArray(selectedOptions)) {
            return null
        }

        return selectedOptions
            .map(i => options.find(o => o.value === (i.value || i)))
            .filter(Boolean)
            .map(convertToOption)
    } else {
        return find(options, ['value', value]) || null
    }
}

export class Control extends React.Component {

    constructor(props) {
        super(props)
        this.allOptions = ''
        this.state = {
            initialFetch: true,
            cachedOptions: null
        }

        this.loadOptions = debounce(this.loadOptions.bind(this), 500)
        this.getOptions = this.getOptions.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    async fetchUrl({ term }) {
        const { field } = this.props
        const url = field.get('url')
        const refetchUrl = field.get('refetch_url', fieldDefaults.refetch_url)

        const method = field.getIn(['fetch_options','method'], fieldDefaults.fetch_options.method)
        const headers = field.getIn(['fetch_options','headers'], fieldDefaults.fetch_options.headers)
        const body = field.getIn(['fetch_options','body'], fieldDefaults.fetch_options.body)
        const paramsFunction = field.getIn(['fetch_options', 'params_function'])

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
         *  If options are cached and refetch_url is set to false skip calling
         *  external url on each new typed term
         */
        if (!this.state.initialFetch && !refetchUrl && this.state.cachedOptions) {
            return this.state.cachedOptions
        }

        try {
            const res = await fetch(fetchParams.url, fetchParams.options)
                .then(data => data.json())
                .then(json => fromJS(json))

            if (!refetchUrl) {
                await this.setState({
                    cachedOptions: res,
                    initialFetch: false
                })
            }

            return res
        } catch (e) {
            console.log(e)
        }
    }

    async getOptions(term) {
        const { field } = this.props
        const valueField = field.get('value_field', fieldDefaults.value_field)
        const displayField = field.get('display_field', fieldDefaults.display_field)
        const searchField = field.get('search_field') || displayField
        const filterFunction = field.get('filter')
        const dataKey = field.get('data_key')

        const res = await this.fetchUrl({ term })

        let mappedData = res

        // Allow for drill down.
        if (dataKey) {
            mappedData = res.get(dataKey)
        }

        if (typeof filterFunction === 'function') {
            mappedData = mappedData.filter(filterFunction)
        }

        let mappedOptions = mappedData.map(entry => ({
            value: entry.getIn(valueField.split('.')),
            label: entry.getIn(displayField.split('.')),
            data: entry,
        }))

        if (term) {
            mappedOptions = fuzzy
                .filter(term, mappedOptions, {
                    extract: el => el.data.getIn(searchField.split('.')),
                })
                .sort((entryA, entryB) => entryB.score - entryA.score)
                .map(entry => entry.original)
        } else {
            mappedOptions = mappedOptions.toArray()
        }

        return mappedOptions
    }

    componentDidUpdate(prevProps) {
        /**
       * Load extra post data into the store after first query.
       */
        // if (this.didInitialSearch) return
        // const { value, field, forID, onChange } = this.props
        //
    }

    handleChange(selectedOption) {
        const { onChange, field } = this.props
        let value

        if (Array.isArray(selectedOption)) {
            value = selectedOption.map(optionToString)
            onChange(fromJS(value), {
                [field.get('name')]: {
                    [field.get('collection')]: {
                        [last(value)]:
                !isEmpty(selectedOption) && last(selectedOption).data,
                    },
                },
            })
        } else {
            value = optionToString(selectedOption)
            onChange(value, {
                [field.get('name')]: {
                    [field.get('collection')]: { [value]: selectedOption.data },
                },
            })
        }
    }

    // parseHitOptions(hits) {
    //     const { field } = this.props
    //     const valueField = field.get('value_field')
    //     const displayField = field.get('display_fields') || field.get('value_field')
    //
    //     return hits.map(hit => ({
    //         data: hit.data,
    //         value: hit.data[valueField],
    //         label: List.isList(displayField)
    //             ? displayField
    //                 .toJS()
    //                 .map(key => hit.data[key])
    //                 .join(' ')
    //             : hit.data[displayField],
    //     }))
    // }

    loadOptions(term, callback) {
        this.getOptions(term).then(options => {
            if (!this.allOptions && !term) {
                this.allOptions = options
                // this.setState({allOptions: options})
            }

            callback(options)
            // Refresh state to trigger a re-render.
            // this.setState({ ...this.state })
        })
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
        const options = this.allOptions

        const selectedValue = getSelectedValue({
            options,
            value,
            isMultiple,
        })


        return (
            <AsyncSelect
                defaultOptions
                className={classNameWrapper}
                cacheOptions={true}
                inputId={forID}
                isClearable={isClearable}
                isMulti={isMultiple}
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
