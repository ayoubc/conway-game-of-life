const DIM = 50;
const COLOR = 'black';
const di = [0, 1, 1, 1, 0, -1, -1, -1];
const dj = [1, 1, 0, -1, -1, -1, 0, 1];

document.addEventListener('DOMContentLoaded', runApp);


function runApp() {
    
    let grid = document.querySelector('.grid');
    buildGrid(DIM);
    // grid.innerHTML = createGrid(DIM);
    const cells = Array.from(document.getElementsByClassName('cell'));
    console.log('Cells', cells);
    playGame(DIM, cells);

    // function createGrid(dimension) {
    //     let table = "<table border='1'>";
    //     for(let row=0;row<dimension;row++){
    //         table += "<tr>";
    //         for(let column=0;column<dimension;column++){
    //             table += "<td></td>";
    //         }
    //         table += "</tr>";
    //     }
    //     table += "</table>";
    //     return table;
    // }
    
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
        for(let row=0;row<dimension;row++){
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
    
    function makeAlive(cell) {
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
        for(let k = 0; k < 8; k++){
            if (isValid(row + di[k], column + dj[k])) {
                liveNeighbours += isAlive(cells[getCell(row + di[k], column + dj[k])]);
            }
        }
        // console.log(liveNeighbours);
        if(isAliveCell) {
            if (liveNeighbours !== 2 && liveNeighbours !== 3){
                killCell(cell);
            }
        }
        else if (liveNeighbours === 3){
            makeAlive(cell);
        }
    }
    
    function playGame(dimension, cells) {
        // colorRandomCells(DIM, cells);
        makeAlive(cells[getCell(0, 1)]);
        makeAlive(cells[getCell(1, 1)]);
        makeAlive(cells[getCell(1, 0)]);
        setInterval(() => {
            for(let row=0;row<dimension;row++){
                for(let column=0;column<dimension;column++){
                    checkStatus(row, column, cells);
                }
            }
        }, 1000);
    }
}


