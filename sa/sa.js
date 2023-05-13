var temperature = 0.1;
var ABSOLUTE_ZERO = 5e-3;
var COOLING_RATE = 0.999;
var CITIES = 26;
var current = [];
var best = [];
var best_cost = 0;

$(document).ready(function () {
    calculateFactorial();
    $("#solve").click(function () {
        $("#solve").prop("disabled", true);
        solve();
    });
    $("#stop").click(function () {
        stop();
    });
});


var cityCoords = [[480, 350], [150, 120], [160, 230], [240, 300], [250, 270], [121, 190], [655, 310], [180, 350],
[120, 400], [190, 150], [222, 470], [333, 350], [510, 555], [170, 480], [480, 120], [180, 480],
[144, 577], [560, 102], [660, 108], [400, 280], [405, 200], [150, 100], [410, 500], [20, 30],
[640, 50], [30, 300], [45, 78], [101, 10], [158, 170], [81, 500], [348, 28], [10, 400], [58, 77],
[70, 132], [345, 152], [481, 90], [186, 210], [182, 125], [250, 290], [256, 100], [354, 412],
[658, 580], [600, 42], [520, 585], [350, 540], [233, 200], [123, 12], [321, 500], [231, 360],
[213, 320], [234, 189], [34, 521], [200, 23], [44, 400], [548, 370], [378, 500], [590, 550],
[12, 580], [130, 40], [170, 90], [52, 128], [470, 400], [93, 470], [390, 380], [410, 378],
[50, 540], [370, 80], [410, 70], [0, 280], [600, 270], [610, 390], [620, 100], [580, 10]];
var distances;

function initialize() {
    canvas = $('#tsp-canvas')[0];
    ctx = canvas.getContext("2d");
    distances = createDistanceMatrix(cityCoords);
}

//init();
function randomInt(n) {
    return Math.floor(Math.random() * (n)); 
}

function deep_copy(array, to) { 
    var i = array.length;
    while (i--) {
        to[i] = [array[i][0], array[i][1]];
    }
}

function getCost(route) {
    var cost = 0;
    for (var i = 0; i < CITIES - 1; i++) { 
        cost = cost + getDistance(route[i], route[i + 1]);
    }
    cost = cost + getDistance(route[0], route[CITIES - 1]);
    return cost;
}

function getDistance(p1, p2) { 
    del_x = p1[0] - p2[0];
    del_y = p1[1] - p2[1];
    return Math.sqrt((del_x * del_x) + (del_y * del_y));
}

function neighborSwap(route, i, j) {
    var neighbor = [];
    deep_copy(route, neighbor);
    while (i != j) {
        var t = neighbor[j];
        neighbor[j] = neighbor[i];
        neighbor[i] = t;

        i = (i + 1) % CITIES;
        if (i == j)
            break;
        j = (j - 1 + CITIES) % CITIES;
    }
    return neighbor;
}

function acceptanceProbability(current_cost, neighbor_cost) {
    if (neighbor_cost < current_cost)
        return 1;
    return Math.exp((current_cost - neighbor_cost) / temperature);
}

function initSa() {
    for (var i = 0; i < CITIES; i++) {
        current[i] = cityCoords[i];
    }
    deep_copy(current, best); 
    best_cost = getCost(best);
}

function solve() {
    temperature = parseFloat($("#temperature").val());
    ABSOLUTE_ZERO = parseFloat($("#abszero").val());
    COOLING_RATE = parseFloat($("#coolrate").val());
    CITIES = parseInt($("#cities").val());
    consoleLogDecorated("Running... ");

    iteration = 0;
    cls(255, 255, 190);
    initSa();
    motor = setInterval(update, 10);   
}

function update() {
    cls(255, 255, 190);
    var current_cost = getCost(current); 
    var k = randomInt(CITIES);
    var l = randomInt(CITIES);
    var neighbor = neighborSwap(current, k, l);
    var neighbor_cost = getCost(neighbor);
    if (Math.random() < acceptanceProbability(current_cost, neighbor_cost)) {
        deep_copy(neighbor, current);
        current_cost = getCost(current); 
    }
    if (current_cost < best_cost) {
        deep_copy(current, best);
        best_cost = current_cost;
        paintSa();
        $("#bestcost").text("Best Cost: " + best_cost);
    }
    $("#temperatureCalc").text("Temperature: " + temperature);
    temperature *= COOLING_RATE;
    if (temperature <= ABSOLUTE_ZERO) {
        clearInterval(motor);
        consoleLogDecorated("End of the algorithm. ");
        $("#solve").prop("disabled", false);
        return;
    }
    paintSa();
}

function paintSa() {
    // Cities
    for (var i = 0; i < CITIES; i++) {
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
    for (var i = 0; i < CITIES - 1; i++) {
        ctx.lineTo(best[i + 1][0], best[i + 1][1]);
    }
    ctx.lineTo(best[0][0], best[0][1]);
    ctx.stroke();
    ctx.closePath();

    let output = "";
    output = `${temperature.toString()}: ${best[0]}`;
    for (city = 1; city < CITIES; city++) {
        output += `->${best[city]}`;
    }
    output += `->${best[0]} = ${best_cost}`;
    if ($("#genOutput").is(":checked")) {
        logBox(output);
    }
}

function stop() {
    clearInterval(motor);
    consoleLogDecorated("Stop button was pressed! ");
    consoleLogDecorated("End of the algorithm. ");
    $("#solve").prop("disabled", false);
}

window.onload = initialize;
