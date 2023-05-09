"use strict";

var CITIES = 35;
var POPSIZE = 500;
var ELITES = 1;
var MUTRATE = 0.8;
var MAXITER = 800;

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
var best = [];
var canvas;
var ctx;
var motor;
var iteration;
var ppa;
var ppb;
var bestPopObj;


class GENOTYPE {
    constructor() {
        this.order = new Array(CITIES);
        this.fitness = 0;
        this.objective = 0;
    }
}

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

function init(pop) {
    for (let ind = 0; ind < POPSIZE; ind++) {
        for (let gene = 0; gene < CITIES; gene++) {
            pop[ind].order[gene] = gene;
        }
        fisherYates(pop[ind].order);
    }
}

function solve() {
    CITIES = parseInt($("#cities").val());
    POPSIZE = parseInt($("#popsize").val());
    ELITES = parseInt($("#elites").val());
    MUTRATE = parseFloat($("#mutrate").val());
    MAXITER = parseInt($("#maxiter").val());
    consoleLogDecorated("Running... ");

    ppa = Array.from({ length: POPSIZE }, () => new GENOTYPE());
    ppb = Array.from({ length: POPSIZE }, () => new GENOTYPE());

    iteration = 0;
    cls(255, 255, 190);
    init(ppa);
    bestPopObj = JSON.parse(JSON.stringify(ppa));
    bestPopObj[0].objective = Number.MAX_SAFE_INTEGER;
    motor = setInterval(update, 10);
}

function update() {
    cls(255, 255, 190);
    objective(ppa);
    fitness(ppa);
    crossover(ppa, ppb);
    swap(ppa, ppb);
    if (ppa[0].objective <= bestPopObj[0].objective) {
        cls(255, 255, 190);
        bestPopObj = JSON.parse(JSON.stringify(ppa));
    }
    if (iteration == MAXITER) {
        document.getElementById("iterOutput").textContent = "Iteration: " + iteration + "/" + MAXITER;
        clearInterval(motor);
        printBest(iteration, bestPopObj);
        consoleLogDecorated("End of the algorithm. ");
        return;
    }
    printBest(iteration, bestPopObj);
    iteration++;
}

function cls(r, g, b) {
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ', 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}



/* https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle */
function fisherYates(order) {
    for (let g1 = CITIES - 1; g1 > 0; g1--) {
        let g2 = Math.floor(Math.random() * (g1 + 1));
        let tmp = order[g1];
        order[g1] = order[g2];
        order[g2] = tmp;
    }
}

function objective(pop) {
    for (let ind = 0; ind < POPSIZE; ind++) {
        let obj = 0,
            from,
            to;
        for (let gene = 0; gene < CITIES - 1; gene++) {
            from = pop[ind].order[gene];
            to = pop[ind].order[gene + 1];
            obj += distances[from][to];
        }
        from = pop[ind].order[CITIES - 1];
        to = pop[ind].order[0];
        obj += distances[from][to];
        pop[ind].objective = obj;
    }
}

function compare(ind1, ind2) {
    return ind1.objective - ind2.objective;
}

function fitness(pop) {
    pop.sort(compare);
    for (let ind = 0; ind < POPSIZE; ind++) {
        pop[ind].fitness = (POPSIZE - ind) * (POPSIZE - ind);
    }
}

function copyElites(popOld, popNew) {
    for (let i = 0; i < POPSIZE; i++) {
        popNew[i].order = popOld[i].order.slice();
        //ha fitness es objectet is másolni akarunk
        popNew[i].fitness = popOld[i].fitness;
        popNew[i].objective = popOld[i].objective;
    }
}

function selection(pop) {
    let sumFitness = 0;
    for (let ind = 0; ind < POPSIZE; ind++) {
        sumFitness += pop[ind].fitness;
    }
    let rnd = Math.floor(Math.random() * sumFitness) + 1;
    let partFitness = 0, ind = 0;
    for (ind = 0; partFitness < rnd; ind++) {
        partFitness += pop[ind].fitness;
    }
    return ind - 1;
}

function mutation(ind) {
    const pos1 = Math.floor(Math.random() * CITIES);
    let pos2;
    let tmp;
    do {
        pos2 = Math.floor(Math.random() * CITIES);
    } while (pos1 === pos2); // Different positions needed
    tmp = ind.order[pos1];
    ind.order[pos1] = ind.order[pos2];
    ind.order[pos2] = tmp;
}

// PMX https://www.slideshare.net/guest9938738/genetic-algorithms
function crossover(popOld, popNew) {
    let ind, par1, par2, pos1, pos2, gene;
    copyElites(popOld, popNew);
    for (ind = ELITES; ind < POPSIZE; ind++) {
        par1 = selection(popOld);
        do {
            par2 = selection(popOld);
        } while (par1 === par2);
        pos1 = Math.floor(Math.random() * CITIES);
        pos2 = Math.floor(Math.random() * (CITIES - pos1)) + pos1;
        // Step1: copy matching section elements of par1 into offspring to the same position
        for (gene = 0; gene < CITIES; gene++) {
            if (gene >= pos1 && gene <= pos2) {
                popNew[ind].order[gene] = popOld[par1].order[gene];
            } else {
                popNew[ind].order[gene] = -1;
            }
        }
        // Step2: copy missing elements of par2's matching section into offspring
        for (gene = pos1; gene <= pos2; gene++) {
            var isAlleleMissing = false;
            var i = pos1;
            do {
                if (popOld[par1].order[i] == popOld[par2].order[gene]) {
                    isAlleleMissing = true;
                }
                i++;
            } while (!isAlleleMissing && i <= pos2)

            if (!isAlleleMissing) { // Allele is missing
                var where = gene;
                do {
                    var j = 0;
                    var found = false;
                    do {
                        if (popOld[par2].order[j] == popOld[par1].order[where]) {
                            where = j;
                            found = true;
                        }
                        j++;
                    } while (!found && j <= CITIES)
                } while (where >= pos1 && where <= pos2)
                popNew[ind].order[where] = popOld[par2].order[gene];
            }
        }
        // Step3: fill all non-defined alleles of the offspring using par2 data
        for (gene = 0; gene < CITIES; gene++) {
            if (popNew[ind].order[gene] === -1) {
                popNew[ind].order[gene] = popOld[par2].order[gene];
            }
        }
        if (Math.random() < MUTRATE) mutation(popNew[ind]);
    }
}

//the order of the array is the same, but start with 0
function rotate(block) {
    const zeroIndex = block.indexOf(0);
    const start = block.splice(zeroIndex);
    const end = block.splice(0, zeroIndex);
    block.push(...start, ...end);
}

function printBest(iter, pop) {
    var best = [];
    let output = "";
    let city;
    //var copy = pop[0].order; ez sajnos nem jó mert referenciát másol
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
    document.getElementById("iterOutput").textContent = "Generation: " + iteration + "/" + MAXITER;

    if (document.getElementById("genOutput").checked == true) {
        logBox(output);
    }
    document.getElementById("bestcost").textContent = "Best Cost: " + pop[0].objective;
}

function deep_copy(array, to) {
    var i = array.length;
    while (i--) {
        to[i] = [array[i][0], array[i][1]];
    }
}

function swap(pop1, pop2) {
    for (let i = 0; i < POPSIZE; i++) {
        let tmpF = pop1[i].fitness;
        let tmpO = pop1[i].objective;
        pop1[i].fitness = pop2[i].fitness;
        pop1[i].objective = pop2[i].objective;
        pop2[i].fitness = tmpF;
        pop2[i].objective = tmpO;
        for (let j = 0; j < CITIES; j++) {
            let tempOr = pop1[i].order[j];
            pop1[i].order[j] = pop2[i].order[j];
            pop2[i].order[j] = tempOr;
        }
    }
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

function paint(best) {
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
}

function consoleLogDecorated(message) {
    var logBox = document.getElementById("log-box");
    var decoratedMessage = "<strong>" + message + "</strong>";
    logBox.innerHTML += "<p style='text-align: center'>" + decoratedMessage + "</p>";
    logBox.scrollTop = logBox.scrollHeight;
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
