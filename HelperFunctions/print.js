function logBox(message) {
    var logBox = document.getElementById("log-box");
    logBox.innerHTML += message + "<br>";
    logBox.scrollTop = logBox.scrollHeight;
};

function printBest(iter, pop) {
    var best = [];
    let output = "";
    let city;
    let copy = pop[0].order.slice();
    rotate(copy);
    output = `${iter.toString()}: ${cityCoords[copy[0]]}`;
    for (city = 1; city < CITIES; city++) {
        output += `->${cityCoords[copy[city]]}`;
    }
    output += `->${cityCoords[copy[0]]} = ${pop[0].objective}`;
    best[0] = cityCoords[copy[0]];
    for (city = 1; city < CITIES; city++) {
        best[city] = cityCoords[copy[city]];
    }
    paint(best);
    document.getElementById("iterOutput").textContent = "Generation: " + iter + "/" + MAXITER;

    if (document.getElementById("genOutput").checked == true) {
        logBox(output);
    }

    document.getElementById("bestcost").textContent = "Best Cost: " + pop[0].objective;
}

function consoleLogDecorated(message) {
    let logBox = document.getElementById("log-box");
    let decoratedMessage = "<strong>" + message + "</strong>";
    logBox.innerHTML += "<p style='text-align: center'>" + decoratedMessage + "</p>";
    logBox.scrollTop = logBox.scrollHeight;
}

function cls(r, g, b) {
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ', 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function paint(best) {
// Cities
for (let i = 0; i < CITIES; i++) {
    ctx.beginPath();
    ctx.arc(best[i][0], best[i][1], 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#9e0000";
    ctx.strokeStyle = "#c71414";
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
}
// Links
ctx.strokeStyle = "#ff0000";
ctx.lineWidth = 2;
ctx.moveTo(best[0][0], best[0][1]);
for (let i = 0; i < CITIES - 1; i++) {
    ctx.lineTo(best[i + 1][0], best[i + 1][1]);
}
ctx.lineTo(best[0][0], best[0][1]);
ctx.stroke();
ctx.closePath();
}

function rotate(block) {
    const zeroIndex = block.indexOf(0);
    const start = block.splice(zeroIndex);
    const end = block.splice(0, zeroIndex);
    block.push(...start, ...end);
}