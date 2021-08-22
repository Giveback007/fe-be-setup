/* For FrontEnd Localhost Development */

const historyApiFallback = require('connect-history-api-fallback');
const esbuild = require('esbuild');
const bs = require("browser-sync").create();
const sassPlugin = require('esbuild-plugin-sass')

const { log } = console;

// Frontend
esbuild.serve({
    servedir: 'www',
    port: 8000,
}, {
    target: "es2016",
    entryPoints: ['frontend/index.tsx'],
    outdir: 'www',
    bundle: true,
    sourcemap: true,
    // sourcemap: 'development' === process.env.NODE_ENV
    plugins: [sassPlugin()],
    loader: {
        '.png': 'dataurl',
        '.svg': 'text',
        '.woff': 'text',
        '.woff2': 'text',
        '.ttf': 'text',
        '.eot': 'text',
        '.mp3': 'dataurl'
    }, // 'development' === process.env.NODE_ENV ||| 'file' or 'dataurl'
}).then(server => {
    log('STARTING...');
    
    bs.init({
        server: {
            baseDir: "./frontend",
            middleware: [ historyApiFallback() ],
            // reloadOnRestart: true,
            // reloadDelay: 500,
            reloadDebounce: 5000,
      }
    });

    bs.watch([
        'frontend/**/*.html',
        'frontend/**/*.tsx',
        'frontend/**/*.ts',
    ], (event, file) => bs.reload("*.html"));

    bs.watch(['frontend/**/*.sass'], (event, file) => bs.reload("*.css"));
}).catch((e) => {
    log(e);
    process.exit(1);
});
