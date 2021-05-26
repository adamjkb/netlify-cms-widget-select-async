import {getBabelOutputPlugin} from '@rollup/plugin-babel'

export default {
    root: './example',
    build: {
        minify: false,
        lib: {
            entry: '../lib/index.js',
            name: 'Widget',
            formats: ['umd']
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            // external: ['react-dom', '@emotion/core', '@emotion/styled'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                // globals: {
                //     'netlify-cms': 'CMS',
                //     react: 'React',
                //     'react-dom': 'ReactDOM',
                //     'prop-types': 'PropTypes',
                //     immutable: 'Immutable',
                //     'react-immutable-proptypes': 'ImmutablePropTypes',
                //     classnames: 'classNames',
                //     'create-react-class': 'createClass',
                //     '@emotion/core': 'EmotionCore',
                //     '@emotion/styled': 'EmotionStyled'
                // }
            }
        },
        outDir: './dist'
    },
    plugins: [
        getBabelOutputPlugin(
            { presets: [
                ['@babel/preset-env', { modules: 'umd' }],
                ['@babel/preset-react'],
            ],
            allowAllFormats: true
            }
        )
    ],
}
