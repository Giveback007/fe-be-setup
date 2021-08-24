import { readFile } from 'fs-extra';
const { log } = console;

readFile('./frontend/index.html', 'utf8').then((html) => {
    const search = '<!-- {{{ICONS}}} -->';

    const idx_1 = html.indexOf(search) + search.length;
    const idx_2 = html.indexOf(search, idx_1);

    let newHtml = html.substr(0, idx_1) + 'STUFF' + html.substr(idx_2);
    
    newHtml //?
    // let metaStr = '';
    // Object.values(htmlMeta).forEach(x => metaStr += x)

    // log(newHtml)
    // const newHtml = html.replace(noIconsMeta, metaStr);


});
