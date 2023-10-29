let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let frameCount = 4;
let currentFrame = 0;
let characterWidth = 100;
let characterHeight = 100;
let characterX = 50;
let characterY = canvas.height / 1.25;
let characterSpeed = 7;
let frameDelay = 100;
let imagePaths = [];

let backgroundImage = new Image();
backgroundImage.src = '/assets/landscape.png';

let logoImage = new Image();
logoImage.src = '/assets/logo.png';

for (let i = 0; i < frameCount; i++) {
    imagePaths.push(`/assets/${i}.png`);
}
let images = [];
let imagesLoaded = 0;
imagePaths.push(backgroundImage);

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === frameCount) {
        animateCharacter();
    }
}

for (let i = 0; i < frameCount; i++) {
    let image = new Image();
    image.src = imagePaths[i];
    image.onload = imageLoaded;
    images.push(image);
}

let logoOpacity = 0;
let increasingOpacity = true;
let maxOpacity = 0.8; 
let opacityChangeRate = 0.05; 

let progressBarHeight = 10;
let progressBarColor = 'rgb(62,36,143)';
let progressBarWidth = 0;
let progressBarSpeed = 7;

function animateCharacter() {
    function drawCharacter() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        ctx.drawImage(
            images[currentFrame],
            characterX,
            characterY,
            characterWidth,
            characterHeight
        );

        ctx.globalAlpha = logoOpacity;
        let logoX = (canvas.width - logoImage.width) / 2;
        let logoY = (canvas.height - logoImage.height) / 2;
        if (logoOpacity >= 0) {
        ctx.drawImage(logoImage, logoX, logoY);
        }
        ctx.globalAlpha = 1;

        // Dessinez la barre de chargement violette
        ctx.fillStyle = progressBarColor;
        ctx.fillRect(0, canvas.height - progressBarHeight, progressBarWidth, progressBarHeight);
        

        if (increasingOpacity) {
            logoOpacity += opacityChangeRate;
        } else {
            logoOpacity -= opacityChangeRate;
        }

        if (logoOpacity >= maxOpacity) {
            increasingOpacity = false;
        }

        if (logoOpacity <= 0) {
            increasingOpacity = true;
        }

        // Augmentez la largeur de la barre de chargement
        progressBarWidth += progressBarSpeed;

        if (progressBarWidth > canvas.width) {
            progressBarWidth = 0;
        }

        characterX += characterSpeed;

        if (characterX > canvas.width) {
            characterX = -characterWidth;
        }

        currentFrame = (currentFrame + 1) % frameCount;

        setTimeout(() => {
            requestAnimationFrame(drawCharacter);
        }, frameDelay);
        }

    drawCharacter();
}
