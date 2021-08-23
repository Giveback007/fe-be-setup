/* For FrontEnd Localhost Development */

const historyApiFallback = require('connect-history-api-fallback');
const { copy, remove, mkdir } = require('fs-extra');
const { join, resolve } = require('path');
const esbuild = require('esbuild');
const bs = require("browser-sync").create();
const sassPlugin = require('esbuild-plugin-sass');

const { log } = console;
const wait = (ms) => new Promise((res) => setTimeout(() => res(), ms));

let timeoutId;
let resolver;
let isBuilding;
let whenDoneBuild = new Promise(r => r());
async function build(toDir) {
    clearTimeout(timeoutId);
    if (!isBuilding) whenDoneBuild = new Promise(r => resolver = r)
    isBuilding = true;
    
    return new Promise((debounceDone) => timeoutId = setTimeout(async () => {
        const t1 = Date.now();

        await esbuild.build({
            target: "es2015",
            incremental: true,
            entryPoints: ['frontend/index.tsx'],
            define: {
                "global": "window",
                "env": '"dev"'
            },
            outfile: join(toDir, 'index.js'),
            bundle: true,
            sourcemap: 'inline',
            plugins: [sassPlugin()],
            loader: {
                '.png': 'file',
                '.svg': 'file',
                '.woff': 'text',
                '.woff2': 'text',
                '.ttf': 'text',
                '.eot': 'text',
                '.mp3': 'file'
            }
        });
        
        isBuilding = true;
        resolver();
        debounceDone();

        const t2 = Date.now();
        log(`⚡ Built in ${t2 - t1}ms`);
    }, 250));
}

async function serve(toDir) {
    log('STARTING...');

    // ### Clean previous build files
    await remove(toDir);
    await mkdir(toDir);

    bs.init({
        server: {
            baseDir: join(toDir),
            middleware: [ historyApiFallback() ],
            reloadDelay: 500,
            reloadDebounce: 2000,
            reloadOnRestart: true
      }
    });

    // BUILD WATCHER //
    bs.watch([
        'frontend/**/*.tsx',
        'frontend/**/*.ts',
        'frontend/**/*.js',
        'frontend/**/*.sass',
        'frontend/**/*.scss',
        'frontend/**/*.css',
    ], async (event, file) => build(toDir));
    
    // RELOAD WATCHERS //

    bs.watch([ // HTML //
        'frontend/**/*.html'
    ], async () => {
        await copy(join('frontend', 'index.html'), join(toDir, 'index.html'));
        bs.reload("*.html");
    });

    bs.watch([ // TS|JS //
        'frontend/**/*.tsx',
        'frontend/**/*.ts',
        'frontend/**/*.js'
    ], async () => {
        await whenDoneBuild;
        bs.reload("*.html");
    });

    bs.watch([ // CSS //
        'frontend/**/*.sass',
        'frontend/**/*.scss',
        'frontend/**/*.css',
    ], async () => {
        await whenDoneBuild;
        bs.reload("*.css")
    });
}

serve('.cache').catch((e) => {
    log(e);
    process.exit(1);
});
