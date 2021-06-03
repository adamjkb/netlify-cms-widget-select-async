export default {
    config: {
        backend: {
            name: 'git-gateway',
            branch:'main'
        },
        load_config_file: false,
        local_backend: true,
        media_folder: '/example/assets/images/',
        public_folder: '/example/assets/public/',
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
                        label           :'Home',
                        name            :'home',
                        delete          :false,
                        file            :'example/data/home.json',
                        extension       :'json',
                        fields: [
                            {
                                label: 'Title',
                                name: 'title',
                                widget: 'string',
                            },
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
                                hint: 'Using GraphQL query',
                                url: 'https://graphql.myshopify.com/api/graphql',
                                value_field: 'node.value',
                                display_field: 'node.label',
                                data_path: 'data.products.edges', // path=a.0.b.c
                                refetch_url: true,
                                multiple: true,
                                grouped_options: {
                                    data_path: 'node.options.edges', // data position related to the parent object
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
                                    // @{type} function
                                    // {params}
                                    /**
                                     *  A function creating the fetch params object
                                     *  @param {Object} opts - Object composed of default or set values
                                     *  @param {string} opts.term - Search term entered to filter results from input field
                                     *  @param {string} opts.url - URL
                                     *  @param {string} opts.headers - Headers | default: {}
                                     *  @param {string} opts.body - Body
                                     *  @param {string} opts.method - Method | default: 'GET'
                                     *  @returns {Object} object of url and options
                                     */
                                    // params_function: ({ term, url, ...rest }) =>
                                    //     ({
                                    //         url,
                                    //         options: {
                                    //             ...rest,
                                    //             body: JSON.stringify({
                                    //                 query: `
                                    //                     query allProducts {
                                    //                         products(first: 100) {
                                    //                         edges {
                                    //                             node {
                                    //                                 label: title
                                    //                                 value: id
                                    //                                 options: variants(first: 20) {
                                    //                                     edges {
                                    //                                         node {
                                    //                                             id
                                    //                                             title
                                    //                                         }
                                    //                                     }
                                    //                                 }
                                    //                             }
                                    //                         }
                                    //                         }
                                    //                     }
                                    //                 `,
                                    //                 variables: {}
                                    //             })
                                    //         }
                                    //     }) // returns a fetch object
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
}
