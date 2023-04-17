"use strict";

var CITIES = 35;
var POPSIZE = 500;
var ELITES = 1;
var MUTRATE = 0.8;
var MAXITER = 8000;

//73 city
const varosokA = [480, 150, 160, 240, 250, 121, 655, 180, 120, 190, 222, 333, 510, 170, 480, 180, 144, 560, 660, 400, 405, 150, 410, 20, 640, 30, 45, 101, 158, 81, 348, 10, 58, 70, 345, 481, 186, 182, 250, 256, 354, 658, 600, 520, 350, 233, 123, 321, 231, 213, 234, 34, 200, 44, 548, 378, 590, 12, 130, 170, 52, 470, 93, 390, 410, 50, 370, 410, 0, 600, 610, 620, 580];
const varosokB = [350, 120, 230, 300, 270, 190, 310, 350, 400, 150, 470, 350, 555, 480, 120, 480, 577, 102, 108, 280, 200, 100, 500, 30, 50, 300, 78, 10, 170, 500, 28, 400, 77, 132, 152, 90, 210, 125, 290, 100, 412, 580, 42, 585, 540, 200, 12, 500, 360, 320, 189, 521, 23, 400, 370, 500, 550, 580, 40, 90, 128, 400, 470, 380, 378, 540, 80, 70, 280, 270, 390, 100, 10];
var best = [];
var canvas;
var ctx;
var motor;
var iteration;
var ppa;
var ppb;

function initialize() {
    console.log(varosokA, varosokB);
    canvas = document.getElementById('tsp-canvas');
    ctx = canvas.getContext("2d");
}

class GENOTYPE {
    constructor() {
        this.order = new Array(CITIES);
        this.fitness = 0;
        this.objective = 0;
    }
}

$(document).ready(function () {
    $("#solve").click(function () {
        CITIES = parseInt($("#cities").val());
        POPSIZE = parseInt($("#popsize").val());
        ELITES = parseInt($("#elites").val());
        MUTRATE = parseFloat($("#mutrate").val());
        MAXITER = parseInt($("#maxiter").val());
        solve();
    });
});

function solve() {
    ppa = Array.from({ length: POPSIZE }, () => new GENOTYPE());
    ppb = new Array(POPSIZE);
    for (let i = 0; i < ppb.length; i++) {
        ppb[i] = new GENOTYPE;
    }
    iteration = 0;     
    init(ppa);    
    motor = setInterval(update, 10);
}

function update() {
    iteration++;
    if (iteration >= MAXITER) {
        clearInterval(motor);
        return;
    }
    cls(255, 255, 190);
    objective(ppa);
    fitness(ppa);
    printBest(iteration, ppa);
    crossover(ppa, ppb);
    swap(ppa, ppb);   
}

function cls(r, g, b) {
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ', 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function init(pop) {
    for (let ind = 0; ind < POPSIZE; ind++) {
        for (let gene = 0; gene < CITIES; gene++) {
            pop[ind].order[gene] = gene;
        }
        fisherYates(pop[ind].order);
    }
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
    const distances = createDistanceMatrix(varosokA, varosokB);

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
            //fekete leves
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
    var cityCoords = [];
    for (let varosok = 0; varosok < CITIES; varosok++) {
        cityCoords[varosok] = [varosokA[varosok], varosokB[varosok]]
    }
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
    paint();
    console.log(output);
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

function createDistanceMatrix(cityX, cityY) {
    const numCities = cityX.length;
    const distances = new Array(numCities);
    for (let i = 0; i < numCities; i++) {
        distances[i] = new Array(numCities);
        for (let j = 0; j < numCities; j++) {
            const distance = euclideanDistance(cityX[i], cityY[i], cityX[j], cityY[j]);
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
        ctx.fillStyle = "#0000ff";
        ctx.strokeStyle = "#000";
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1;
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

window.onload = initialize;
