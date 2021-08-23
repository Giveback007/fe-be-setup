/* For FrontEnd Localhost Development */

const historyApiFallback = require('connect-history-api-fallback');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const bs = require("browser-sync").create();
const sassPlugin = require('esbuild-plugin-sass');

const { log } = console;

const copyFile = (file, fromDir, toDir) => fs.copyFile(
    path.join(fromDir, file),
    path.join(toDir, file),
    (err) => { if (err) throw err; },
);

let isBuilding = false;
async function build(dir) {
    if (isBuilding) return;
    isBuilding = true;

    const t1 = Date.now();

    copyFile('index.html', 'frontend', dir);
    copyFile('manifest.webmanifest', 'frontend', dir);
    copyFile('service-worker.js', 'frontend', dir)

    await esbuild.build({
        target: "es2016",
        incremental: true,
        entryPoints: ['frontend/index.tsx'],
        define: {
            "global": "window",
            "env": '"dev"'
        },
        outfile: path.join(dir, 'index.js'),
        bundle: true,
        // minify: true,
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
    const t2 = Date.now();
    isBuilding = false;
    log(`⚡ Built in ${t2 - t1}ms`);
}

async function serve(dir) {
    log('STARTING...');

    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });

    // ### Clean previous build files
    fs.readdir(dir, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(dir, file), err => {
            if (err) throw err;
          });
        }
    });

    // initial build
    await build(dir);

    bs.init({
        server: {
            baseDir: path.join(dir),
            middleware: [ historyApiFallback() ],
            reloadDebounce: 5000
      }
    });

    bs.watch([
        'frontend/**/*.html',
        'frontend/**/*.tsx',
        'frontend/**/*.ts',
        'frontend/**/*.js',
    ], async (event, file) => {
        await build(dir);
        bs.reload("*.html")
    });

    bs.watch([
        'frontend/**/*.sass',
        'frontend/**/*.scss',
        'frontend/**/*.css',
    ], async (event, file) => {
        await build(dir);
        bs.reload("*.css")
    });
}

serve('.cache').catch((e) => {
    log(e);
    process.exit(1);
});
