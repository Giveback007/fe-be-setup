import esbuild = require('esbuild');
import { remove, mkdir, copy } from 'fs-extra';
const { join } = require('path');
const sassPlugin = require('esbuild-plugin-sass');
const { log } = console;

async function build(type: 'frontend' | 'backend', toDir: string) {
    const t1 = Date.now();
    log(`🏗️  Building ${type}... 🔨 to '${join(toDir)}'`);

    // ### Clean previous build files
    await remove(toDir);
    await mkdir(toDir);

    // FRONTEND //
    if (type === 'frontend') {
        await copy('frontend/_pwa', join(toDir));
        await copy(join('frontend', 'index.html'), join(toDir, 'index.html'));

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
if (type === 'frontend' || type === 'backend')
    build(type, './dist')
    .then(() => process.exit())
    .catch((e) => {
        log(e);
        process.exit(1);
    });
