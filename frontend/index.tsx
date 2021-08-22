import 'index.sass';

console.log('it works');
document.body.innerHTML = 'Talking with server...'

fetch('http://localhost:4000/', { mode: 'cors' }).then(async (res) => {
    const x = await res.json();

    document.body.innerHTML = `
        <h1>Frontend: IT WORKS!</h1>
        <h2>Backend: ${x === 'it works' ? x : '?'}</h2>
    `;
});
