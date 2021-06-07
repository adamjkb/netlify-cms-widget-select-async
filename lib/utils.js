export function getOptionsFromInitialValue({ value, options, isMultiple }) {
    if (!options) return

    function $hasValue(item) { return item.value === this }

    if (isMultiple) {
        let arrayValues = value
        if (!value || !Array.isArray(value)) {
            arrayValues = value.toArray() || []
        }

        const selectedValues = arrayValues.map(({ value }) => {
            const result = options.find($hasValue, value)
            if (result) {
                return result
            }

            let nestedResults = []
            options.some(({ options: nestedOptions }) => {
                if (!nestedOptions) return false
                const nestedResult = nestedOptions.find($hasValue, value)
                if (nestedResult) {
                    nestedResults.push(nestedResult)
                    return true // cancel some iteration
                }
            })

            return nestedResults
        })

        if (selectedValues) {
            return selectedValues
        }

    } else {

        let selectedValue = options.find($hasValue, value)
        if (selectedValue) return selectedValue

        // dig deeper
        options.some(({ options: nestedOptions }, item) => {
            if (!nestedOptions) return
            const result = nestedOptions.find($hasValue, value)
            if (result) {
                selectedValue = result
                return true // break loop
            }
        })

        if (selectedValue) return selectedValue
    }
}



export function optionToString(option) {
    return option && option.value ? option.value : ''
}
