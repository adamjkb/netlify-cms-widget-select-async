export default ({ mode }) => {
    if (mode !== 'deployment') {
        return {
            root: './example',
            build: {
                minify: 'terser',
                lib: {
                    entry: '../lib/index.js',
                    name: 'AsyncSelectWidget',
                    formats: ['es','umd'],
                    fileName: 'index'
                },
                outDir: '../dist'
            },
        }
    } else {
        return {
            root: './example',
            build: {
                minify: 'terser',
                outDir: '../deploy',
                emptyOutDir: true
            },
        }
    }
}
