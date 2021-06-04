export default ({ mode }) => {
    if (mode !== 'deployment') {
        return {
            root: './dev',
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
            root: './dev',
            build: {
                minify: 'terser',
                outDir: '../deploy',
                emptyOutDir: true
            },
        }
    }
}
