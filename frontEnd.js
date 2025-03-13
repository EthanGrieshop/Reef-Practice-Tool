function generateHexagonButtonPositions(centerX, centerY, radius) {
    let positions = [];
    for (let i = 3.5; i > -8; i--) {
        let angle = (Math.PI / 6) * i;
        let x1 = centerX + radius * Math.cos(angle)-25;
        let y1 = centerY + radius * Math.sin(angle)-25;
        positions.push([x1, y1]);
    }
    return positions;
}

let gameContainer = document.getElementById("game-container");
let prompt = document.getElementById("prompt");
let report = document.getElementById("report");
let timeSelection = document.getElementById("time-selection");
let playButton = document.getElementById("play-button");
let stats = document.getElementById("stats");

let sequence = [];
let currentIndex = 0;
let startTime;
let correctClicks = 0;
let incorrectGuesses = 0;
let totalPrompts = 0;
let gameInterval;
let gameDuration = 10000; // Default to 10 seconds

let misses = [];
let times = new Map();
for (var i = 0; i < 12; i++) {
    //times.set("abcdefghijkl"[i], []);
}
let lastTime = 0;

// Hide prompt and report initially
prompt.style.display = "none";
report.style.display = "none";
stats.style.display = "none";

function createButtons() {
    let buttons = [];
    let positions = generateHexagonButtonPositions(250, 250, 165);
    
    for (let i = 0; i < 12; i++) {
        let button = document.createElement("button");
        button.classList.add("hex-button");
        button.style.left = positions[i][0] + "px";
        button.style.top = positions[i][1] + "px";
        button.dataset.letter = String.fromCharCode(65 + i);
        button.addEventListener("click", handleClick);
        buttons.push(button);
        gameContainer.appendChild(button);
    }
    return buttons;
}

function startGame() {
    timeSelection.style.display = "none";
    playButton.style.display = "none";
    stats.style.display = "none";
    gameContainer.style.display = "block";
    report.innerText = "";
    prompt.style.display = "block";
    report.style.display = "none";
    stats.innerHTML = "";
    stats.innerText = "";
    
    sequence = [];
    previous = "";
    for (let i = 0; i < 30; i++) {
        newChar = String.fromCharCode(65 + Math.floor(Math.random() * 12));
        if (!previous === newChar) {
            i--;
        } else {
            sequence.push(newChar);
            previous = newChar;
        }
    }
    currentIndex = 0;
    correctClicks = 0;
    incorrectGuesses = 0;
    totalPrompts = 0;
    startTime = Date.now();
    
    prompt.innerText = `Click: ${sequence[currentIndex]}`;
    
    gameInterval = setInterval(() => {
        if ((Date.now() - startTime) >= gameDuration) {
            endGame();
        }
    }, 1000);
    lastTime = Date.now();
}

function handleClick(event) {
    let clickedButton = event.target;
    letter = sequence[currentIndex];
    if (clickedButton.dataset.letter === letter) {
        clickedButton.classList.add("correct");
        correctClicks++;
        currentIndex++;
        
        setTimeout(() => {
            clickedButton.classList.remove("correct");
        }, 250);
    } else {
        clickedButton.classList.add("incorrect");
        incorrectGuesses++;
        misses.push(letter);
        
        setTimeout(() => {
            clickedButton.classList.remove("incorrect");
        }, 250);
    }

    letterList = times.get(letter);
    if (letterList != undefined) {
        letterList.push((Date.now()-lastTime)/1000);
    } else {
        letterList = [(Date.now()-lastTime)/1000];
    }
    times.set(letter, letterList);
    lastTime = Date.now();
    
    currentIndex = Math.floor(Math.random() * sequence.length);
    prompt.innerText = `Click: ${sequence[currentIndex]}`;
    totalPrompts++;
}

function endGame() {
    clearInterval(gameInterval);
    let accuracy = correctClicks/(correctClicks+misses.length);
    accuracy = Math.round(accuracy*10000)/100;
    
    prompt.innerText = "Game Over!";
    report.innerHTML = `Total Completed: ${totalPrompts} | Accuracy: ${accuracy}% | CPM: ${totalPrompts/gameDuration * 60000}`;
    report.style.display = "block";
    timeSelection.style.display = "flex";
    playButton.style.display = "flex";
    gameContainer.style.display = "none";

    stats.innerHTML = "Average Time and Accuracy<br>";
    for (var i = 0; i < 12; i++) {
        letter = "ABCDEFGHIJKL"[i];
        avg = 0;
        if (times.get(letter) != undefined) {
            for (var j = 0; j < times.get(letter).length; j++) {
                avg += times.get(letter)[j]/times.get(letter).length;
            }
            count = 0;
            for (var j = 0; j < misses.length; j++) {
                if (misses[j] === letter) {
                    count++;
                }
            }
            avg = Math.round(avg*1000) / 1000;
            stats.innerHTML = stats.innerHTML + `${letter}: ${avg} sec, Accuracy: ${Math.round(((times.get(letter).length-count)/(times.get(letter).length))*1000)/10}%` + "<br>";
        }
    }

    stats.style.display = "block";

}

function setGameDuration() {
    let selectedTime = document.getElementById("time-select").value;
    gameDuration = parseInt(selectedTime) * 1000;
}

playButton.addEventListener("click", () => {
    setGameDuration();
    startGame();
});

createButtons();
