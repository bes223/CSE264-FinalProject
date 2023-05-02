$(document).ready(function() {
    const container = $(".container");
    const gridSize = 9;
    let board = [];
    
    function createBoard(puzzle) {
        container.empty();
        board = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));
        const table = $('<table>').addClass('sudoku-grid');
      
        for (let i = 0; i < gridSize; i++) {
            const row = $('<tr>');
            for (let j = 0; j < gridSize; j++) {
                const input = $("<input>", {
                    type: "text",
                    maxlength: 1,
                    "data-row": i,
                    "data-col": j
                });
    
                const cell = $('<td>');
    
                if (puzzle[i][j] !== null) {
                    input.val(puzzle[i][j]);
                    input.attr("disabled", true);
                    input.addClass("disabled");
                    board[i][j] = puzzle[i][j];
                }
    
                input.on("input", function() {
                    const value = parseInt($(this).val(), 10);
                    if (value >= 1 && value <= gridSize) {
                        board[i][j] = value;
                    } else {
                        $(this).val("");
                        board[i][j] = null;
                    }
                });
    
                cell.append(input);
                row.append(cell);
            }
            table.append(row);
        }
        container.append(table);
    }
      
    function generatePuzzle(numFilledCells) {
        const gridSize = 9;
        const puzzle = generateSolvedBoard();
      
        removeNumbers(puzzle, gridSize * gridSize - numFilledCells);
      
        return puzzle;
      }
      
    function generateSolvedBoard() {
        const gridSize = 9;
        const solvedBoard = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));
      
        function fillBoard(board, row, col) {
            if (col === gridSize) {
                col = 0;
                row++;
            }
          
            if (row === gridSize) {
                return true;
            }
          
            const shuffledNumbers = shuffleArray([...Array(gridSize).keys()].map(i => i + 1));
          
            for (const num of shuffledNumbers) {
                if (isValidMove(board, row, col, num)) {
                    board[row][col] = num;
      
                    if (fillBoard(board, row, col + 1)) {
                        return true;
                    }
      
                    board[row][col] = null;
                }
            }
      
            return false;
        }
        fillBoard(solvedBoard, 0, 0);
        return solvedBoard;
    }
      
    function removeNumbers(puzzle, numToRemove) {
        const gridSize = 9;
        while (numToRemove > 0) {
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);
      
            if (puzzle[row][col] !== null) {
                const oldValue = puzzle[row][col];
                puzzle[row][col] = null;
                const tempPuzzle = JSON.parse(JSON.stringify(puzzle));
                if (!hasUniqueSolution(tempPuzzle)) {
                    puzzle[row][col] = oldValue;
                } else {
                    numToRemove--;
                }
            }
        }
    }
      
    function hasUniqueSolution(puzzle) {
        let solutionCount = 0;
      
        function countSolutions(board, row, col) {
            if (col === board.length) {
                col = 0;
                row++;
            }
      
            if (row === board.length) {
                solutionCount++;
                return;
            }
      
            if (board[row][col] !== null) {
                countSolutions(board, row, col + 1);
            } else {
                for (let num = 1; num <= 9; num++) {
                    if (isValidMove(board, row, col, num)) {
                        board[row][col] = num;
                        countSolutions(board, row, col + 1);
                        board[row][col] = null;
      
                        if (solutionCount > 1) {
                            return;
                        }
                    }
                }
            }
        }
      
        countSolutions(puzzle, 0, 0);
        return solutionCount === 1;
    }
      
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
      

    function isValidMove(puzzle, row, col, value) {
        const gridSize = 9;
      
        // Check row
        for (let i = 0; i < gridSize; i++) {
            if (puzzle[row][i] === value) {
                return false;
            }
        }
      
        // Check column
        for (let i = 0; i < gridSize; i++) {
            if (puzzle[i][col] === value) {
                return false;
            }
        }
      
        // Check box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (puzzle[i][j] === value) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function newGame() {
        const numFilledCells = 35;
        const puzzle = generatePuzzle(numFilledCells);
        createBoard(puzzle);
      }
    
    function solve() {
        if (solveBoard(board)) {
            updateBoard();
        } else {
            alert("No solution found!");
        }
    }
      
    function solveBoard(puzzle) {
        const gridSize = 9;
        let row = -1;
        let col = -1;
        let isEmpty = true;
      
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (puzzle[i][j] === null) {
                    row = i;
                col = j;
                isEmpty = false;
                break;
                }
            }
            if (!isEmpty) {
                break;
            }
        }
      
        if (isEmpty) {
            return true;
        }
      
        for (let num = 1; num <= gridSize; num++) {
            if (isValidMove(puzzle, row, col, num)) {
                puzzle[row][col] = num;
                if (solveBoard(puzzle)) {
                    return true;
                } else {
                    puzzle[row][col] = null;
                }
            }
        }
        return false;
    }
      
    function updateBoard() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const input = $(`.container input[data-row="${i}"][data-col="${j}"]`);
                input.val(board[i][j]);
            }
        }
    }
      
    
    function validate() {
        const isValid = isBoardValid(board);
        const isComplete = isBoardComplete(board);
      
        if (isValid && isComplete) {
            alert("Congratulations! Your solution is correct.");
        } else if (isValid && !isComplete) {
            alert("Your solution is partially correct. Keep going!");
        } else {
            alert("Oops! There seems to be a mistake in your solution.");
        }
    }
      
    function isBoardValid(puzzle) {
        const gridSize = 9;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (puzzle[i][j] !== null) {
                    const value = puzzle[i][j];
                    puzzle[i][j] = null;
                    if (!isValidMove(puzzle, i, j, value)) {
                        puzzle[i][j] = value;
                        return false;
                    }
                    puzzle[i][j] = value;
                }
            }
        }   
        return true;
    }
      
    function isBoardComplete(puzzle) {
        const gridSize = 9;
      
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (puzzle[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }
      
    
    // Button click event handlers
    $("[data-action='newGame']").on("click", newGame);
    $("[data-action='solve']").on("click", solve);
    $("[data-action='validate']").on("click", validate);
  
    // Create an initial game board
    newGame();

  });
  