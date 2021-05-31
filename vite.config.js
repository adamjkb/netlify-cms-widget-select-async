export default {
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
