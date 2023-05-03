const worker = new Worker('worker.js');
const start = document.querySelector('#start');
const show = document.querySelector('#show');

worker.onmessage = function (event) {
    console.log(event.data); 
};

start.addEventListener('click', function () {
    worker.postMessage({ command: 'start' }); 
});

show.addEventListener('click', function () {
    worker.postMessage({ command: 'getIterValue' }); 
});