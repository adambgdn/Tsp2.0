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
        solve();
    });
    $("#stop").click(function () {
        stop();
    });
});

const submitButton = document.getElementById('solve');
const downloadBtn = document.getElementById('download-btn');

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

function logBox(message) {
    var logBox = document.getElementById("log-box");
    logBox.innerHTML += message + "<br>";
    logBox.scrollTop = logBox.scrollHeight;
};

function initialize() {
    canvas = document.getElementById('tsp-canvas');
    ctx = canvas.getContext("2d");
    distances = createDistanceMatrix(cityCoords);
}

//init();
function randomInt(n) {
    return Math.floor(Math.random() * (n)); // 0 és n közötti random, egész szám
}

function deep_copy(array, to) { // tömb másolása másik tömbbe
    var i = array.length;
    while (i--) {
        to[i] = [array[i][0], array[i][1]];
    }
}

function getCost(route) {
    var cost = 0;
    for (var i = 0; i < CITIES - 1; i++) { // i:0-25
        cost = cost + getDistance(route[i], route[i + 1]); // const = const + deep_copy tömb[i] és [i+1] (azt követõ) tagjának a távolsága (getDistance), az összes egymást követõ város távolsága, teljes út hossza kivéve az utolsó és elsõ pont közötti távolság
    }
    cost = cost + getDistance(route[0], route[CITIES - 1]); // const = const + deep_copy tömb[0] és [25] tagjának a távolsága (getDistance), az összes út hosszához hozzáadjuk az utolsó és elsõ város közötti út hosszát
    return cost;
}

function getDistance(p1, p2) { // matek tétel: két pont távolsága megegyezik a pontok koordináta különbségeinek négyzete, összeadva, majd az egész gyök alatt
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

function init() {
    // feltöltjük a current tömböt a városok x és y koordinátáival
    for (var i = 0; i < CITIES; i++) {
        current[i] = cityCoords[i];
    }
    deep_copy(current, best); // current tömböt deep copyzzuk a best (kezdetben üres) tömbbe
    best_cost = getCost(best); // a best_constra beállítjuk a deep_copy teljes úthosszát
}

function solve() {
    temperature = parseFloat($("#temperature").val());
    ABSOLUTE_ZERO = parseFloat($("#abszero").val());
    COOLING_RATE = parseFloat($("#coolrate").val());
    CITIES = parseInt($("#cities").val());
    consoleLogDecorated("Running... ");

    iteration = 0;
    cls(255, 255, 190);
    init();
    motor = setInterval(update, 10);   
}

function update() {
    cls(255, 255, 190);
    var current_cost = getCost(current); // a current_costra beállítjuk az eredti tömb teljes úthosszát
    var k = randomInt(CITIES); // k és l = randomInt(26) városok száma közötti (0 és 26) random, egész szám
    var l = randomInt(CITIES);
    var neighbor = neighborSwap(current, k, l); // copyzunk egy neighbor tömböt ahol már lesznek cserélve elemek (random k és l)
    var neighbor_cost = getCost(neighbor); // a neighbor tömb teljes úthossza
    if (Math.random() < acceptanceProbability(current_cost, neighbor_cost)) { // ha itt egyet kapunk vissza mert a neighbor_cost kisebb (vagyis jobb) lett, mint a current_cost, akkor teljesül az if. Ha nem egyet kapunk vissza az "acceptanceProbability" függvénynél, akkor is van esély arra, hogy belép az if-be
        deep_copy(neighbor, current); // mivel a neighbor tömb jobb ezért ezt átmásoljuk a current tömbbe
        current_cost = getCost(current); // frissítjük a current_cost a current tömb teljes úthosszával
    }
    if (current_cost < best_cost) { // ha a current_cost a best_cost-nál is jobb, akkor ezt másoljuk a best tömbbe és best_cost-ra ennek az úthosszát állítjuk be
        deep_copy(current, best);
        best_cost = current_cost;
        paint();
        document.getElementById("bestcost").textContent = "Best Cost: " + best_cost;
    }
    document.getElementById("temperatureCalc").textContent = "Temperature: " + temperature;
    temperature *= COOLING_RATE;
    if (temperature <= ABSOLUTE_ZERO) {
        clearInterval(motor);
        consoleLogDecorated("End of the algorithm. ");
        return;
    }
    paint();
}

function euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function createDistanceMatrix(cityCoords) {
    const numCities = cityCoords.length;
    const distances = new Array(numCities);
    for (let i = 0; i < numCities; i++) {
        distances[i] = new Array(numCities);
        for (let j = 0; j < numCities; j++) {
            const distance = euclideanDistance(cityCoords[i][0], cityCoords[i][1], cityCoords[j][0], cityCoords[j][1]);
            distances[i][j] = distance;
        }
    }
    return distances;
}

function paint() {
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
    if (document.getElementById("genOutput").checked == true) {
        logBox(output);
    }
}

function consoleLogDecorated(message) {
    var logBox = document.getElementById("log-box");
    var decoratedMessage = "<strong>" + message + "</strong>";
    logBox.innerHTML += "<p style='text-align: center'>" + decoratedMessage + "</p>";
    logBox.scrollTop = logBox.scrollHeight;
}

function cls(r, g, b) {
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ', 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function stop() {
    clearInterval(motor);
    consoleLogDecorated("Stop button was pressed! ");
    consoleLogDecorated("End of the algorithm. ");
}

function calculateFactorial() {
    const num = document.getElementById('cities').value;
    if (num < 0) {
        document.getElementById('factorial').textContent = 'Error: Input must be a non-negative integer.';
        return;
    }
    let factorial = 1;
    for (let i = 1; i <= BigInt(num); i++) {
        factorial *= i;
    }
    document.getElementById('factorial').textContent = `All possible solutions for ${num} cities: ${factorial}.`;
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT') {
            event.preventDefault();
            solve();
            return;
        }
        event.preventDefault();
        solve();
    }
});

downloadBtn.addEventListener('click', () => {
    const logbox = document.getElementById('log-box');
    const logData = logbox.textContent;
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    a.click();
    URL.revokeObjectURL(url);
});

const inputField = document.getElementById("cities");

inputField.addEventListener("change", function () {
    calculateFactorial();
    const enteredValue = parseInt(inputField.value);
    const maxValue = parseInt(inputField.getAttribute("max"));
    const minValue = parseInt(inputField.getAttribute("min"));

    if (enteredValue > maxValue) {
        alert("Maximum allowed value for Cities is " + maxValue);
        inputField.value = maxValue;
    }
    if (enteredValue < minValue) {
        alert("Minimum allowed value for Cities is " + minValue);
        inputField.value = minValue;
    }
});

window.onload = initialize;
