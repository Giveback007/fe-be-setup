import './index.sass';
import './init';

const root = document.getElementById('root') as HTMLElement;
root.innerHTML = 'Looking for server...';

console.log('environment:', env);
async function data() {
    try {
        const ac = new AbortController();
        setTimeout(() => ac.abort(), 5000);

        const res = await fetch('http://localhost:4000/', { mode: 'cors', signal: ac.signal });
        return await res.json();
    } catch {
        return null;
    }
}

async function run() {
    const x = await data();

    root.innerHTML = `
        <h1>Frontend: IT WORKS!!</h1>
        <h2>Backend: ${x === 'it works' ? x : '?'}</h2>
    `;
}

run();
