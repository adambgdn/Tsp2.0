"use strict";

var CITIES = 26;
var GENERATIONS = 100;
var POPSIZE = 50;
var CLONES = 100;
var INFECTIONS = 8000;

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

//73 city
const varosokA = [480, 150, 160, 240, 250, 121, 655, 180, 120, 190, 222, 333, 510, 170, 480, 180, 144, 560, 660, 400, 405, 150, 410, 20, 640, 30, 45, 101, 158, 81, 348, 10, 58, 70, 345, 481, 186, 182, 250, 256, 354, 658, 600, 520, 350, 233, 123, 321, 231, 213, 234, 34, 200, 44, 548, 378, 590, 12, 130, 170, 52, 470, 93, 390, 410, 50, 370, 410, 0, 600, 610, 620, 580];
const varosokB = [350, 120, 230, 300, 270, 190, 310, 350, 400, 150, 470, 350, 555, 480, 120, 480, 577, 102, 108, 280, 200, 100, 500, 30, 50, 300, 78, 10, 170, 500, 28, 400, 77, 132, 152, 90, 210, 125, 290, 100, 412, 580, 42, 585, 540, 200, 12, 500, 360, 320, 189, 521, 23, 400, 370, 500, 550, 580, 40, 90, 128, 400, 470, 380, 378, 540, 80, 70, 280, 270, 390, 100, 10];
const distances = createDistanceMatrix(varosokA, varosokB);
var best = [];
var bestPopObj;
var population;
var iteration;
var canvas;
var ctx;
var motor;

class CHROMOSOME {
    constructor() {
        this.order = new Array(CITIES);
        this.fitness = 0;
        this.objective = 0;
    }
}

console.log = function (message) {
    var logBox = document.getElementById("log-box");
    logBox.innerHTML += message + "<br>";
    logBox.scrollTop = logBox.scrollHeight;
};

function initialize() {
    canvas = document.getElementById('tsp-canvas');
    ctx = canvas.getContext("2d");
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
    GENERATIONS = parseInt($("#generations").val());
    POPSIZE = parseInt($("#popsize").val());
    CLONES = parseInt($("#clones").val());
    INFECTIONS = parseInt($("#infections").val());
    consoleLogDecorated("Running... ");

    population = new Array(POPSIZE);
    for (let i = 0; i < population.length; i++) {
        population[i] = new CHROMOSOME;
    }
    iteration = 0;
    cls(255, 255, 190);
    init(population);
    bestPopObj = JSON.parse(JSON.stringify(population));
    bestPopObj[0].objective = 99999999999999;
    motor = setInterval(update, 10);
}

function update() {
    cls(255, 255, 190);
    if (iteration == 1) {
        bestPopObj = JSON.parse(JSON.stringify(population));
    }
    let transferredPopulation;

    //???????????????????
    //segment: CALCULATED, RANDOM GENERATED, OR INPUT PARAMETER?
    //???????????????????
    var segment = 5;

    objective(population);
    fitness(population);
    bacterialMutation(population, CLONES, segment);
    objective(population);
    fitness(population);
    twoOpt(population);
    objective(population);
    fitness(population);
    threeOpt(population);
    objective(population);
    fitness(population);
    transferredPopulation = transfer(population);
    objective(transferredPopulation);
    fitness(transferredPopulation);
    population = transferredPopulation;
    objective(population);
    fitness(population);

    if (population[0].objective <= bestPopObj[0].objective) {
        cls(255, 255, 190);
        bestPopObj = JSON.parse(JSON.stringify(population));
    }
    if (iteration == GENERATIONS) {
        document.getElementById("iterOutput").textContent = "Generation: " + iteration + "/" + GENERATIONS;

        ctx.fillStyle = 'rgba(' + 255 + ',' + 255 + ',' + 190 + ', 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        printBest(iteration, bestPopObj);

        clearInterval(motor);
        consoleLogDecorated("End of the algorithm. ");
        return;
    }
    printBest(iteration, bestPopObj);
    iteration++;
}

/* https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle */
function fisherYates(order) {
    for (let g1 = order.length - 1; g1 > 0; g1--) {
        let g2 = Math.floor(Math.random() * (g1 + 1));
        let tmp = order[g1];
        order[g1] = order[g2];
        order[g2] = tmp;
    }
}

function objective(pop) {
    for (let ind = 0; ind < pop.length; ind++) {
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

function objectiveForOne(pop) {
    let obj = 0,
        from,
        to;
    for (let gene = 0; gene < CITIES - 1; gene++) {
        from = pop.order[gene];
        to = pop.order[gene + 1];
        obj += distances[from][to];
    }
    from = pop.order[CITIES - 1];
    to = pop.order[0];
    obj += distances[from][to];
    pop.objective = obj;
}

function distance(p1, p2) {
    return distances[p1][p2];
}

function fitness(pop) {
    pop.sort(compare);
    for (let ind = 0; ind < pop.length; ind++) {
        pop[ind].fitness = (pop.length - ind) * (pop.length - ind);
    }
}

function bacterialMutation(pop, clones, segment) {
    for (let i = 0; i < pop.length; i++) {
        let segmentNumber = Math.floor(pop[i].order.length / segment);
        for (let sN = 0; sN < segmentNumber; sN++) {
            if ((segment * sN + segment) <= pop[i].order.length) {
                pop[i].order = mutate(pop[i], clones, segment, segment * sN)
            }
        }
    }
    return pop;
}

function mutate(actPop, clones, segment, segmentStart) {
    //creation of the clone baterien
    let beforeSegment = actPop.order.slice(0, segmentStart);
    let afterSegment = actPop.order.slice(segmentStart + segment);
    let segmentArray = actPop.order.slice(segmentStart, segmentStart + segment);

    let clonePopulation = new Array(clones);
    for (let i = 0; i < clonePopulation.length; i++) {
        clonePopulation[i] = new CHROMOSOME;
    }
    //the first clone has the reverse of the original segment
    clonePopulation[0].order = [...beforeSegment].concat(segmentArray.reverse(), ...afterSegment);

    //change randomly the order of vertices in the selected segment in the clones
    for (let i = 1; i < clones; i++) {
        //the random order of segment
        let orderOfSegment = [];
        for (let i = 0; i < segmentArray.length; i++) {
            orderOfSegment[i] = i;
        }
        fisherYates(orderOfSegment);

        let cloneOrder = [];
        let cloneSegment = [];

        //creation of the random segment
        for (let j = 0; j < orderOfSegment.length; j++) {
            cloneSegment[j] = segmentArray[orderOfSegment[j]];
        }
        //the new bacterium will consist of the part of before the segment, the segment (in arbitrary order), and the part after the segment
        clonePopulation[i].order = cloneOrder.concat([...beforeSegment], [...cloneSegment], [...afterSegment]);
    }
    //selecting the fittest from the clones
    objective(clonePopulation);
    fitness(clonePopulation);
    return clonePopulation[0].order;
}

function twoOpt(route) {
    for (let r = 0; r < route.length; r++) {
        let improved = true;
        while (improved) {
            improved = false;
            for (let i = 0; i < route[r].order.length - 2; i++) {
                for (let j = i + 2; j < route[r].order.length - 1; j++) {
                    var d1 = distance(route[r].order[i], route[r].order[i + 1]) + distance(route[r].order[j], route[r].order[j + 1]);
                    var d2 = distance(route[r].order[i], route[r].order[j]) + distance(route[r].order[i + 1], route[r].order[j + 1]);
                    if (d2 < d1) {
                        route[r].order = reverseSubroute(route[r].order, i + 1, j);
                        improved = true;
                    }
                }
            }
        }
    }
    return route;
}

function threeOpt(routes) {
    for (let r = 0; r < routes.length; r++) {
        var route = new CHROMOSOME;
        route.order = routes[r].order;
        let improved = true;
        while (improved) {
            improved = false;
            for (let i = 0; i < route.order.length - 2; i++) {
                for (let j = i + 2; j < route.order.length - 1; j++) {
                    for (let k = j + 2; k < route.order.length; k++) {
                        let tour = new CHROMOSOME;
                        tour.order = twoOptSwap(route.order.slice(), i, j, k);
                        objectiveForOne(tour);
                        objectiveForOne(route);
                        if (tour.objective < route.objective) {
                            route.order = tour.order;
                            improved = true;
                        }
                    }
                }
            }
        }

        routes[r].order = route.order;
    }
    
}
function twoOptSwap(tour, i, j, k) {
    const newTour = tour.slice(0, i + 1);
    newTour.push(...tour.slice(j, k).reverse());
    newTour.push(...tour.slice(i + 1, j));
    newTour.push(...tour.slice(k));
    return newTour;
}

function reverseSubroute(route, i, k) {
    // Reverse the subroute from i to k in place
    for (let j = i, l = k; j < l; j++, l--) {
        [route[j], route[l]] = [route[l], route[j]];
    }
    return route;
}

function transfer(pop) {
    let half = Math.ceil(pop.length / 2);
    let superiorPop = pop.slice(0, half);
    let inferiorPop = pop.slice(half);
    let transferredPop = new Array(INFECTIONS);
    for (let i = 0; i < transferredPop.length; i++) {
        transferredPop[i] = new CHROMOSOME;
    }
    for (let i = 0; i < INFECTIONS; i++) {
        let randomSuperior = superiorPop[Math.floor(Math.random() * superiorPop.length)];
        let randomInferior = inferiorPop[Math.floor(Math.random() * inferiorPop.length)];

        // A destinationPosition ne legyen nagyobb mint a randomInferior hossza
        // A start és a lenght ne legyen nagyobb mint a randomsuperior hossza -1
        let length = 4;
        let randStart = Math.floor(Math.random() * randomInferior.order.length);
        let destinationPosition = Math.floor(Math.random() * (randomInferior.order.length - randStart)) + randStart;
        transferredPop[i].order = geneTransfer(randomSuperior.order, randomInferior.order, randStart, length, destinationPosition);
    }
    objective(transferredPop);
    fitness(transferredPop);

    return transferredPop.slice(0, pop.length);
}


function geneTransfer(randomSuperior, randomInferior, start, length, destinationPos) {
    let gtransferChromosome = [];
    gtransferChromosome = [...randomInferior];

    let end = start + length;
    let segment = randomSuperior.slice(start, end);
    for (let i = 0; i < segment.length; i++) {
        gtransferChromosome.splice(destinationPos, 0, segment[i]);
    }
    for (let i = 0; i < segment.length; i++) {
        let originalIndex = gtransferChromosome.indexOf(segment[i], destinationPos + length);
        if (originalIndex != -1) {
            gtransferChromosome.splice(originalIndex, 1);
        } else {
            let originalIndex = gtransferChromosome.indexOf(segment[i], 0);
            gtransferChromosome.splice(originalIndex, 1);
        }
    }
    return gtransferChromosome;
}

function compare(ind1, ind2) {
    return ind1.objective - ind2.objective;
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
    document.getElementById("iterOutput").textContent = "Generation: " + iteration + "/" + GENERATIONS;

    if (document.getElementById("genOutput").checked == true) {
        console.log(output);
    }

    document.getElementById("bestcost").textContent = "Best Cost: " + pop[0].objective;
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

function reverse() {
    const { length: l } = array;
    for (let i = 0; i < Math.floor(l / 2); i++) {
        const temp = array[i];
        array[i] = array[l - i - 1];
        array[l - i - 1] = temp;
    };
    return array;
};

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