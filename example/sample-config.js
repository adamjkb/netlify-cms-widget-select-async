export default {
    config: {
        backend: {
            name: 'git-gateway',
            branch:'main'
        },
        slug: {
            clean_accents: true
        },
        load_config_file: false,
        local_backend: true,
        site_url: 'http://localhost:3000',
        display_url: 'http://localhost:3000',
        media_folder: '/example/assets/images/',
        public_folder: '/',
        label: 'Pages',
        name: 'pages',
        description: '',
        delete: false,
        editor:{ preview: false },
        collections: [
            {

                label: 'Pages',
                name: 'pages',
                description: '',
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
                            // {
                            //     label: 'Select',
                            //     name: 'select',
                            //     widget: 'select',
                            //     options: [
                            //         { label: 'Option 1', value: 'opt-1' },
                            //         { label: 'Option 2', value: 'opt-2' },
                            //         { label: 'Option 3', value: 'opt-3' },
                            //         { label: 'Option 4', value: 'opt-4' },
                            //     ]
                            // },
                            {
                                label: 'Select but external',
                                name: 'select-external',
                                widget: 'select-ext',
                                url: 'https://jsonplaceholder.typicode.com/users',
                                value_field: 'id',
                                display_field: 'name',
                            },
                            // {
                            //     label: 'Json',
                            //     name: 'yes',
                            //     widget: 'create-select',
                            //     url: 'https://jsonplaceholder.typicode.com/users',
                            //     attribute: 'name',
                            //     mode: 'json',
                            // },
                        ]
                    }
                ]
            }
        ]
    },
}
