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
import { HitBox_Circle, HitBox_Mask } from "./hitBox.js";
import { My_Object, Player_Object, Enemy_Turret_Object, Static_Object, Enemy_Chasing_Object, Bonus_Object, Projectile_Object }
    from "./objects.js";
import { Camera } from "./camera.js";
import { My_Button, Button_with_text, create_Main_Menu, objectPlayer, imgBackground, camera } from "./interface.js";


let cnv = document.getElementById("myCanvas");
let ctx = cnv.getContext("2d");

ctx.imageSmoothingEnabled = false;

let gui = new dat.gui.GUI();

let assetsDir = "assets/"
let pngExt = ".png";










// OBJECTS
// //BACKGROUND
// // image
// let imgBackgroundName = "arena";
// let spriteBackground = assetsDir + imgBackgroundName + pngExt;
// imgBackground = new My_Img(spriteBackground, 0, 0, cnv.width, cnv.height);



// //PLAYER
// // sprites
// let imgPlayerName = "RedDeathFrame_";
// let spritesPlayerDefault = [];
// for (let i = 0; i < 5; i++) {
//     spritesPlayerDefault.push(assetsDir + imgPlayerName + (i+1) + pngExt);
// }
// let spritesPlayerDead = [];
// for (let i = 0; i < 5; i++) {
//     spritesPlayerDead.push(assetsDir + "explosion_perso_" + (i+1) + pngExt);
// }

// let xPlayer = cnv.width/2; let yPlayer = cnv.height/2;
// // animated img
// let imgAnimatedPlayer = new My_Img_Animated(spritesPlayerDefault, xPlayer-15, yPlayer-25, 30, 50, spritesPlayerDead)
// // hitbox
// // let hitBoxPerso = new HitBox_Circle(xPlayer, yPlayer, 
// //     (imgAnimatedPlayer.width + imgAnimatedPlayer.height) / 5)
// let hitBoxPerso = new HitBox_Mask(xPlayer-15, yPlayer-25, assetsDir+imgPlayerName+"mask_v2"+pngExt, 30, 50, ctx)

// //object
// let objectPlayer = new Player_Object(xPlayer, yPlayer, imgAnimatedPlayer, hitBoxPerso);



// // obstacles
// {
//     let x_mid = cnv.width / 2
//     let y_mid = cnv.height / 2
//     let x_objs = [x_mid+60, x_mid+60, x_mid-60, x_mid-60]
//     let y_objs = [y_mid+60, y_mid-60, y_mid+60, y_mid-60]
//     for (let i = 0; i < 2; i++) {
//         let imgName = "vassels_";
//         let spritesDefault = [];
//         for (let i = 0; i < 6; i++) {
//             spritesDefault.push(assetsDir + imgName + (i+1) + pngExt);
//         }

//         let X = x_objs[i]
//         let Y = y_objs[i]
//         let imgObj = new My_Img_Animated(spritesDefault, X-30, Y-30, 60, 60);
//         // let hitBoxObj = new HitBox_Circle(X, Y, 30)
//         let hitBoxObj = new HitBox_Mask(X-30, Y-30, assetsDir+imgName+"mask_v2"+pngExt, 60, 60, ctx)
//         new Static_Object(X, Y, imgObj, hitBoxObj)
//     }
//     for (let i = 2; i < 4; i++) {
//         let imgName = "vassels_";
//         let spritesDefault = [];
//         for (let i = 0; i < 6; i++) {
//             spritesDefault.push(assetsDir + imgName + (i+1) + pngExt);
//         }

//         let X = x_objs[i]
//         let Y = y_objs[i]
//         let imgObj = new My_Img_Animated(spritesDefault, X-30, Y-30, 60, 60);
//         let hitBoxObj = new HitBox_Circle(X, Y, 30)
//         // let hitBoxObj = new HitBox_Mask(X-30, Y-30, assetsDir+imgName+"mask_v2"+pngExt, 60, 60, ctx)
//         new Static_Object(X, Y, imgObj, hitBoxObj)
//     }
// }


// // towers
// {
//     let diff = 30;
//     let x_objs = [diff, diff, cnv.width-diff, cnv.width-diff]
//     let y_objs = [diff, cnv.height-diff, diff, cnv.height-diff]
//     for (let i = 0; i < 4; i++) {
//         let imgName = "towers_";
//         let nb = [6, 6, 7, 7, 8, 8, 7, 7];
//         let spritesDefault = [];
//         for (let i = 0; i < nb.length; i++) {
//             spritesDefault.push(assetsDir + imgName + nb[i] + pngExt);
//         }
//         let sprites_explosion_src = [];
//         for (let i = 0; i < 8; i++) {
//             sprites_explosion_src.push(assetsDir + "explosion_balle_" + (i+1) + pngExt);
//         }

//         let X = x_objs[i]
//         let Y = y_objs[i]
//         let imgObj = new My_Img_Animated(spritesDefault, X-20, Y-20, 40, 40, sprites_explosion_src);
//         // let hitBoxObj = new HitBox_Circle(X, Y, 15)
//         let hitBoxObj = new HitBox_Mask(X-20, Y-20, assetsDir+imgName+"mask_v2"+pngExt, 40, 40, ctx)
//         new Enemy_Turret_Object(X, Y, imgObj, hitBoxObj, ctx)
//     }
// }




// // bonus
// {
//     let x_mid = cnv.width / 2
//     let y_mid = cnv.height / 2
//     let diff = 40;
//     let x_objs = [diff, x_mid, x_mid, cnv.width-diff]
//     let y_objs = [y_mid, diff, cnv.height-diff, y_mid]
//     for (let i = 0; i < 4; i++) {
//         let imgName = "stars_";
//         let nb = [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2];
//         let spritesDefault = [];
//         for (let i = 0; i < nb.length; i++) {
//             spritesDefault.push(assetsDir + imgName + nb[i] + pngExt);
//         }

//         let X = x_objs[i]
//         let Y = y_objs[i]
//         let imgObj = new My_Img_Animated(spritesDefault, X-25, Y-25, 50, 50);
//         // let hitBoxObj = new HitBox_Circle(X, Y, 20)
//         let hitBoxObj = new HitBox_Mask(X-25, Y-25, assetsDir+imgName+"mask_v2"+pngExt, 50, 50, ctx)
//         new Bonus_Object(X, Y, imgObj, hitBoxObj)
//     }
// }


// // instances des mobs
// {
//     //Ennemis qui poursuivent le joueur
//     let nombreEnnemis = 10;
//     for (let i = 0; i < nombreEnnemis; i++) {
//         let enemyX = getRandom(0, cnv.width); // Position X aléatoire
//         let enemyY = getRandom(0, cnv.height); // Position Y aléatoire

//         // Création du cercle rouge pour faire l'ennemi
//         let enemyImage = {
//             draw: function(ctx) {
//                 ctx.beginPath();
//                 ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI); // Rayon de 15
//                 ctx.fillStyle = 'red';
//                 ctx.fill();
//                 ctx.closePath();
//             },
//             x: enemyX,
//             y: enemyY
//         };

//         //Hitbox sous forme de cercle
//         let enemyHitBox = new HitBox_Circle(enemyX, enemyY, 15);

//         let chasingEnemy = new Enemy_Chasing_Object(enemyX, enemyY, enemyImage, enemyHitBox, objectPlayer);
//         My_Object.instances.push(chasingEnemy);
//     }
// }


// OBJECTS (END)














//dat.GUI Folders
// BACKGROUND 
let backgroundFolder = gui.addFolder("Background")
// backgroundFolder.add(imgBackground, "visible")

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
// playerFolder.add(imgAnimatedPlayer, "animated")
// playerFolder.add(imgAnimatedPlayer, "visible")
// playerFolder.add(objectPlayer.hitBox, "collision")
// playerFolder.add(objectPlayer.hitBox, "contours")

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














// Function to get the mouse position
function getMousePos(cnv, event) {
    if (!event) { return; }
    var rect = cnv.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
}

//check whether a point is inside any button
function execute_click(pos, btns) {
    for (const btn of btns) {
        let X1 = btn.x;
        let Y1 = btn.y - btn.height;
        let X2 = btn.x + btn.width;
        let Y2 = btn.y;
        let inside = pos.x > X1 && pos.x < X2 && pos.y > Y1 && pos.y < Y2
        if (inside) {
            // console.log(btn.type);
            btn.action();
            return;
        }
    }
}






// keys detection
var key_map = {};
onkeydown = onkeyup = function(e){
    key_map[e.key] = e.type == 'keydown';
}

//click detection
cnv.addEventListener('click', function(evt) {
    var mousePos = getMousePos(cnv, evt);
    execute_click(mousePos, My_Button.instances)
}, false);


function execute_inputs() {
    // objectPlayer.save_position()
    let rightPressed = false;
    let leftPressed = false;
    let downPressed = false;
    let upPressed = false;

    for (const key in key_map) {
        //touche non pressée
        if (!key_map[key]) { continue; }

        //touche pressée
        switch (key) {
            case "z":
                upPressed = true;
                break;
            case "q":
                leftPressed = true;
                break;
            case "s":
                downPressed = true;
                break;
            case "d":
                rightPressed = true;
                break;
        }
    }

    if (objectPlayer) {
        //horizontal
        if (rightPressed && !leftPressed) {
            objectPlayer.give_direction("right")
        }
        else if (!rightPressed && leftPressed) {
            objectPlayer.give_direction("left")
        }
        //vertical
        if (downPressed && !upPressed) {
            objectPlayer.give_direction("down")
        }
        else if (!downPressed && upPressed) {
            objectPlayer.give_direction("up")
        }
    }
}


function clear_dead_objects() {
    let nouvelleListe = My_Object.instances.filter(function(element) {
        return !element.dead;
    });
    My_Object.instances = nouvelleListe;
}


//sort My_Objects.instances bases on element.y
function sort_objects() {
    let length = My_Object.instances.length
    for (let i = 0; i < length-1; i++) {
        for (let j = i; j < length-1; j++) {
            let switch_obj = false;
            if (My_Object.instances[j].y > My_Object.instances[j+1].y) { switch_obj = true; }
            if (!switch_obj) { continue; }
            let temp = My_Object.instances[j];
            My_Object.instances[j] = My_Object.instances[j+1];
            My_Object.instances[j+1] = temp;
        }
    }
}


let tempo = 0;
function animations() {
    //animation for Player (when alive)
    if (objectPlayer) {
        if (tempo == 2) {
            if (!objectPlayer.dying) {
                objectPlayer.object_image.next_frame();
                tempo = 0;
            }
        }
        tempo++;
    }

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
        obj.action(cnv, ctx);
    }
}


function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    imgBackground.draw(ctx);

    for (const obj of My_Object.instances) {
        obj.draw(ctx);
    }

    for (const btn of My_Button.instances) {
        btn.draw()
    }
}


function updateGui() {
    backgroundFolder.updateDisplay();
    playerFolder.updateDisplay();
}


function update() {
    // console.log(getMousePos(cnv, ))
    // ctx.clearRect(0, 0, cnv.width, cnv.height);
    sort_objects();
    animations();
    execute_inputs();
    actions();
    if (camera) {
        if (objectPlayer) {
            camera.update(cnv, objectPlayer);
        }
        else {
            camera.update(cnv, undefined, cnv.width/2, cnv.height/2);
        }
    }
    draw();

    clear_dead_objects();
    
    updateGui()
}

create_Main_Menu(ctx, cnv);
// let camera = new Camera(objectPlayer.x, objectPlayer.y, imgBackground);
// let camera = new Camera(cnv.width/2, cnv.height/2, imgBackground);
setInterval(update, 100);

