const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const width = 500;
const height = 500;
canvas.width = width;
canvas.height = height;

const colors = {
    gray: '#646464',
    green: '#4CD038',
    red: '#C80000',
    white: '#FFFFFF',
    yellow: '#FFE800'
};

const roadWidth = 200;
const markerWidth = 10;
const markerHeight = 50;

const leftLane = 200;
const rightLane = 300;
const lanes = [leftLane, rightLane];

const playerX = leftLane; // Start in the left lane
const playerY = 400;
const fps = 60;
let gameover = false;
let speed = 0.2;
let score = 0;

const carImage = new Image();
carImage.src = 'images/car.png';

const crashImage = new Image();
crashImage.src = 'images/crash.png';

const vehicleImages = ['images/pickup_truck.png', 'images/semi_trailer.png', 'images/taxi.png', 'images/van.png']
    .map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });

const player = { x: playerX, y: playerY, width: 45, height: 90 };

let vehicles = [];
let laneMarkerMoveY = 0;
let crashRect = { x: 0, y: 0, width: 0, height: 0 };

const words = ["cat", "dog", "fox", "hat", "bat", "rat", "pig", "cow", "owl", "bee"];
let currentWord = words[Math.floor(Math.random() * words.length)];
let typedWord = '';

const letterImages = {
    'a': new Image(),
    'b': new Image(),
    'c': new Image(),
    'd': new Image(),
    'e': new Image(),
    'f': new Image(),
    'g': new Image(),
    'h': new Image(),
    'i': new Image(),
    'j': new Image(),
    'k': new Image(),
    'l': new Image(),
    'm': new Image(),
    'n': new Image(),
    'o': new Image(),
    'p': new Image(),
    'q': new Image(),
    'r': new Image(),
    's': new Image(),
    't': new Image(),
    'u': new Image(),
    'v': new Image(),
    'w': new Image(),
    'x': new Image(),
    'y': new Image(),
    'z': new Image()
};

letterImages['a'].src = './images/hand_gesture/A.png';
letterImages['b'].src = './images/hand_gesture/B.png';
letterImages['c'].src = './images/hand_gesture/C.png';
letterImages['d'].src = './images/hand_gesture/D.png';
letterImages['e'].src = './images/hand_gesture/E.png';
letterImages['f'].src = './images/hand_gesture/F.png';
letterImages['g'].src = './images/hand_gesture/G.png';
letterImages['h'].src = './images/hand_gesture/H.png';
letterImages['i'].src = './images/hand_gesture/I.png';
letterImages['j'].src = './images/hand_gesture/J.png';
letterImages['k'].src = './images/hand_gesture/K.png';
letterImages['l'].src = './images/hand_gesture/L.png';
letterImages['m'].src = './images/hand_gesture/M.png';
letterImages['n'].src = './images/hand_gesture/N.png';
letterImages['o'].src = './images/hand_gesture/O.png';
letterImages['p'].src = './images/hand_gesture/P.png';
letterImages['q'].src = './images/hand_gesture/Q.png';
letterImages['r'].src = './images/hand_gesture/R.png';
letterImages['s'].src = './images/hand_gesture/S.png';
letterImages['t'].src = './images/hand_gesture/T.png';
letterImages['u'].src = './images/hand_gesture/U.png';
letterImages['v'].src = './images/hand_gesture/V.png';
letterImages['w'].src = './images/hand_gesture/W.png';
letterImages['x'].src = './images/hand_gesture/X.png';
letterImages['y'].src = './images/hand_gesture/Y.png';
letterImages['z'].src = './images/hand_gesture/Z.png';


function drawRoad() {
    ctx.fillStyle = colors.green;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = colors.gray;
    ctx.fillRect(150, 0, roadWidth, height);
    
    ctx.fillStyle = colors.yellow;
    ctx.fillRect(145, 0, markerWidth, height);
    ctx.fillRect(345, 0, markerWidth, height);
}

function drawLaneMarkers() {
    laneMarkerMoveY += speed * 2;
    if (laneMarkerMoveY >= markerHeight * 2) {
        laneMarkerMoveY = 0;
    }
    ctx.fillStyle = colors.white;
    for (let y = markerHeight * -2; y < height; y += markerHeight * 2) {
        ctx.fillRect(width / 2 - markerWidth / 2, y + laneMarkerMoveY, markerWidth, markerHeight);
    }
}

function drawPlayer() {
    ctx.drawImage(carImage, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
}

function drawVehicles() {
    vehicles.forEach(vehicle => {
        ctx.drawImage(vehicle.image, vehicle.x - vehicle.width / 2, vehicle.y - vehicle.height / 2, vehicle.width, vehicle.height);
    });
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = colors.white;
    ctx.fillText(`Score: ${score}`, 50, 50);
}

function drawWord() {
    ctx.font = '20px Arial';
    ctx.fillStyle = colors.white;
    ctx.fillText(`Type the word: ${currentWord}`, width / 2 - 80, 50);
}

function drawTypedWord() {
    ctx.font = '20px Arial';
    ctx.fillStyle = colors.white;
    ctx.fillText(`Typed: ${typedWord}`, 20, 100);
    
    let xPos = 20;
let nextCharacter = currentWord[typedWord.length]
    const image = letterImages[nextCharacter];
    ctx.drawImage(image, xPos, 120, 50, 50)
}



function drawGameOver() {
    ctx.drawImage(crashImage, crashRect.x - crashRect.width / 2, crashRect.y - crashRect.height / 2);
    ctx.fillStyle = colors.red;
    ctx.fillRect(0, 50, width, 100);
    ctx.font = '16px Arial';
    ctx.fillStyle = colors.white;
    ctx.fillText('Game over. Play again? (Enter Y or N)', width / 2 - 120, 100);
}

function updateVehicles() {
    if (vehicles.length < 2) {
        let addVehicle = true;
        for (let vehicle of vehicles) {
            if (vehicle.y < vehicle.height * 1.5) {
                addVehicle = false;
            }
        }
        if (addVehicle) {
            const lane = lanes[Math.floor(Math.random() * lanes.length)];
            const image = vehicleImages[Math.floor(Math.random() * vehicleImages.length)];
            vehicles.push({ image, x: lane, y: -image.height / 2, width: 45, height: 90 });
        }
    }
    vehicles = vehicles.map(vehicle => {
        vehicle.y += speed;
        return vehicle;
    }).filter(vehicle => {
        if (vehicle.y >= height) {
            score++;
            if (score % 5 === 0) speed++;
            return false;
        }
        return true;
    });
}

function checkCollisions() {
    for (let vehicle of vehicles) {
        if (Math.abs(vehicle.x - player.x) < player.width && Math.abs(vehicle.y - player.y) < player.height) {
            gameover = true;
            crashRect = { x: player.x, y: (player.y + vehicle.y) / 2, width: crashImage.width, height: crashImage.height };
            return true;
        }
    }
    return false;
}

function gameLoop() {
    ctx.clearRect(0, 0, width, height);
    
    drawRoad();
    drawLaneMarkers();
    drawPlayer();
    drawVehicles();
    drawScore();
    drawWord();
    drawTypedWord();
    
    if (checkCollisions()) {
        drawGameOver();
    } else {
        updateVehicles();
        requestAnimationFrame(gameLoop);
    }
}

export function gameAction(action){
    if (gameover) {
        if (action === 'y' || action === 'Y') {
            gameover = false;
            speed = 2;
            score = 0;
            vehicles = [];
            player.x = leftLane;
            player.y = playerY;
            currentWord = words[Math.floor(Math.random() * words.length)];
            typedWord = '';
            requestAnimationFrame(gameLoop);
        } else if (action === 'n' || action === 'N') {
            gameover = false;
        }
    } else {
        if (action.length === 1 && /[a-zA-Z]/.test(action)) {
            typedWord += action.toLowerCase();
            if (typedWord === currentWord) {
                player.x = player.x === leftLane ? rightLane : leftLane;
                currentWord = words[Math.floor(Math.random() * words.length)];
                typedWord = '';
            } else if (!currentWord.startsWith(typedWord)) {
                typedWord = '';
            }
        }
    }

}


const loadPromises = Object.values(letterImages).map(img => {
    return new Promise((resolve) => {
        img.onload = resolve;
    });
});

Promise.all(loadPromises).then(() => {
    // Start the game loop once all images are loaded
    requestAnimationFrame(gameLoop);
});

document.addEventListener('keydown', event => {
    console.log(event.key);
    gameAction(event.key);
});

carImage.onload = () => {
    vehicleImages.forEach(image => image.onload = () => requestAnimationFrame(gameLoop));
};
