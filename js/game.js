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
let speed = 2;
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
    
    if (checkCollisions()) {
        drawGameOver();
    } else {
        updateVehicles();
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && player.x === rightLane) {
        player.x = leftLane;
    } else if (event.key === 'ArrowRight' && player.x === leftLane) {
        player.x = rightLane;
    }
    if (gameover) {
        if (event.key === 'y' || event.key === 'Y') {
            gameover = false;
            speed = 2;
            score = 0;
            vehicles = [];
            player.x = leftLane;
            player.y = playerY;
            requestAnimationFrame(gameLoop);
        } else if (event.key === 'n' || event.key === 'N') {
            gameover = false;
        }
    }
});

carImage.onload = () => {
    vehicleImages.forEach(image => image.onload = () => requestAnimationFrame(gameLoop));
};