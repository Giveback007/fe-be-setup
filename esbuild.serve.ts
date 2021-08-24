/* For FrontEnd Localhost Development */
import historyApiFallback from 'connect-history-api-fallback';
import { copy, remove, mkdir } from 'fs-extra';
import { join } from 'path';
import esbuild from 'esbuild';
import sassPlugin = require('esbuild-plugin-sass');
import browserSync from "browser-sync";

const { log } = console;

// https://www.npmjs.com/package/@chialab/esbuild-plugin-html

let timeoutId: NodeJS.Timeout;
async function build(toDir: string) {
    clearTimeout(timeoutId);

    return new Promise((debounceDone) => timeoutId = setTimeout(async () => {
        const t1 = Date.now();

        await esbuild.build({
            target: "es2015",
            platform: 'browser',
            entryPoints: ['frontend/index.tsx'],
            incremental: true,
            watch: true,
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
        });
        
        debounceDone(void(0));

        const t2 = Date.now();
        log(`⚡ Built in ${t2 - t1}ms`);
    }, 250));
}

async function serve(toDir: string) {
    log('STARTING...');
    const bs = browserSync.create();

    // ### Clean previous build files
    await remove(toDir);
    await mkdir(toDir);
    await copy('frontend/public', join(toDir, 'public'));
    await copy('frontend/manifest.webmanifest', join(toDir, 'manifest.webmanifest'));

    bs.init({
        server: toDir,
        watch: true,
        middleware: [ historyApiFallback() as any ],
        reloadDelay: 0,
        reloadDebounce: 250,
        reloadOnRestart: true
    });

    await copy('frontend/index.html', join(toDir, 'index.html'));

    // BUILD WATCHER //
    bs.watch([
        'frontend/**/*.tsx',
        'frontend/**/*.ts',
        'frontend/**/*.js',
        'frontend/**/*.sass',
        'frontend/**/*.scss',
        'frontend/**/*.css',
    ] as any, {}, () => build(toDir));

    bs.watch('frontend/**/*.html', {}, () =>
        copy('frontend/index.html', join(toDir, 'index.html')));
}

serve('.cache').catch((e) => {
    log(e);
    process.exit(1);
});
