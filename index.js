const DIM = 50;
const COLOR = 'black';
const di = [0, 1, 1, 1, 0, -1, -1, -1];
const dj = [1, 1, 0, -1, -1, -1, 0, 1];

document.addEventListener('DOMContentLoaded', runApp);


function runApp() {
    
    let grid = document.querySelector('.content');
    grid.innerHTML = createGrid(DIM);
    const tds = Array.from(document.getElementsByTagName('td'));
    playGame(DIM, tds);
}

function createGrid(dimension) {
    let table = "<table border='1'>";
    for(let row=0;row<dimension;row++){
        table += "<tr>";
        for(let column=0;column<dimension;column++){
            table += "<td></td>";
        }
        table += "</tr>";
    }
    table += "</table>";
    return table;
}

function randomColumn(dimension) {
    return Math.floor(Math.random() * dimension);
}

function colorRandomCells(dimension, tds) {
    clearGrid(tds);
    for(let row=0;row<dimension;row++){
        const index = randomColumn(dimension);
        tds[index + row * dimension].style.backgroundColor = COLOR;
    }
}

function clearGrid(tds) {
    tds.forEach(td => td.style.backgroundColor = '');
}

function isAlive(td) {
    return td.style.backgroundColor === COLOR;
}

function killCell(td) {
    td.style.backgroundColor = '';
}

function makeAlive(td) {
    td.style.backgroundColor = COLOR;
}

function isValid(row, column) {
    return row >= 0 && row < DIM && column >= 0 && column < DIM;
}

function getTd(row, column) {
    return row * DIM + column;
}

function checkStatus(row, column, tds) {
    let td = tds[getTd(row, column)];
    let liveNeighbours = 0;
    let isAliveCell = isAlive(td);
    for(let k = 0; k < 8; k++){
        if (isValid(row + di[k], column + dj[k])) {
            liveNeighbours += isAlive(tds[getTd(row + di[k], column + dj[k])]);
        }
    }
    // console.log(liveNeighbours);
    if(isAliveCell) {
        if (liveNeighbours !== 2 && liveNeighbours !== 3){
            killCell(td);
        }
    }
    else if (liveNeighbours === 3){
        makeAlive(td);
    }
}

function playGame(dimension, tds) {
    // colorRandomCells(DIM, tds);
    makeAlive(tds[getTd(0, 1)]);
    makeAlive(tds[getTd(1, 1)]);
    makeAlive(tds[getTd(1, 0)]);
    setInterval(() => {
        for(let row=0;row<dimension;row++){
            for(let column=0;column<dimension;column++){
                checkStatus(row, column, tds);
            }
        }
    }, 1000);
}
