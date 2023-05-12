function init(pop) {
    for (let ind = 0; ind < POPSIZE; ind++) {
        for (let gene = 0; gene < CITIES; gene++) {
            pop[ind].order[gene] = gene;
        }
        fisherYates(pop[ind].order);
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

/* https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle */
function fisherYates(order) {
    for (let g1 = order.length - 1; g1 > 0; g1--) {
        let g2 = Math.floor(Math.random() * (g1 + 1));
        let tmp = order[g1];
        order[g1] = order[g2];
        order[g2] = tmp;
    }
}

function calculateFactorial() {
    const num = $('#cities').val();

    if (num < 0) {
        $('#factorial').text('Error: Input must be a non-negative integer.');
        return;
    }

    let factorial = 1;
    for (let i = 1; i <= BigInt(num); i++) {
        factorial *= i;
    }
    $('#factorial').text(`All possible solutions for ${num} cities: ${factorial}.`);
}
