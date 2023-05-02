$(document).ready(function() {      // declaring global variables
    const container = $(".container");      
    const gridSize = 9;         // setting gridsize equal to 9 so that each row and column has nine cells
    let board = [];             // setting board as array so it will be grid
    let timerInterval;          // timer variables
    let seconds = 0;
    let minutes = 0;

    // TIMER FUNCTIONS
    function startTimer() {         // calls setInterval() function to restart the timer     
        timerInterval = setInterval(updateTimer, 1000);     // calls updateTimer() to clear the timer to restart
    }

    function stopTimer() {
        clearInterval(timerInterval);       // stops the timer and clears it so only one timer occurring at a time
    }

    function resetTimer() {
        seconds = 0;        // resets all seconds and minutes to zero and then calls update to be ready to restart
        minutes = 0;
        updateTimer();
    }

    function updateTimer() {
        seconds++;                  // seconds gets incremented, but if it gets to sixty then reset seconds to zero and increment minutes by 1
        if (seconds == 60) {
            seconds = 0;
            minutes++;
        }
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;        // formats the minutes and seconds on the timer
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        const timerDisplay = document.querySelector('#timer');              // calls on querySelector in order to properly format timer
        timerDisplay.textContent = formattedMinutes + ':' + formattedSeconds;       // displays timer
    }

    // CREATING/UPDATING BOARD FUNCTIONS
    function updateBoard() {
        for (let i = 0; i < gridSize; i++) {        // looping through gridSize rows and columns
            for (let j = 0; j < gridSize; j++) {
                const input = $(`.container input[data-row="${i}"][data-col="${j}"]`);      // select input element with jQuery selector that matches data-row and data-col
                input.val(board[i][j]);         // update the value of the input element with the value from the board array at the same position
            }
        }
    }

    function newGame() {
        const numFilledCells = 40;          // can be changed to whatever level of difficulty is preferred
        const puzzle = generatePuzzle(numFilledCells);      // generate the puzzle using the desired number of filled cells
        createBoard(puzzle);            // create the board
        resetTimer();           // reset the timer so that only one timer is occurring at a time
        startTimer();           // start the timer when the player starts the game
    }
    
    function createBoard(puzzle) {
        container.empty();          // empty the container to get rid of any existing sudoku board
        board = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));           // creates the blank grid
        const table = $('<table>').addClass('sudoku-grid');     // creates table element with sudoku-grid class styles 
      
        for (let i = 0; i < gridSize; i++) {            // loop through grid with nested for loop      
            const row = $('<tr>');                  
            for (let j = 0; j < gridSize; j++) {
                const input = $("<input>", {            // creating input element set to current row and column, with maxlength of 1 to only allow single-digit inputs
                    type: "text",
                    maxlength: 1,           
                    "data-row": i,
                    "data-col": j
                });
    
                const cell = $('<td>');        
    
                if (puzzle[i][j] !== null) {       // if there is already a number in the cell
                    input.val(puzzle[i][j]);            // change the input element value to the cell value
                    input.attr("disabled", true);       // disable input
                    input.addClass("disabled");         // add disabled class for styling
                    board[i][j] = puzzle[i][j];         // update board variable with cell value
                }
    
                input.on("input", function() {                      // adding input event handler for each input element 
                    const value = parseInt($(this).val(), 10);      // enables update of board when user inputs a number
                    if (value >= 1 && value <= gridSize) {          // check if input value is between 1 and 0
                        board[i][j] = value;                        // if it is, update the board  
                    } else {                                        // if it is not
                        $(this).val("");                            // clear the input value        
                        board[i][j] = null;                         // set the cell to null
                    }
                });
    
                cell.append(input);         // append all cells and rows
                row.append(cell);
            }
            table.append(row);              // append table
        }
        container.append(table);            // finally append container
    }
      
    function generatePuzzle(numFilledCells) {
        const gridSize = 9;         // declaring gridsize as 9 again
        const puzzle = generateSolvedBoard();           // in order to ensure all puzzles have a solution, need to generate a solved puzzle first and then remove cells
      
        removeNumbers(puzzle, gridSize * gridSize - numFilledCells);        // remove declared number of cells from fully solved puzzle in order to ensure possible solution
      
        return puzzle;      // display the puzzle
      }
      
    function generateSolvedBoard() {
        const gridSize = 9;
        const solvedBoard = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));           // same steps as normal
      
        function fillBoard(board, row, col) {
            if (col === gridSize) {
                col = 0;            // creating the board
                row++;
            }
          
            if (row === gridSize) {         
                return true;                // if rows are correct then return true
            }
          
            const shuffledNumbers = shuffleArray([...Array(gridSize).keys()].map(i => i + 1));          // shuffle the array in order to get randomized board
          
            for (const num of shuffledNumbers) {
                if (isValidMove(board, row, col, num)) {        // check if the shuffled array is valid by checking each cell
                    board[row][col] = num;                      // if valid then put the num in the call
      
                    if (fillBoard(board, row, col + 1)) {
                        return true;                            // if the grid is still correct then return true
                    }
      
                    board[row][col] = null;                     // if not correct then set to null and return false
                }
            }
      
            return false;
        }
        fillBoard(solvedBoard, 0, 0);           // filling the board and checking for solution
        return solvedBoard;                     // return the solved board
    }
      
    function removeNumbers(puzzle, numToRemove) {           
        const gridSize = 9;
        while (numToRemove > 0) {                         // continue removing until the number of cells supposed to be removed is hit
            const row = Math.floor(Math.random() * gridSize);           // pick random column and row to generate random cell
            const col = Math.floor(Math.random() * gridSize);
      
            if (puzzle[row][col] !== null) {            // if that cell has a value in it
                const oldValue = puzzle[row][col];      // record the old value
                puzzle[row][col] = null;                // remove the value from the cell and set it to null
                const tempPuzzle = JSON.parse(JSON.stringify(puzzle));          // declare the temporary puzzle
                if (!hasUniqueSolution(tempPuzzle)) {           // call unique function to see if the puzzle has only one solution
                    puzzle[row][col] = oldValue;                // if it does not have only one unique solution, then replace that cell
                } else {
                    numToRemove--;                              // if it does have only one solution then record that a cell was removed 
                }
            }
        }
    }
      
    function hasUniqueSolution(puzzle) {
        let solutionCount = 0;      // variable to record number of solutions
      
        function countSolutions(board, row, col) {
            if (col === board.length) {     
                col = 0;
                row++;
            }
      
            if (row === board.length) {         // if more than one solution found, return the solution count
                solutionCount++;
                return;
            }
      
            if (board[row][col] !== null) {
                countSolutions(board, row, col + 1);            // recursively calling function in order to test all possible solutions
            } else {
                for (let num = 1; num <= 9; num++) {            
                    if (isValidMove(board, row, col, num)) {        // check if the input cells are valid
                        board[row][col] = num;                      // swap the number
                        countSolutions(board, row, col + 1);        // try again with one number higher
                        board[row][col] = null;                     // set to null 
      
                        if (solutionCount > 1) {                    // if solution count is found to be higher than 1, then return 
                            return;
                        }
                    }
                }
            }
        }
      
        countSolutions(puzzle, 0, 0);               // after counting solutions, solutionCount will be finalized
        return solutionCount === 1;                 // if only one solution, then return
    }
      
    function shuffleArray(array) {          
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));      // randomly shuffle the array to create new puzzle
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // SOLVE BOARD FUNCTIONS
    function solve() {
        if (solveBoard(board)) {            // if the board is solved then
            updateBoard();                  // update the board with the solution values
            stopTimer();                    // and stop the timer
        } else {
            alert("No solution found!");    // if not, then alert that there is no solution found
        }
    }
      
    function solveBoard(puzzle) {       // solves using backtracking
        const gridSize = 9;
        let row = -1;
        let col = -1;
        let isEmpty = true;
      
        for (let i = 0; i < gridSize; i++) {        // looks for empty cells
            for (let j = 0; j < gridSize; j++) {    // moves through the grid looking for an empty cell
                if (puzzle[i][j] === null) {        // if an empty cell is found then initialize row, col, and isEmpty
                    row = i;
                    col = j;
                    isEmpty = false;
                    break;
                }
            }
            if (!isEmpty) {                         // if no empty cells are found, break out of for loop         
                break;
            }
        }
      
        if (isEmpty) {       // isEmpty is true, that means the puzzle is solved
            return true;
        }
      
        for (let num = 1; num <= gridSize; num++) {         // if there is an empty cell
            if (isValidMove(puzzle, row, col, num)) {       // check for any valid moves that can be done
                puzzle[row][col] = num;                     // loop through 1 through 9 and check if there are any valid moves to be made
                if (solveBoard(puzzle)) {                   // if there is a valiv move, set the cell value to the current number and call solveBoard() recursively
                    return true;
                } else {
                    puzzle[row][col] = null;                // if there is no valid move yet, then set the cell value to null and move onto new empty cell
                }
            }
        }
        return false;
    }
      
    // VALIDATION FUNCTIONS
    function validate() {
        const isValid = isBoardValid(board);                // call validation and completion functions to check if board is correct and complete
        const isComplete = isBoardComplete(board);
      
        if (isValid && isComplete) {                // show corresponding alert
            stopTimer();                            // if board is correct and complete, then stop the timer
            alert("Congratulations! Your solution is correct.");
        } else if (isValid && !isComplete) {
            alert("Your solution is partially correct. Keep going!");
        } else {
            alert("Oops! There seems to be a mistake in your solution.");
        }
    }
      
    function isBoardValid(puzzle) {
        const gridSize = 9;
        for (let i = 0; i < gridSize; i++) {            // loop through grid using nested for loops
            for (let j = 0; j < gridSize; j++) {
                if (puzzle[i][j] !== null) {            // check that the current cell being examined is not empty
                    const value = puzzle[i][j];         // set value equal to current value of the cell
                    puzzle[i][j] = null;                // temporarily set cell value to null
                    if (!isValidMove(puzzle, i, j, value)) {        // check to see if the stored value is valid and correct
                        puzzle[i][j] = value;       // if it is not correct, then put the value back in the cell and return false
                        return false;
                    }
                    puzzle[i][j] = value;           // if it is correct, then return the value
                }
            }
        }   
        return true;            // if all values have been checked and determined correct, return true
    }

    function isValidMove(puzzle, row, col, value) {
        const gridSize = 9;
      
        // Check row
        for (let i = 0; i < gridSize; i++) {            // if the cell is the only cell with that specific value in the row, then continue
            if (puzzle[row][i] === value) {             // if there are two cells with the same value in the same row, return false
                return false;
            }
        }
      
        // Check column
        for (let i = 0; i < gridSize; i++) {            // if the cell is the only cell with that specific value in the column, then continue
            if (puzzle[i][col] === value) {             // if there are two cells with the same value in the same column, return false
                return false;
            }
        }
      
        // Check box
        const boxRow = Math.floor(row / 3) * 3;         // find the space of the box to be checked
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {     // use nested for loop to check all rows and columns in the box for two cells with the same value
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (puzzle[i][j] === value) {
                    return false;                       // if two are found, return false
                }
            }
        }
        return true;            // if row, column, and box are all good, then return true
    }
    

    // COMPLETION FUNCTIONS
    function isBoardComplete(puzzle) {
        const gridSize = 9;
      
        for (let i = 0; i < gridSize; i++) {            // loop through grid with nested for loop
            for (let j = 0; j < gridSize; j++) {
                if (puzzle[i][j] === null) {            // if current cell being examined is null (no value) then return false
                    return false;
                }
            }
        }
        return true;            // if no null cells are found then return true 
    }
      
    
    // Button click event handlers
    $("[data-action='newGame']").on("click", newGame); 
    $("[data-action='solve']").on("click", solve);
    $("[data-action='validate']").on("click", validate);
  
    // Create an initial game board
    resetTimer();
    newGame();

  });
  