const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const sassPlugin = require('esbuild-plugin-sass');
const { log } = console;

async function build(type, dir) {
    const t1 = Date.now();
    log(`🏗️  Building ${type}... 🔨 to '${path.join(dir)}'`);

    // ### Clean previous build files
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });

    fs.readdir(dir, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(dir, file), err => {
            if (err) throw err;
          });
        }
    });

    // FRONTEND //
    if (type === 'frontend') {
        fs.copyFile('frontend/index.html', path.join(dir, 'index.html'), (err) => {
            if (err) throw err;
        });

        await esbuild.build({
            target: "es2016",
            incremental: false,
            entryPoints: ['frontend/index.tsx'],
            define: {
                "global": "window",
                "env": '"prod"'
            },
            outfile: path.join(dir, 'index.js'),
            bundle: true,
            minify: true,
            sourcemap: false,
            plugins: [sassPlugin()],
            loader: {
                '.png': 'file',
                '.svg': 'file',
                '.woff': 'text',
                '.woff2': 'text',
                '.ttf': 'text',
                '.eot': 'text',
                '.mp3': 'file'
            },
        })
    }

    // BACKEND //
    if (type === 'backend') {
        await esbuild.build({
            entryPoints: ['backend/server.ts'],
            outfile: path.join(dir, 'server.js'),
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
build(type, './dist')
.then(() => process.exit())
.catch((e) => {
    log(e);
    process.exit(1);
});
