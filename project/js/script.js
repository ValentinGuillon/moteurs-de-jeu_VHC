/* Moteurs de jeu - L3B*/
/* PROJECT:
 * Vampire Survivor like, 2D
 * */
/* CONTRIBUTORS:
 * Valentin GUILLON
 * Halima KSAL
 * Cheïmâa FAKIH
 * */


import { getRandom } from "./tools.js";
import { My_Img, My_Img_Animated } from "./imgs.js";
import { HitBox_Circle } from "./hitBox.js";
import { My_Object, Player_Object, Enemy_Turret_Object, Static_Object, Bonus_Object, Projectile_Object }
    from "./objects.js";
import { Camera } from "./camera.js";


let cnv = document.getElementById("myCanvas");
let ctx = cnv.getContext("2d");

ctx.imageSmoothingEnabled = false;

let gui = new dat.gui.GUI();

let assetsDir = "assets/"
let pngExt = ".png";










// OBJECTS
//BACKGROUND
// image
let imgBackgroundName = "arena";
let spriteBackground = assetsDir + imgBackgroundName + pngExt;
let imgBackground = new My_Img(spriteBackground, 0, 0, cnv.width, cnv.height);



//PLAYER
// sprites
let imgPlayerName = "RedDeathFrame_";
let spritesPlayerDefault = [];
for (let i = 0; i < 5; i++) {
    spritesPlayerDefault.push(assetsDir + imgPlayerName + (i+1) + pngExt);
}
let spritesPlayerDead = [];
for (let i = 0; i < 5; i++) {
    spritesPlayerDead.push(assetsDir + "explosion_perso_" + (i+1) + pngExt);
}

let xPlayer = cnv.width/2; let yPlayer = cnv.height/2;
// animated img
let imgAnimatedPlayer = new My_Img_Animated(spritesPlayerDefault, xPlayer-15, yPlayer-25, 30, 50, spritesPlayerDead)
// hitbox
let hitBoxPerso = new HitBox_Circle(xPlayer, yPlayer, 
    (imgAnimatedPlayer.width + imgAnimatedPlayer.height) / 5)
//object
let objectPlayer = new Player_Object(xPlayer, yPlayer, imgAnimatedPlayer, hitBoxPerso);



// obstacles
{
    let x_mid = cnv.width / 2
    let y_mid = cnv.height / 2
    let x_objs = [x_mid+60, x_mid+60, x_mid-60, x_mid-60]
    let y_objs = [y_mid+60, y_mid-60, y_mid+60, y_mid-60]
    for (let i = 0; i < 4; i++) {
        let imgName = "vassels_";
        let spritesDefault = [];
        for (let i = 0; i < 6; i++) {
            spritesDefault.push(assetsDir + imgName + (i+1) + pngExt);
        }

        let X = x_objs[i]
        let Y = y_objs[i]
        let imgObj = new My_Img_Animated(spritesDefault, X-30, Y-30, 60, 60);
        let hitBoxObj = new HitBox_Circle(X, Y, 30)
        new Static_Object(X, Y, imgObj, hitBoxObj)
    }
}


// towers
{
    let diff = 30;
    let x_objs = [diff, diff, cnv.width-diff, cnv.width-diff]
    let y_objs = [diff, cnv.height-diff, diff, cnv.height-diff]
    for (let i = 0; i < 4; i++) {
        let imgName = "towers_";
        let nb = [6, 6, 7, 7, 8, 8, 7, 7];
        let spritesDefault = [];
        for (let i = 0; i < nb.length; i++) {
            spritesDefault.push(assetsDir + imgName + nb[i] + pngExt);
        }

        let X = x_objs[i]
        let Y = y_objs[i]
        let imgObj = new My_Img_Animated(spritesDefault, X-20, Y-20, 40, 40);
        let hitBoxObj = new HitBox_Circle(X, Y, 15)
        new Enemy_Turret_Object(X, Y, imgObj, hitBoxObj)
    }
}


// bonus
{
    let x_mid = cnv.width / 2
    let y_mid = cnv.height / 2
    let diff = 40;
    let x_objs = [diff, x_mid, x_mid, cnv.width-diff]
    let y_objs = [y_mid, diff, cnv.height-diff, y_mid]
    for (let i = 0; i < 4; i++) {
        let imgName = "stars_";
        let nb = [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2];
        let spritesDefault = [];
        for (let i = 0; i < nb.length; i++) {
            spritesDefault.push(assetsDir + imgName + nb[i] + pngExt);
        }

        let X = x_objs[i]
        let Y = y_objs[i]
        let imgObj = new My_Img_Animated(spritesDefault, X-25, Y-25, 50, 50);
        let hitBoxObj = new HitBox_Circle(X, Y, 20)
        new Bonus_Object(X, Y, imgObj, hitBoxObj)
    }
}


// OBJECTS (END)














//dat.GUI Folders
// BACKGROUND 
let backgroundFolder = gui.addFolder("Background")
backgroundFolder.add(imgBackground, "visible")

// OBJECTS
let objectsFolder = gui.addFolder("Objects")
objectsFolder.open();

function update_bools_all_objects() {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
}

objectsFolder.add(My_Object, "imgVisible").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "collision").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "hitBoxVisible").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "moving").onChange(val =>{ update_bools_all_objects() } )

// PLAYER
let playerFolder = gui.addFolder("Player")
playerFolder.add(imgAnimatedPlayer, "animated")
playerFolder.add(imgAnimatedPlayer, "visible")
playerFolder.add(objectPlayer.hitBox, "collision")
playerFolder.add(objectPlayer.hitBox, "contours")

// TOWERS
let towersFolder = gui.addFolder("Towers")
towersFolder.open()

function update_towers_shoot() {
    for (const obj of My_Object.instances) {
        if (!(obj instanceof Enemy_Turret_Object)) { continue; }
        if (obj.dead || obj.dying) { console.log("dead"); continue; }
        obj.shoot = !obj.shoot;
    }
}

let towersFolderBool = { towersCanShoot: true }
towersFolder.add(towersFolderBool, "towersCanShoot").onChange(val => { update_towers_shoot() } )



//dat.GUI Folders (END)



















let camera = new Camera(objectPlayer.x, objectPlayer.y, imgBackground);


// keys detection
var key_map = {};
onkeydown = onkeyup = function(e){
    key_map[e.key] = e.type == 'keydown';
}


function execute_inputs() {
    // objectPlayer.save_position()
    for (const key in key_map) {
        //touche non pressée
        if (!key_map[key]) { continue; }

        //touche pressée
        switch (key) {
            case "z":
                objectPlayer.hard_move(cnv, "up")
                break;
            case "q":
                objectPlayer.hard_move(cnv, "left")
                break;
            case "s":
                objectPlayer.hard_move(cnv, "down")
                break;
            case "d":
                objectPlayer.hard_move(cnv, "right")
                break;
        }
    }
}


function clear_dead_objects() {
    let nouvelleListe = My_Object.instances.filter(function(element) {
        return !element.dead;
    });
    My_Object.instances = nouvelleListe;
}


let tempo = 0;
function animations() {
    //animation for Player (when alive)
    if (tempo == 2) {
        if (!objectPlayer.dying) {
            imgAnimatedPlayer.next_frame();
            tempo = 0;
        }
    }
    tempo++;

    for (const obj of My_Object.instances) {
        if (obj.object_image instanceof My_Img_Animated) {
            //let player animate when dying
            if (obj.group == "player") { if (!obj.dying) { continue; } }
            let loop = true;
            if (obj.dying) { loop = false; }
            obj.object_image.next_frame(loop);
        }
    }
}


function actions() {
    for (const obj of My_Object.instances) {
        obj.action(cnv);
    }
}


function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    imgBackground.draw(ctx);

    for (const obj of My_Object.instances) {
        obj.draw(ctx);
    }
}


function updateGui() {
    backgroundFolder.updateDisplay();
    playerFolder.updateDisplay();
}


function update() {
    animations();
    execute_inputs();
    actions();
    draw();

    camera.update(cnv, objectPlayer);

    clear_dead_objects();
    
    updateGui();
}


setInterval(update, 100);

