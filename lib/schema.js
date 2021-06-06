export default {
    properties: {
        url: { type: 'string' },
        multiple: { type: 'boolean' },
        min: { type: 'integer' },
        max: { type: 'integer' },
        display_field: { type: 'string' },
        value_field: { type: 'string' },
        data_path: { type: 'string' },
        refetch_url: { type: 'boolean' },
        fuzzy_search: { type: 'boolean' },
        fetch_options: {
            type: 'object',
            properties: {
                method: { type: 'string' },
                body: { type: 'string' },
                headers: {
                    type: 'object',
                }
            }
        },
        grouped_options: {
            type: 'object',
            properties: {
                display_field: { type: 'string' },
                value_field: { type: 'string' },
                data_path: { type: 'string' },
                flatten_singles: { type: 'boolean'}
            }
        }
    },
    required: ['url'],
}
