/* Moteurs de jeu - L3B*/
/* TP02 */
/* Valentin GUILLON & Cheïmâa FAKIH */


let cnv = document.getElementById("myCanvas");
let ctx = cnv.getContext("2d");

ctx.imageSmoothingEnabled = false;

let gui = new dat.gui.GUI();

let assetsDir = "assets/"
let pngExt = ".png";



function getRandom(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}




// import My_Circle from "./formes.js";
import {My_Img, My_Img_Animated} from "./imgs.js";
import HitBox_Circle from "./hitBox.js";
import {shoot, My_Object} from "./objects.js";



//BACKGROUND (IMAGE FIXE)
// image
let imgBackgroundName = "arena";
let spriteBackground = assetsDir + imgBackgroundName + pngExt;
let imgBackground = new My_Img(spriteBackground, 0, 0, cnv.width, cnv.height);



//ANIMATED CHARACTER
// sprites
let imgPersoName = "RedDeathFrame_";
let spritesPerso = [];
for (let i = 0; i < 5; i++) {
    spritesPerso.push(assetsDir + imgPersoName + (i+1) + pngExt);
}
let sprites_death_src = [];
for (let i = 0; i < 5; i++) {
    sprites_death_src.push(assetsDir + "explosion_perso_" + (i+1) + pngExt);
}

//img animated character + death
let imgAnimatedPerso = new My_Img_Animated(spritesPerso, 10, 10, 30, 50, sprites_death_src)

// hitbox
let hitBoxPerso = new HitBox_Circle(
    imgAnimatedPerso.x + (imgAnimatedPerso.width / 2),
    imgAnimatedPerso.y + (imgAnimatedPerso.height / 2), 
    (imgAnimatedPerso.width + imgAnimatedPerso.height) / 5)

//object
let objectPerso = new My_Object(hitBoxPerso.x, hitBoxPerso.y, imgAnimatedPerso, hitBoxPerso, "ally", 0, 0);

// OBSTACLES
// sprites 
let imgObstaclesName = "vassels_";
let spritesObstacles = [];
for (let i = 0; i < 6; i++) {
    spritesObstacles.push(assetsDir + imgObstaclesName + (i+1) + pngExt);
}

// génération d'obstacles
for (let i = 0; i < 15; i++) {
    let randX = getRandom(0, cnv.width);
    let randY = getRandom(0, cnv.height);
    
    let distance = 0;
    while(distance < 120 || distance > 170) {
        randX = getRandom(0, cnv.width);
        randY = getRandom(0, cnv.height);
        
        let distanceX = cnv.width/2 - randX;
        let distanceY = cnv.height/2 - randY;
        distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
    }
    
    let imgAnimatedObstacle = new My_Img_Animated(spritesObstacles, randX - 15, randY - 15, 30, 30);
    let hitBoxObstacle = new HitBox_Circle(randX, randY, (imgAnimatedObstacle.width + imgAnimatedObstacle.height) / 4);
    new My_Object(randX, randY, imgAnimatedObstacle, hitBoxObstacle, "static", 0, 0);
}


// ANIMATED TOWERS
// sprites
let imgTowersName = "towers_";
let spritesTowers = [];
let numbers = [6, 6, 7, 7, 8, 8, 7, 7];
for (let i = 0; i < 8; i++) {
    spritesTowers.push(assetsDir + imgTowersName + numbers[i] + pngExt);
}

// animation tower

let imgAnimatedTowers = new My_Img_Animated(spritesTowers, cnv.width/2 - 60/2, cnv.height/2 - 60/2, 60, 60)

// towers

let towers = []
for (let i = 0; i < 1; i++) {
    
    let X = cnv.width/2;
    let Y = cnv.height/2;

    let hitBoxTower = new HitBox_Circle(
        imgAnimatedTowers.x + (imgAnimatedTowers.width / 2),
        imgAnimatedTowers.y + imgAnimatedTowers.height / 4, 
        (imgAnimatedTowers.width + imgAnimatedTowers.height) / 10)
        
    //object
    let tower = new My_Object(X, Y, imgAnimatedTowers, hitBoxTower, "enemy", 0, 0);
    towers.push(tower);
}

// BONUS

let imgBonus = "stars_";
let spritesBonus = [];
let numbers_ = [1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 3, 3, 3, 2, 2, 2];
for (let i = 0; i < numbers_.length; i++) {
    spritesBonus.push(assetsDir + imgBonus + numbers_[i] + pngExt);
}

let bonus_pos = [
    cnv.width - 30, 30,
    30, cnv.height -30,
    cnv.width - 30, cnv.height -30
]
for (let i = 0; i < 6; i+=2)
{
    let X = bonus_pos[i];
    let Y = bonus_pos[i+1];

    let imgBonus = new My_Img_Animated(spritesBonus, X - 20, Y - 20, 40, 40);
    let hitBoxBonus = new HitBox_Circle(X, Y, 20);
        
    //object
    new My_Object(X, Y, imgBonus, hitBoxBonus, "bonus", 0, 0);
}




// dat.GUI Folder
let backgroundFolder = gui.addFolder("Background");
backgroundFolder.add(imgBackground, "visible")

// dat.GUI folder
let persoFolder = gui.addFolder("Perso");
persoFolder.add(imgAnimatedPerso, "x", 0, cnv.width - imgAnimatedPerso.width, 1);
persoFolder.add(imgAnimatedPerso, "y", 0, cnv.height - imgAnimatedPerso.height, 1);
persoFolder.add(imgAnimatedPerso, "width", 10, cnv.width, 1);
persoFolder.add(imgAnimatedPerso, "height", 10, cnv.height, 1);
persoFolder.add(imgAnimatedPerso, "animated");
persoFolder.add(imgAnimatedPerso, "visible");
persoFolder.add(objectPerso.hitBox, "collision")
persoFolder.add(objectPerso.hitBox, "contours")
// objectPerso
// this.collision = true;
// this.contours = true;


// dat.GUI folder
let objectsFolder = gui.addFolder("Objects")
// objectsFolder.open();
objectsFolder.add(My_Object, "imgVisible").onChange(val => {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
});
objectsFolder.add(My_Object, "collision").onChange(val => {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
});
objectsFolder.add(My_Object, "hitBoxVisible").onChange(val => {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
});
objectsFolder.add(My_Object, "moving").onChange(val => {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
});




// KEYS DETECTION
var key_map = {};
onkeydown = onkeyup = function(e){
    key_map[e.key] = e.type == 'keydown';
}


function execute_inputs() {
    for (const key in key_map) {
        //touche non pressée
        if (!key_map[key]) { continue; }

        //touche pressée
        switch (key) {
            case "z":
                objectPerso.move(cnv, My_Object.instances, "up")
                break;
            case "q":
                objectPerso.move(cnv, My_Object.instances, "left")
                break;
            case "s":
                objectPerso.move(cnv, My_Object.instances, "down")
                break;
            case "d":
                objectPerso.move(cnv, My_Object.instances, "right")
                break;
        }
    }
}




function projectile(laucherX, launcherX){
    let x = laucherX;
    let y = launcherX;
    let velX = Math.random();
    let velY = Math.random();
    if (getRandom(0, 1)) {
        velX *= -1;
    }
    if (getRandom(0, 1)) {
        velY *= -1;
    }
    let sprite_ball_src = [];
    for (let i = 0; i < 4; i++) {
        sprite_ball_src.push(assetsDir + "fireballs_mid_" + (i+1) + pngExt);
    }

    let sprites_explosion_src = [];
    for (let i = 0; i < 8; i++) {
        sprites_explosion_src.push(assetsDir + "explosion_balle_" + (i+1) + pngExt);
    }

    let imgBall = new My_Img_Animated(sprite_ball_src, x, y, 20, 15, sprites_explosion_src)
    let hitBoxBall = new HitBox_Circle(x + 10, y + 7.5, (imgBall.height + imgBall.width) / 4);
    new My_Object(hitBoxBall.x, hitBoxBall.y, imgBall, hitBoxBall, "projectile", velX, velY); 

}

let intervale = 0;
function tirer(x, y){
    if (!shoot) { return; };
    if (intervale == 2){

        projectile(x, y);
        intervale = 0;

    }
    intervale++;
}


function updateGui() {
    backgroundFolder.updateDisplay();
    persoFolder.updateDisplay();
}

let itemp = 0;
function animations() {
    if (itemp == 4) {
        imgAnimatedPerso.next_frame();
        itemp = 0;
    }
    itemp++;

    for (const obj of My_Object.instances) {
        if (obj.object_image instanceof My_Img_Animated) {
            let loop = true;
            if (obj.dying) { loop = false; }
            obj.object_image.next_frame(loop);
        }
    }
}


function clear_dead_objects() {
    for (const dead_obj of My_Object.instances_dead) {
        let valeurASupprimer = dead_obj;

        let nouvelleListe = My_Object.instances.filter(function(element) {
            return element !== valeurASupprimer;
        });
        My_Object.instances = nouvelleListe;
    }
    My_Object.instances_dead = [];
}

function updates() {
    execute_inputs()

    for (const obj of My_Object.instances) {
        obj.update();
    }
    clear_dead_objects();
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    imgBackground.draw(ctx);

    for (const obj of My_Object.instances) {
        obj.draw(ctx);
    }

}

function move() {
    for (const obj of My_Object.instances) {
        obj.move(cnv, My_Object.instances);
    }
}



function update() {
    tirer(towers[0].x, towers[0].y);
    animations();
    move();
    draw();

    updates();
    
    updateGui();
}



setInterval(update, 100);
