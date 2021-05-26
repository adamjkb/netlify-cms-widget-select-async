import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import AsyncSelect from 'react-select/async'
import { find, isEmpty, last, debounce } from 'lodash'
import { List, Map, fromJS } from 'immutable'
import { reactSelectStyles } from 'netlify-cms-ui-default/dist/netlify-cms-ui-default.js'
import fuzzy from 'fuzzy'

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
]

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
        // this.state = {
        //     colours: colours
        // }
        this.loadOptions = this.loadOptions.bind(this)
    }
    async loadOptions(term) {
        console.log(term)
        const { field } = this.props
        const url = field.get('url')

        const res = await fetch(url).then(res => res.json())
        console.log(res)

        return res.map(({id, name}) => ({value: id, label: name}))

    }



    render() {
        const {
            forID,
            classNameWrapper,
            setActiveStyle,
            setInactiveStyle,
        } = this.props
        console.log(this.props)
        return (
            <AsyncSelect
                inputId={forID}
                defaultOptions
                loadOptions={this.loadOptions}
                options={options}
                className={classNameWrapper}
                onFocus={setActiveStyle}
                onBlur={setInactiveStyle}
                styles={reactSelectStyles}
            />
        )
    }
    static propTypes = {
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
};
}
