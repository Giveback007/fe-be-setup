import esbuild = require('esbuild');
const { remove, mkdir } = require('fs-extra');
const { join } = require('path');
const sassPlugin = require('esbuild-plugin-sass');
import htmlPlugin from '@chialab/esbuild-plugin-html';
const { log } = console;

async function build(type: 'frontend' | 'backend', toDir: string) {
    const t1 = Date.now();
    log(`🏗️  Building ${type}... 🔨 to '${join(toDir)}'`);

    // ### Clean previous build files
    await remove(toDir);
    await mkdir(toDir);

    // FRONTEND //
    if (type === 'frontend') {
        // copy('frontend/index.html', join(toDir, 'index.html'));
        // copy('frontend/_pwa', join(toDir))
        // ['index.html', 'public'].forEach((file) => {
        //     copy(join('frontend', file), join(toDir, file))
        // });

        await esbuild.build({
            target: "es2015",
            incremental: false,
            platform: 'browser',
            entryPoints: ['frontend/index.html'],
            assetNames: '[dir]/[name].[hash]',
            chunkNames: '[dir]/[name].[hash]',
            entryNames: '[dir]/[name].[hash]',
            define: {
                "global": "window",
                "env": '"prod"'
            },
            outfile: join(toDir, 'index.js'),
            bundle: true,
            minify: true,
            plugins: [sassPlugin(), htmlPlugin()],
            loader: {
                '.png': 'file',
                '.svg': 'file',
                '.woff': 'text',
                '.woff2': 'text',
                '.ttf': 'text',
                '.eot': 'text',
                '.mp3': 'file'
            },
        });


    }

    // BACKEND //
    if (type === 'backend') {
        await esbuild.build({
            entryPoints: ['backend/server.ts'],
            outfile: join(toDir, 'server.js'),
            target: 'node14',
            platform: 'node',
            bundle: false,
            sourcemap: true,
        });
    }

    const t2 = Date.now();
    log(`⚡ Built in ${t2 - t1}ms`);
}

const [type] = process.argv.slice(2);
build(type as 'frontend' | 'backend', './dist')
.then(() => process.exit())
.catch((e) => {
    log(e);
    process.exit(1);
});
