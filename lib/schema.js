export default {
    properties: {
        multiple: { type: 'boolean' },
        url: { type: 'string' },
        display_field: { type: 'string' },
        value_field: { type: 'string' },
        data_path: { type: 'string' },
        refetch_url: { type: 'boolean' },
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
            }
        }
    },
    required: ['url'],
}
