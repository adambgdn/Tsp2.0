"use strict";

var CITIES = 73;
var MAXITER = 4000;
var POPSIZE = 10;
var CLONES = 3;
var INFECTIONS = 4;
var MUTATESEGMENTLENGTH = 4;
var TRANSFERSEGMENTLENGTH = 35;

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
var bestPopObj;
var population;
var iteration;
var canvas;
var ctx;
var motor;

class CHROMOSOME {
    constructor() {
        this.order = new Array(CITIES);
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
    MAXITER = parseInt($("#generations").val());
    POPSIZE = parseInt($("#popsize").val());
    CLONES = parseInt($("#clones").val());
    INFECTIONS = parseInt($("#infections").val());
    MUTATESEGMENTLENGTH = parseInt($("#mutateSegmentLength").val());
    TRANSFERSEGMENTLENGTH = parseInt($("#transferSegmentLength").val());

    if (MAXITER < 1) {
        alert("Number of MAXITER can't be 0.");
        return;
    }
    if (POPSIZE < 2) {
        alert("Size of the population can't be smaller than 2.");
        return;
    }

    consoleLogDecorated("Running... ");
    population = Array.from({ length: POPSIZE }, () => new CHROMOSOME());
    iteration = 0;
    cls(255, 255, 190);
    init(population);
    bestPopObj = JSON.parse(JSON.stringify(population));
    bestPopObj[0].objective = Number.MAX_SAFE_INTEGER;
    motor = setInterval(update, 10);
}

function update() {
    cls(255, 255, 190);
    if (iteration == 1) {
        bestPopObj = JSON.parse(JSON.stringify(population));
    }
    objective(population);
    population = bacterialMutation(population, CLONES, MUTATESEGMENTLENGTH);
    objective(population);
    population = transfer(population, TRANSFERSEGMENTLENGTH);
    if (population[0].objective <= bestPopObj[0].objective) {
        bestPopObj = JSON.parse(JSON.stringify(population));
    }
    if (iteration == MAXITER) {
        $("#iterOutput").text("Generation: " + iteration + "/" + MAXITER);
        clearInterval(motor);
        printBest(iteration, bestPopObj);
        consoleLogDecorated("End of the algorithm. ");
        $("#solve").prop("disabled", false);
        return;
    }
    printBest(iteration, bestPopObj);
    iteration++;
}

function bacterialMutation(pop, clones, segmentLength) {
    for (let i = 0; i < pop.length; i++) {
        pop[i] = mutate(pop[i], clones, segmentLength);
    }
    return pop;
}

function mutate(actInd, clones, segmentLength) {
    let bestclone = [];
    let segmentNumber = Math.floor(actInd.order.length / segmentLength);
    for (let sN = 0; sN < segmentNumber; sN++) {
        let segmentStart = segmentLength * sN;

        if (segmentStart + segmentLength <= actInd.order.length) {

            //creation of the clone baterien
            let beforeSegment = actInd.order.slice(0, segmentStart);
            let afterSegment = actInd.order.slice(segmentStart + segmentLength);
            let segmentArray = actInd.order.slice(segmentStart, segmentStart + segmentLength);

            let clonePopulation = new Array(clones);
            for (let i = 0; i < clonePopulation.length; i++) {
                clonePopulation[i] = new CHROMOSOME;
            }
            //the first clone has the reverse of the original segment
            clonePopulation[0].order = [...beforeSegment].concat(segmentArray.reverse(), ...afterSegment);

            //change randomly the order of vertices in the selected segment in the clones
            for (let i = 0; i < clones - 1; i++) {
                //the random order of segment
                let orderOfSegment = [];
                for (let i = 0; i < segmentArray.length; i++) {
                    orderOfSegment[i] = segmentArray[i];
                }
                fisherYates(orderOfSegment);
                //the new bacterium will consist of the part of before the segment, the segment (in arbitrary order), and the part after the segment
                clonePopulation[i + 1].order = [...beforeSegment].concat(...orderOfSegment, ...afterSegment);
            }
            //selecting the fittest from the clones
            objective(clonePopulation);
            bestclone[sN] = clonePopulation[0];
        }
    }
    objective(bestclone);
    return (bestclone[0]);

}

function transfer(pop, length) {
    let half = Math.ceil(pop.length / 2);
    let superiorPop = pop.slice(0, half);
    let inferiorPop = pop.slice(half);

    for (let i = 0; i < INFECTIONS; i++) {
        let randomSuperior = superiorPop[Math.floor(Math.random() * superiorPop.length)];
        var randomInferiorIndex = Math.floor(Math.random() * inferiorPop.length);
        let randomInferior = inferiorPop[randomInferiorIndex];
        let randStart = Math.floor(Math.random() * randomInferior.order.length);
        let destinationPosition = Math.floor(Math.random() * (randomInferior.order.length - randStart)) + randStart;
        var transferredPop = geneTransfer(randomSuperior.order, randomInferior.order, randStart, length, destinationPosition);
        inferiorPop[randomInferiorIndex].order = transferredPop;
        pop[randomInferiorIndex + half].order = transferredPop;
    }
    objective(pop);
    return pop;
}


function geneTransfer(randomSuperior, randomInferior, start, length, destinationPos) {
    let gtransferChromosome = [];
    gtransferChromosome = [...randomInferior];

    let end = start + length;
    let segment = randomSuperior.slice(start, end);
    for (let i = segment.length - 1; i >= 0; i--) {
        gtransferChromosome.splice(destinationPos, 0, segment[i]);
    }
    for (let i = 0; i < segment.length; i++) {
        let originalIndex = gtransferChromosome.indexOf(segment[i], destinationPos + length);
        if (originalIndex != -1) {
            gtransferChromosome.splice(originalIndex, 1);
        } else {
            let originalIndex = gtransferChromosome.indexOf(segment[i], 0);
            gtransferChromosome.splice(originalIndex, 1);
            destinationPos--;
        }
    }
    return gtransferChromosome;
}

function stop() {
    clearInterval(motor);
    consoleLogDecorated("Stop button was pressed! ");
    consoleLogDecorated("End of the algorithm. ");
    $("#solve").prop("disabled", false);
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

window.onload = initialize;
