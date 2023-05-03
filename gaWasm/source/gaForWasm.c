#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>
#include <math.h>
#include <emscripten.h>

typedef struct genotype {
    char* order;
    int fitness;
    int objective;
} GENOTYPE;

/* https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle */
void fisherYates(char* order, int cities) {
    int g1;
    for (g1 = cities - 1; g1 > 0; g1--) {
        int g2 = rand() % (g1 + 1);
        char tmp = order[g1];
        order[g1] = order[g2];
        order[g2] = tmp;
    }
}

void init(GENOTYPE* pop, int cities, int popsize) {
    int ind, gene;
    for (ind = 0; ind < popsize; ind++) {
        for (gene = 0; gene < cities; gene++) {
            pop[ind].order[gene] = gene;
        }
        fisherYates(pop[ind].order, cities);
    }
}
static int cityCoords[73][2] = {
    {480, 350}, {150, 120}, {160, 230}, {240, 300}, {250, 270}, {121, 190}, {655, 310}, {180, 350},
                  {120, 400}, {190, 150}, {222, 470}, {333, 350}, {510, 555}, {170, 480}, {480, 120}, {180, 480},
                  {144, 577}, {560, 102}, {660, 108}, {400, 280}, {405, 200}, {150, 100}, {410, 500}, {20, 30},
                  {640, 50}, {30, 300}, {45, 78}, {101, 10}, {158, 170}, {81, 500}, {348, 28}, {10, 400}, {58, 77},
                  {70, 132}, {345, 152}, {481, 90}, {186, 210}, {182, 125}, {250, 290}, {256, 100}, {354, 412},
                  {658, 580}, {600, 42}, {520, 585}, {350, 540}, {233, 200}, {123, 12}, {321, 500}, {231, 360},
                  {213, 320}, {234, 189}, {34, 521}, {200, 23}, {44, 400}, {548, 370}, {378, 500}, {590, 550},
                  {12, 580}, {130, 40}, {170, 90}, {52, 128}, {470, 400}, {93, 470}, {390, 380}, {410, 378},
                  {50, 540}, {370, 80}, {410, 70}, {0, 280}, {600, 270}, {610, 390}, {620, 100}, {580, 10}
};

static int distances[73][73];

int distance(int x1, int y1, int x2, int y2) {
    return round(sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2)));
}
void objective(GENOTYPE* pop, int cities, int popsize) {
    for (int i = 0; i < cities; i++) {
        for (int j = i; j < cities; j++) {
            if (i == j) {
                distances[i][j] = 0;
            }
            else {
                int dist = distance(cityCoords[i][0], cityCoords[i][1], cityCoords[j][0], cityCoords[j][1]);
                distances[i][j] = dist;
                distances[j][i] = dist;
            }
        }
    }
    int ind, gene, obj, from, to;
    for (ind = 0; ind < popsize; ind++) {
        for (obj = gene = 0, to = pop[ind].order[gene]; gene < cities - 1; gene++) {
            from = to;
            to = pop[ind].order[gene + 1];
            obj += distances[from][to];
        }
        from = to;
        to = pop[ind].order[0];
        obj += distances[from][to];
        pop[ind].objective = obj;
    }
}

int compare(const void* ind1, const void* ind2) {
    return ((GENOTYPE*)ind1)->objective - ((GENOTYPE*)ind2)->objective;
}

void fitness(GENOTYPE* pop, int popsize) {
    int ind;
    qsort(pop, popsize, sizeof(GENOTYPE), compare);
    for (ind = 0; ind < popsize; ind++) {
        pop[ind].fitness = (popsize - ind) * (popsize - ind);
    }
}

void copyElites(const GENOTYPE* popOld, GENOTYPE* popNew, int elites) {
    memmove(popNew, popOld, elites * sizeof(GENOTYPE));
}

int selection(const GENOTYPE* pop, int popsize) {
    int sumFitness, partFitness, ind, rnd;
    for (sumFitness = ind = 0; ind < popsize; ind++) {
        sumFitness += pop[ind].fitness;
    }
    rnd = rand() % sumFitness + 1;
    for (partFitness = ind = 0; partFitness < rnd; ind++) {
        partFitness += pop[ind].fitness;
    }
    return ind - 1;
}

void mutation(GENOTYPE* ind, int cities) {
    int pos1 = rand() % cities;
    int pos2;
    char tmp;
    do {
        pos2 = rand() % cities;
    } while (pos1 == pos2); /* Different positions needed */
    tmp = ind->order[pos1];
    ind->order[pos1] = ind->order[pos2];
    ind->order[pos2] = tmp;
}

/* PMX https://www.slideshare.net/guest9938738/genetic-algorithms */
void crossover(const GENOTYPE* popOld, GENOTYPE* popNew, int cities, int popsize, int elites, float mutrate) {
    int ind, par1, par2, pos1, pos2, gene;
    copyElites(popOld, popNew, elites);
    for (ind = elites; ind < popsize; ind++) {
        par1 = selection(popOld, popsize);
        do {
            par2 = selection(popOld, popsize);
        } while (par1 == par2);
        pos1 = rand() % cities;
        pos2 = rand() % (cities - pos1) + pos1;
        /* Step1: copy matching section elements of par1 into offspring to the same position */
        for (gene = 0; gene < cities; gene++) {
            if (gene >= pos1 && gene <= pos2) {
                popNew[ind].order[gene] = popOld[par1].order[gene];
            }
            else {
                popNew[ind].order[gene] = -1;
            }
        }
        /* Step2: copy missing elements of par2's matching section into offspring */
        for (gene = pos1; gene <= pos2; gene++) {
            char* copyPos;
            copyPos = memchr(popOld[par1].order + pos1, popOld[par2].order[gene], pos2 - pos1 + 1);
            if (!copyPos) { /* Allele is missing */
                int where = gene;
                char* chr;
                do {
                    chr = memchr(popOld[par2].order, popOld[par1].order[where], cities);
                    where = chr - popOld[par2].order;
                } while (where >= pos1 && where <= pos2);
                popNew[ind].order[where] = popOld[par2].order[gene];
            }
        }
        /* Step3: fill all non-defined alleles of the offspring using par2 data */
        for (gene = 0; gene < cities; gene++) {
            if (popNew[ind].order[gene] == -1) {
                popNew[ind].order[gene] = popOld[par2].order[gene];
            }
        }
        // ha pl ind = 1 akkor popNew + ind azt jelenti, hogy az elsore mutato popNew plusz 1, vagyis popNew[1] lesz
        // felmerul a kerdes, hogy akkor miert nem popNew[ind]
        if (rand() / RAND_MAX < mutrate) mutation(popNew + ind, cities);
    }
}

void rotate(char* order, int cities) {
    while (*order) {
        char tmp = *order;
        memmove(order, order + 1, cities - 1);
        *(order + cities - 1) = tmp;
    }
}

void printBest(int iter, const GENOTYPE* pop, int cities, char* str, int offset) {
    int city;
    char* copy = malloc(cities * sizeof(char));
    if (copy == NULL) {
        printf("Memory allocation failed!\n");
        return;
    }
    memmove(copy, pop->order, cities);
    rotate(copy, cities);
    offset += sprintf(str + offset, "%d, %d", cityCoords[*copy][0], cityCoords[*copy][1]);
    for (city = 1; city < cities; city++) {
        offset += sprintf(str + offset, "->%d, %d", cityCoords[copy[city]][0], cityCoords[copy[city]][1]);
    }
    offset += sprintf(str + offset, "->%d, %d = %d km.\n", cityCoords[*copy][0], cityCoords[*copy][1], pop->objective);
    free(copy);

}

void swap(GENOTYPE** pop1, GENOTYPE** pop2) {
    GENOTYPE* tmp = *pop1;
    *pop1 = *pop2;
    *pop2 = tmp;
}
EMSCRIPTEN_KEEPALIVE
char* gaAlgorithm(int cities, int popsize, int elites, float mutrate, int maxiter) {
    clock_t start = clock();
    GENOTYPE* popa = malloc(popsize * sizeof(GENOTYPE));
    GENOTYPE* popb = malloc(popsize * sizeof(GENOTYPE));

    for (int i = 0; i < popsize; i++) {
        popa[i].order = malloc(cities * sizeof(char));
        popb[i].order = malloc(cities * sizeof(char));
        if (popa[i].order == NULL) {
            printf("Memory allocation failed!\n");
        }
    }
    GENOTYPE* ppa = popa;
    GENOTYPE* ppb = popb;
    int iteration;

    srand((unsigned)time(NULL));
    init(ppa, cities, popsize);
    for (iteration = 0; iteration < maxiter; iteration++) {
        objective(ppa, cities, popsize);
        fitness(ppa, popsize);
        crossover(ppa, ppb, cities, popsize, elites, mutrate);
        swap(&ppa, &ppb);
    }
    clock_t end = clock();
    double elapsed_time = ((double)(end - start)) / CLOCKS_PER_SEC;
    char* str = malloc(100000 * sizeof(char));
    int offset = 0;

    printBest(iteration, ppa, cities, str, offset);

    free(ppa);
    free(ppb);

    return str;

}
EMSCRIPTEN_KEEPALIVE
int main(void) {   
    return 0;
}
