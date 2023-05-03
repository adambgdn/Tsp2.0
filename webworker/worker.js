let i = 0;

onmessage = function (event) {
    if (event.data.command === 'start') {
        for (let j = 0; j < 2000000000; j++) {
            i = j;
        }
        postMessage({ command: 'loopFinished' }); 
    } else if (event.data.command === 'getIterValue') {
        postMessage({ command: 'iterValue', value: i });
    }
};