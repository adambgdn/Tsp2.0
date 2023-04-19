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

document.getElementById('cities').addEventListener('input', calculateFactorial);
const submitButton = document.getElementById('solve');
const downloadBtn = document.getElementById('download-btn');

const varosokA = [480, 150, 160, 240, 250, 121, 655, 180, 120, 190, 222, 333, 510, 170, 480, 180, 144, 560, 660, 400, 405, 150, 410, 20, 640, 30, 45, 101, 158, 81, 348, 10, 58, 70, 345, 481, 186, 182, 250, 256, 354, 658, 600, 520, 350, 233, 123, 321, 231, 213, 234, 34, 200, 44, 548, 378, 590, 12, 130, 170, 52, 470, 93, 390, 410, 50, 370, 410, 0, 600, 610, 620, 580];
const varosokB = [350, 120, 230, 300, 270, 190, 310, 350, 400, 150, 470, 350, 555, 480, 120, 480, 577, 102, 108, 280, 200, 100, 500, 30, 50, 300, 78, 10, 170, 500, 28, 400, 77, 132, 152, 90, 210, 125, 290, 100, 412, 580, 42, 585, 540, 200, 12, 500, 360, 320, 189, 521, 23, 400, 370, 500, 550, 580, 40, 90, 128, 400, 470, 380, 378, 540, 80, 70, 280, 270, 390, 100, 10];

console.log = function (message) {
    var logBox = document.getElementById("log-box");
    logBox.innerHTML += message + "<br>";
    logBox.scrollTop = logBox.scrollHeight;
};

function initialize() {
    canvas = document.getElementById('tsp-canvas');
    ctx = canvas.getContext("2d");
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
        current[i] = [varosokA[i], varosokB[i]];
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
        }
        temperature *= COOLING_RATE;
        document.getElementById("temperatureCalc").textContent = "Temperature: " + temperature;
        document.getElementById("bestcost").textContent = "Best Cost: " + best_cost;
    if (temperature <= ABSOLUTE_ZERO) {
        clearInterval(motor);
        paint();
        consoleLogDecorated("End of the algorithm. ");
        return;
    }
    paint();

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
        console.log(output);
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

window.onload = initialize;
