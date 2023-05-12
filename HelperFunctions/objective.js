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
    pop.sort(compare);
}

function compare(ind1, ind2) {
    return ind1.objective - ind2.objective;
}