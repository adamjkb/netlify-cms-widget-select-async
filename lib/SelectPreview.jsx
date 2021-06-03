import PropTypes from 'prop-types'
import React from 'react'
import { List } from 'immutable'
import ImmutablePropTypes from 'react-immutable-proptypes'

function ListPreview({ values }) {
    return (
        <ul>
            {values.map((value, idx) => (
                <li key={idx}>{value}</li>
            ))}
        </ul>
    )
}

ListPreview.propTypes = {
    values: PropTypes.oneOfType([PropTypes.string, ImmutablePropTypes.list]),
}

function SelectPreview({ value }) {
    return (
        <div>
            {value && (List.isList(value) ? <ListPreview values={value} /> : value)}
            {!value && null}
        </div>
    )
}

SelectPreview.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, ImmutablePropTypes.list]),
}

export default SelectPreview
