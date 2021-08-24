/* For FrontEnd Localhost Development */
import historyApiFallback from 'connect-history-api-fallback';
import { copy, remove, mkdir } from 'fs-extra';
import { join } from 'path';
import fs from 'fs';
import esbuild = require('esbuild');
import sassPlugin = require('esbuild-plugin-sass');
const browserSync = require("browser-sync");

const { log } = console;

// https://www.npmjs.com/package/@chialab/esbuild-plugin-html

let timeoutId: NodeJS.Timeout;
let resolver: (x: unknown) => void;
let isBuilding: boolean;
let whenDoneBuild = new Promise(r => r(void(0)));
async function build(toDir: string) {
    clearTimeout(timeoutId);
    if (!isBuilding) whenDoneBuild = new Promise(r => resolver = r)
    isBuilding = true;

    return new Promise((debounceDone) => timeoutId = setTimeout(async () => {
        const t1 = Date.now();

        await esbuild.build({
            target: "es2015",
            platform: 'browser',
            entryPoints: ['frontend/index.tsx'],
            incremental: true,
            define: {
                "global": "window",
                "env": '"dev"'
            },
            outdir: join(toDir),
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
        })
        
        isBuilding = true;
        resolver(void(0));
        debounceDone(void(0));

        const t2 = Date.now();
        log(`⚡ Built in ${t2 - t1}ms`);
    }, 250));
}

async function serve(toDir: string) {
    log('STARTING...');

    // ### Clean previous build files
    await remove(toDir);
    await mkdir(toDir);
    await copy('frontend/_pwa', join(toDir));

    const bs = browserSync.create();

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
    ], async () => {
        build(toDir)
    });
    
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
