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
import {My_Object, Player_Object, Enemy_Turret_Object, Static_Object, Bonus_Object}
    from "./objects.js";



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
let objectPerso = new Player_Object(hitBoxPerso.x, hitBoxPerso.y, imgAnimatedPerso, hitBoxPerso, 0, 0);

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
    new Static_Object(randX, randY, imgAnimatedObstacle, hitBoxObstacle, 0, 0);
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


// towers

let towers = []
for (let i = 0; i < 1; i++) {
    
    let X = cnv.width/2;
    let Y = cnv.height/2;
    
    //img
    let imgAnimatedTowers = new My_Img_Animated(spritesTowers, X - 60/2, Y - 60/2, 60, 60)
    //hitBox
    let hitBoxTower = new HitBox_Circle(X, Y - 20, 
        (imgAnimatedTowers.width + imgAnimatedTowers.height) / 10)
    //object
    let tower = new Enemy_Turret_Object(X, Y, imgAnimatedTowers, hitBoxTower, 0, 0);
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
    new Bonus_Object(X, Y, imgBonus, hitBoxBonus, 0, 0);
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
                objectPerso.move(cnv, "up")
                break;
            case "q":
                objectPerso.move(cnv, "left")
                break;
            case "s":
                objectPerso.move(cnv, "down")
                break;
            case "d":
                objectPerso.move(cnv, "right")
                break;
        }
    }
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


function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    imgBackground.draw(ctx);

    for (const obj of My_Object.instances) {
        obj.draw(ctx);
    }

}

function actions() {
    for (const obj of My_Object.instances) {
        obj.action(cnv);
    }
}



function update() {
    animations();
    actions();
    draw();

    execute_inputs()
    clear_dead_objects();
    
    updateGui();
}



setInterval(update, 100);
