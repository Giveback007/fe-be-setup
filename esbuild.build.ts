import esbuild = require('esbuild');
import { remove, mkdir, copy } from 'fs-extra';
import pwaAssetGenerator from 'pwa-asset-generator';
import { join } from 'path';
const sassPlugin = require('esbuild-plugin-sass');
const { log } = console;

// https://github.com/onderceylan/pwa-asset-generator
async function pwaAssets() {
    // apple splash screens
    await pwaAssetGenerator.generateImages(
        "./frontend/assets/squarelogo.png",
        "./dist/public",
        {
            scrape: true,
            background: "linear-gradient(228deg, rgba(26,26,26,1) 0%, rgba(26,26,26,1) 25%, rgba(55,120,194,1) 66%)",
            opaque: true,
            splashOnly: true,
            log: true,
            noSandbox: true,
            manifest: 'dist/manifest.webmanifest',
            index: 'dist/index.html'
        }
    );

    // icons
    await pwaAssetGenerator.generateImages(
        "./frontend/assets/squarelogo.png",
        "./dist/public",
        {
            scrape: true,
            opaque: true,
            padding: '0%',
            iconOnly: true,
            log: false,
            manifest: 'dist/manifest.webmanifest',
            index: 'dist/index.html',
            favicon: true,
            noSandbox: true,
            maskable: true,
        }
    );
}

async function build(type: 'frontend' | 'backend', toDir: string) {
    const t1 = Date.now();
    log(`🏗️ Building ${type}... 🔨 to '${join(toDir)}'`);

    // ### Clean previous build files
    await remove(toDir);
    await mkdir(toDir);

    // FRONTEND //
    if (type === 'frontend') {
        const esbuildTime = Date.now();
        await copy('frontend/manifest.webmanifest', join(toDir, 'manifest.webmanifest'));
        await copy('frontend/index.html', join(toDir, 'index.html'));

        await esbuild.build({
            target: "es2015",
            incremental: false,
            platform: 'browser',
            entryPoints: ['frontend/index.tsx'],
            define: {
                "global": "window",
                "env": '"prod"'
            },
            outdir: join(toDir),
            bundle: true,
            minify: true,
            // splitting: true, // https://esbuild.github.io/api/#splitting
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
        log(` - [esbuild] | ${Date.now() - esbuildTime}ms`);

        const logoTime = Date.now();
        await pwaAssets();
        log(` - [pwa-asset-generator] | ${Date.now() - logoTime}ms`);
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
    log(`✔️ Built in ${((t2 - t1) / 1000).toFixed(2)}s`);
}

const [type] = process.argv.slice(2);
if (type === 'frontend' || type === 'backend')
    build(type, './dist')
    .then(() => process.exit())
    .catch((e) => {
        log(e);
        process.exit(1);
    });
