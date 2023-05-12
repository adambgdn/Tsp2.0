var gaAlgorithm = Module.cwrap(
    "gaAlgorithm",
    "string",
    ["number", "number", "number", "number", "number"],
);
var outputDiv = document.getElementById("log-box");
var canvas;
var ctx;

$(document).ready(function () {
    calculateFactorial();
    $("#solve").click(function () {
        run_wasm();
    });
});

function run_wasm() {
    var startTime = performance.now();
    canvas = document.getElementById('tsp-canvas');
    ctx = canvas.getContext("2d");
    ctx.fillStyle = 'rgb(255, 255, 190)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    CITIES = parseInt($("#cities").val());
    POPSIZE = parseInt($("#popsize").val());
    ELITES = parseInt($("#elites").val());
    MUTRATE = parseFloat($("#mutrate").val());
    MAXITER = parseInt($("#maxiter").val());

    var result = gaAlgorithm(CITIES, POPSIZE, ELITES, MUTRATE, MAXITER);
    var endTime = performance.now();
    var runtime = (endTime - startTime);

    document.querySelector("#log-box").innerHTML = result;
    document.querySelector("#runtime").innerHTML = "Runtime: " + runtime + " ms";

    const sum = parseInt(result.split('=')[1]);
    const coordinates = result
        .split('=')[0]
        .split('->')
        .map(coord => coord.split(',').map(Number));

    console.log('Sum:', sum);
    console.log('Coordinates:', coordinates);

    paintWasm(coordinates, CITIES);
    document.querySelector("#bestcost").innerHTML = "Best Cost: " + sum + " km";

}

function paintWasm(best, cities) {
    // Cities
    for (let i = 0; i < cities; i++) {
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
    for (let i = 0; i < cities - 1; i++) {
        ctx.lineTo(best[i + 1][0], best[i + 1][1]);
    }
    ctx.lineTo(best[0][0], best[0][1]);
    ctx.stroke();
    ctx.closePath();
}