export default {
    config: {
        backend: {
            name: 'test-repo'
        },
        load_config_file: false,
        local_backend: import.meta.env.MODE !== 'deployment',
        media_folder: '/example/assets/images/',
        label: 'Pages',
        name: 'pages',
        description: '',
        delete: false,
        editor: {
            preview: false
        },
        collections: [
            {

                label: 'Pages',
                name: 'pages',
                delete: false,
                editor:{ preview: false },
                files: [
                    {
                        label           :'Demo',
                        name            :'demo',
                        delete          :false,
                        file            :'dev/data/example.json',
                        extension       :'json',
                        fields: [
                            {
                                label: 'Simple usage',
                                name: 'simple_usage',
                                widget: 'select-async',
                                hint: 'Using a simple REST API',
                                url: 'https://fakestoreapi.com/products',
                                value_field: 'id',
                                display_field: 'title',
                            },
                            {
                                label: 'Advanced usage',
                                name: 'advanced_usage',
                                widget: 'select-async',
                                hint: 'POST request, headers, and body. Groupping nested options.',
                                url: 'https://graphql.myshopify.com/api/graphql',
                                value_field: 'node.value',
                                display_field: 'node.label',
                                data_path: 'data.products.edges',
                                multiple: true,
                                min: 1,
                                max: 3,
                                grouped_options: {
                                    data_path: 'node.options.edges',
                                    value_field: 'node.id',
                                    display_field: 'node.title',
                                },
                                fetch_options: {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-Shopify-Storefront-Access-Token': 'dd4d4dc146542ba7763305d71d1b3d38'
                                    },
                                    method: 'POST',
                                    body: '{"query": "query allProducts{ products(first:10) { edges { node { label: title value: id options: variants(first:3) { edges { node { id title } } } } } } }"}',
                                }
                            },
                            {
                                label: 'Dynamic fetch request body',
                                name: 'custom_fetch_options',
                                widget: 'select-async',
                                hint: 'Using `fetch_options.params_function` to format the fetch request. Server-side filtering.',
                                url: 'https://graphql.myshopify.com/api/graphql',
                                value_field: 'node.value',
                                display_field: 'node.label',
                                data_path: 'data.products.edges',
                                refetch_url: true,
                                fuzzy_search: false,
                                required: false,
                                fetch_options: {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-Shopify-Storefront-Access-Token': 'dd4d4dc146542ba7763305d71d1b3d38'
                                    },
                                    method: 'POST',
                                    body: '{"query": "query allProducts{ products(first:10) { edges { node { label: title value: id options: variants(first:3) { edges { node { id title } } } } } } }"}',
                                    params_function: ({ term, url, ...rest }) => ({
                                        url,
                                        options: {
                                            ...rest,
                                            body: JSON.stringify({
                                                query: `
                                                    query allProducts(
                                                        $myCustomQuery: String
                                                    ) {
                                                        products(
                                                            first: 15
                                                            query: $myCustomQuery
                                                        ) {
                                                            edges {
                                                                node {
                                                                    label: title
                                                                    value: id
                                                                }
                                                            }
                                                        }
                                                    }
                                                `,
                                                variables: {
                                                    'myCustomQuery': `title:${term}*`
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
}
