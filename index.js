const DIM = 50;
const COLOR = 'yellow';
const di = [0, 1, 1, 1, 0, -1, -1, -1];
const dj = [1, 1, 0, -1, -1, -1, 0, 1];

document.addEventListener('DOMContentLoaded', runApp);


function runApp() {

    let grid = document.querySelector('.grid');
    buildGrid(DIM);
    // grid.innerHTML = createGrid(DIM);
    const cells = Array.from(document.getElementsByClassName('cell'));
    // console.log('Cells', cells);
    // getStartingState(null, cells);
    aliveCells = [];
    for(let j = 25; j<35; j++) aliveCells.push([25, j]);
    getStartingState(aliveCells, cells);

    playGame(DIM, cells);

    function buildGrid(dimension) {

        grid.style.gridTemplateColumns = "repeat(" + dimension + ", 1fr)";
        grid.style.gridTemplateRows = "repeat(" + dimension + ", 1fr)";
        const totalCells = dimension * dimension;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement("div");
            cell.classList.add('cell');

            grid.appendChild(cell);
        }
    }

    function randomColumn(dimension) {
        return Math.floor(Math.random() * dimension);
    }

    function colorRandomCells(dimension, cells) {
        clearGrid(cells);
        for (let row = 0; row < dimension; row++) {
            const index = randomColumn(dimension);
            cells[index + row * dimension].style.backgroundColor = COLOR;
        }
    }

    function clearGrid(cells) {
        cells.forEach(cell => cell.style.backgroundColor = '');
    }

    function isAlive(cell) {
        return cell.style.backgroundColor === COLOR;
    }

    function killCell(cell) {
        cell.style.backgroundColor = '';
    }

    function makeCellAlive(cell) {
        cell.style.backgroundColor = COLOR;
    }

    function isValid(row, column) {
        return row >= 0 && row < DIM && column >= 0 && column < DIM;
    }

    function getCell(row, column) {
        return row * DIM + column;
    }

    function checkStatus(row, column, cells) {
        let cell = cells[getCell(row, column)];
        let liveNeighbours = 0;
        let isAliveCell = isAlive(cell);
        for (let k = 0; k < 8; k++) {
            if (isValid(row + di[k], column + dj[k])) {
                liveNeighbours += isAlive(cells[getCell(row + di[k], column + dj[k])]);
            }
        }
        if (isAliveCell) {
            if (liveNeighbours !== 2 && liveNeighbours !== 3) {
                return 0;
            }
            else return 1;
        }
        else {
            if (liveNeighbours === 3) {
                return 1;
            }
            else return 0;
        }
    }

    function updateGridState(dimension, cells) {
        const totalCells = dimension * dimension;
        let gridState = new Array(totalCells).fill(0);
        for (let row = 0; row < dimension; row++) {
            for (let column = 0; column < dimension; column++) {
                let status = checkStatus(row, column, cells);
                gridState[getCell(row, column)] = status;
            }
        }
        
        for(let i = 0; i < totalCells; i++) {
            if(gridState[i]){
                makeCellAlive(cells[i]);
            }
            else{
                killCell(cells[i]);
            }
        }
    }

    function playGame(dimension, cells) {
        setInterval(() => {
            updateGridState(dimension, cells);
        }, 1000);
    }

    function getStartingState(aliveCells, cells) {
        if (aliveCells) {
            aliveCells.forEach(aliveCell => {
                cell = cells[getCell(aliveCell[0], aliveCell[1])];
                cell.style.backgroundColor = COLOR;
            });
        }
        else {
            cells.forEach(cell => {
                cell.style.backgroundColor = COLOR;
            });
        }
    }

}


