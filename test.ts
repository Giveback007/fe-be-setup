import { readFile } from 'fs-extra';
const { log } = console;

readFile('./frontend/index.html', 'utf8').then((x) => {
    const y = x.match(/\{{.+?\}}/g);
    [ '{{index.css}}', '{{manifest.webmanifest}}', '{{index.js}}' ];
    log(y)
});
