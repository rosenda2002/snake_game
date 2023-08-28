const playBoard = document.querySelector(".play-board");

const replayButton = document.getElementById("replayButton");

const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let specialFoodActive = false;
let specialFoodTimer = 0;
let consecutiveRegularFood = 0;

// Getting high score from the local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const foodEatingSound = document.getElementById("foodEatingSound");

const updateFoodPosition = () => {
    // Passing a random 1 - 30 value as food position
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;

    // 1 in 5 chance of getting special food (if not already active)
    if (!specialFoodActive && Math.random() < 0.2) {
        consecutiveRegularFood = 0; // Reset consecutive regular food counter
        specialFoodActive = true;
        specialFoodTimer = 5; // 5 seconds timer
    }
};

// Get references to the audio elements and the game over container
const gameOverSound = document.getElementById("gameOverSound");
const gameOverContainer = document.getElementById("gameOverContainer");

// Add an event listener to the "gameOverSound" to trigger actions when it starts playing
gameOverSound.addEventListener("play", () => {
    // Show the game over container when the game over sound starts playing
    gameOverContainer.style.display = "block";
});

// Add an event listener to the "gameOverSound" to trigger actions when it stops playing
gameOverSound.addEventListener("ended", () => {
    // Hide the game over container when the game over sound stops playing
    gameOverContainer.style.display = "none";
});


const handleGameOver = () => {
    clearInterval(setIntervalId);
    gameOverSound.play();

    // Display the game over container
    gameOverContainer.style.display = "flex";

    // Wait for the audio to finish playing
    gameOverSound.addEventListener("ended", () => {
        // Display an alert after the audio finishes
        alert("Game Over! Press OK to replay...");
        location.reload();
    });
};

const changeDirection = e => {
      // Changing velocity value based on key press
      if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if(e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));
const initGame = () => {
    if (gameOver) {
        // Handle the game over state
        handleGameOver();
        return; // No need to modify the playBoard.innerHTML in this case
    }
    let html = '';

    if (specialFoodActive) {
        // Display the special food
        html += `<div class="food bigger-food" style="grid-area: ${foodY} / ${foodX}"></div>`;
    } else {
        // Display the regular food
        html += `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
    }
    // Checking if the snake hit the food
    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]);
        consecutiveRegularFood++;

        // Play the food eating sound
        foodEatingSound.play();

        if (consecutiveRegularFood === 2) {
            specialFoodActive = true;
            specialFoodTimer = 5;
            consecutiveRegularFood = 0; // Reset consecutive regular food counter
            score += 1; // Special food appearance, no points
        } else if (specialFoodActive) {
            const gameOverSound = document.getElementById("gameOverSound");

            specialFoodActive = false;
            score += 2; // Eating the special food awards 2 points
            consecutiveRegularFood = 0; // Reset consecutive regular food counter
        } else {
            score += 1; // Each regular food eaten awards 1 point
        }
    
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }
    
    // Updating the snake's head position based on the current velocity
    snakeX += velocityX;
    snakeY += velocityY;
    
    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position

    // Checking if the snake's head is out of wall, if so setting gameOver to true
    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        // Adding a div for each part of the snake's body
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Checking if the snake head hit the body, if so set gameOver to true
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    // Inside the setInterval callback of initGame
    specialFoodTimer -= 0.1;
    if (specialFoodTimer <= 0) {
        specialFoodActive = false;
    }

    playBoard.innerHTML = html;
};

updateFoodPosition();
setIntervalId = setInterval(initGame, 130);
document.addEventListener("keyup", changeDirection);
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));


