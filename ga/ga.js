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

// The fix coordinates of the cities
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

function initialize() {
    canvas = $('#tsp-canvas')[0];
    ctx = canvas.getContext("2d");
    distances = createDistanceMatrix(cityCoords);
}

function solve() {
    CITIES = parseInt($("#cities").val());
    POPSIZE = parseInt($("#popsize").val());
    ELITES = parseInt($("#elites").val());
    MUTRATE = parseFloat($("#mutrate").val());
    MAXITER = parseInt($("#maxiter").val());
    consoleLogDecorated("Running... ");
    console.time("myTimer");

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
        $("#iterOutput").text("Iteration: " + iteration + "/" + MAXITER);
        clearInterval(motor);
        printBest(iteration, bestPopObj);
        consoleLogDecorated("End of the algorithm. ");
        console.timeEnd("myTimer");
        return;
    }
    printBest(iteration, bestPopObj);
    iteration++;
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

function stop() {
    clearInterval(motor);
    consoleLogDecorated("Stop button was pressed! ");
    consoleLogDecorated("End of the algorithm. ");
}

window.onload = initialize;
