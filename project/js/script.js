/* Moteurs de jeu - L3B*/
/* PROJECT:
 * Vampire Survivor like, 2D
 * */
/* CONTRIBUTORS:
 * Valentin GUILLON
 * Halima KSAL
 * Cheïmâa FAKIH
 * */


import { My_Object } from "./objects.js";
import { My_Button, create_home_page, camera , init_interface, Button_with_Image} from "./interface.js";
import { My_Img } from "./imgs.js";
import { initialise_listener, execute_inputs, MOUSE } from "./input.js";


export const CNV = document.getElementById("myCanvas");
export const CTX = CNV.getContext("2d");
let temp = Math.max(Math.min(window.innerWidth, window.innerHeight), 100);
CNV.width = temp
CNV.height = temp * 0.7
export const CNV10 = Math.floor(CNV.height * 0.1);

CTX.imageSmoothingEnabled = false;

export let gui = new dat.gui.GUI();
gui.hide()

export const ASSETS_DIR = "./assets/"
export const PNG_EXT = ".png";











function get_player() {
    let obj = My_Object.get_object("player");
    if (!obj) {
        obj = My_Object.get_object("player_auto");
    }
    return obj;
}

function update_bools_all_objects() {
    for (const obj of My_Object.instances) {
        obj.update_bools();
    }
}



//dat.GUI Folders
const guiVariables = {
    "imgVisible": true,
    "collision": true,
    "hitBox": false,
    "player_shoot": true,
    "turrets_shoot": true,
    "playerSpeed": 15
}


//PLAYER
let playerFolder = gui.addFolder("Player")
playerFolder.open()

playerFolder.add(guiVariables, "playerSpeed", 0, 100).onChange(val => {
    let obj = get_player();
    if (obj) { obj.speed = val;}
})
playerFolder.add(guiVariables, "player_shoot").onChange(val => {
    let obj = get_player();
    if (obj) { obj.shoot = val; }
 })


// OBJECTS
let objectsFolder = gui.addFolder("Objects")
objectsFolder.open();

objectsFolder.add(My_Object, "imgVisible").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "collision").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "hitBoxVisible").onChange(val => { update_bools_all_objects() } )
objectsFolder.add(My_Object, "moving").onChange(val =>{ update_bools_all_objects() } )


// TOWERS
let towersFolder = gui.addFolder("Towers")
towersFolder.open()

towersFolder.add(guiVariables, "turrets_shoot").onChange(val => {
    for (const obj of My_Object.instances) {
        if (obj.group != "enemy_turret") { continue; }
        if (obj.is_dead || obj.dying) { continue; }
        obj.shoot = val;
    }
} )


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
    update_btn_with_img();
    //draw buttons
    for (const btn of My_Button.instances) {
        btn.draw()
    }

    My_Object.draw_player_bonus();
}



function refresh(timestamp) {
    animations(timestamp);
    execute_inputs();
    actions(timestamp);
    My_Object.clear_dead_objects();
    My_Object.sort_objects();
    
    //the camera follows either the player or the canvas's center
    if (camera) {
        let objPlayer = get_player();
        if (objPlayer) {
            camera.update(objPlayer);
        }
        else {
            camera.update(undefined, CNV.width/2, CNV.height/2);
        }
    }

    draw();

    requestAnimationFrame(refresh);
}

init_interface();
initialise_listener();
create_home_page();
requestAnimationFrame(refresh);
