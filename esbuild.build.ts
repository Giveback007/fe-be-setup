import esbuild = require('esbuild');
import { remove, mkdir, copy, readFile, writeFile } from 'fs-extra';
import pwaAssetGenerator from 'pwa-asset-generator';
import { join } from 'path';
const sassPlugin = require('esbuild-plugin-sass');
const { log } = console;

// favicon-cheat-sheet: https://github.com/audreyfeldroy/favicon-cheat-sheet
// pwaAssetGenerator: https://github.com/onderceylan/pwa-asset-generator
async function pwaAssets(toDir: string) {
    // apple splash screens
    const splash = await pwaAssetGenerator.generateImages(
        "frontend/assets/squarelogo.png", toDir,
        {
            scrape: true,
            background: "linear-gradient(228deg, rgba(26,26,26,1) 0%, rgba(26,26,26,1) 25%, rgba(55,120,194,1) 66%)",
            opaque: true,
            splashOnly: true,
            manifest: 'frontend/manifest.webmanifest',
            pathOverride: 'public'
        }
        
    );

    // icons
    const icons = await pwaAssetGenerator.generateImages(
        "./frontend/assets/squarelogo.png", toDir,
        {
            scrape: true,
            opaque: true,
            padding: '0%',
            iconOnly: true,
            manifest: 'frontend/manifest.webmanifest',
            favicon: true,
            maskable: true,
            pathOverride: 'public'
        }
    );

    const htmlMeta = { ...splash.htmlMeta, ...icons.htmlMeta};
    const html = await readFile('./frontend/index.html', 'utf8')
    const search = '<!-- {{{ICONS}}} -->';

    const idx_1 = html.indexOf(search) + search.length;
    const idx_2 = html.indexOf(search, idx_1);
    
    let metaStr = '';
    Object.values(htmlMeta).forEach(x => metaStr += x)
    
    const newHtml = html.substr(0, idx_1) + '\n' + metaStr + html.substr(idx_2);
    await writeFile('./frontend/index.html', newHtml);
}

async function build(type: 'frontend' | 'backend', toDir: string) {
    if (process.env.NETLIFY) log('running netlify!');

    // ### Clean previous build files
    await remove(toDir);
    await mkdir(toDir);

    // FRONTEND //
    if (type === 'frontend') {
        await copy(join(type, 'public'), join(toDir, 'public'));
        await copy(join(type, 'manifest.webmanifest'), join(toDir, 'manifest.webmanifest'));
        await copy(join(type, 'index.html'), join(toDir, 'index.html'));

        await esbuild.build({
            target: "es2015",
            incremental: false,
            platform: 'browser',
            entryPoints: [join('frontend', 'index.tsx')],
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
    }

    // BACKEND //
    if (type === 'backend') {
        await esbuild.build({
            entryPoints: [join(type, 'server.ts')],
            outfile: join(toDir, 'server.js'),
            target: 'node14',
            platform: 'node',
            bundle: false,
            sourcemap: true,
        });
    }

    
}

const [type, toDir] = process.argv.slice(2);

if (type && toDir) (async () => {
    const t1 = Date.now();
    log(`🏗️ Building ${type}... 🔨 to '${join(toDir)}'`);
    
    if (type === 'frontend' || type === 'backend')
        await build(type, toDir).catch((e) => {
            log(e);
            process.exit(1);
        });
    
    if (type === 'logos')
        await pwaAssets(toDir).catch((e) => {
            log(e);
            process.exit(1);
        });

    const t2 = Date.now();
    log(`✔️ Built in ${((t2 - t1) / 1000).toFixed(2)}s`);
})();
