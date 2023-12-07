/* Moteurs de jeu - L3B*/
/* PROJECT:
 * Vampire Survivor like, 2D
 * */
/* CONTRIBUTORS:
 * Valentin GUILLON
 * Halima KSAL
 * Cheïmâa FAKIH
 * */


import { My_Object, get_object } from "./objects.js";
import { My_Button, create_home_page, camera , init_interface, Button_with_Image} from "./interface.js";
import { My_Img } from "./imgs.js";
import { initialise_listener, execute_inputs, MOUSE } from "./input.js";


export const CNV = document.getElementById("myCanvas");
export const CTX = CNV.getContext("2d");
let temp = Math.max(Math.min(window.innerWidth, window.innerHeight), 500);
CNV.width = temp
CNV.height = temp * 0.7

CTX.imageSmoothingEnabled = false;

export let gui = new dat.gui.GUI();
gui.hide()

export const ASSETS_DIR = "./assets/"
export const PNG_EXT = ".png";











//dat.GUI Folders
//PLAYER
let playerFolder = gui.addFolder("Player")
playerFolder.open()

function update_player_speed(new_val) {
    let player = undefined;
    for (const obj of My_Object.instances) {
        if (obj.group != "player") { continue; }
        player = obj;
        break;
    }
    if (!player) { return; }
    My_Object.playerSpeed = new_val;
    player.speed = new_val;
}

playerFolder.add(My_Object, "playerSpeed", 0, 100).onChange(val => { update_player_speed(val) })


// OBJECTS
let objectsFolder = gui.addFolder("Objects")
objectsFolder.open();

function update_bools_all_objects() {
    for (const obj of My_Object.instances) {
        obj.update_bools();
    }
}

objectsFolder.add(My_Object, "imgVisible").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "collision").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "hitBoxVisible").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "moving").onChange(val =>{ update_bools_all_objects() } )

// TOWERS
let towersFolder = gui.addFolder("Towers")
towersFolder.open()

function update_towers_shoot() {
    for (const obj of My_Object.instances) {
        if (obj.group != "enemy_turret") { continue; }
        if (obj.is_dead || obj.dying) { continue; }
        obj.shoot = !obj.shoot;
    }
}

let towersFolderBool = { towersCanShoot: true }
towersFolder.add(towersFolderBool, "towersCanShoot").onChange(val => { update_towers_shoot() } )



//dat.GUI Folders (END)










function update_btn_with_img() {
    for (const btn of My_Button.instances) {
        if (!(btn instanceof Button_with_Image)) { continue; }
        if (!(btn.change_when_hover)) { continue; }
        const inside = btn.is_inside(MOUSE.x, MOUSE.y);
        if (inside) {
            btn.set("hover");
        }
        else {
            btn.set("default")
        }
    }
}


function animations(timestamp) {
    for (const obj of My_Object.instances) {
        obj.animate(timestamp);
    }
}


function actions(timestamp) {
    for (const obj of My_Object.instances) {
        obj.action(timestamp);
    }
}


function draw() {
    CTX.clearRect(0, 0, CNV.width, CNV.height);
    //draw imgs (that are not objects component)
    for (const img of My_Img.instances) {
        img.draw();
    }
    //draw objects
    for (const obj of My_Object.instances) {
        obj.draw();
    }
    //draw buttons
    for (const btn of My_Button.instances) {
        btn.draw()
    }
}


function updateGui() {
    // backgroundFolder.updateDisplay();
    playerFolder.updateDisplay();
}


function refresh(timestamp) {
    animations(timestamp);
    execute_inputs();
    actions(timestamp);
    My_Object.clear_dead_objects();
    My_Object.sort_objects();
    
    //the camera follows either the player or the canvas's center
    if (camera) {
        let objPlayer = get_object("player")
        if (objPlayer) {
            camera.update(objPlayer);
        }
        else {
            camera.update(undefined, CNV.width/2, CNV.height/2);
        }
    }

    update_btn_with_img();
    draw();

    updateGui()
    requestAnimationFrame(refresh);
}

init_interface();
initialise_listener();
create_home_page();
requestAnimationFrame(refresh);
