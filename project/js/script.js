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
import { My_Button, create_menu, camera , init_interface, Button_with_Image} from "./interface.js";
import { My_Img } from "./imgs.js";
import { initialise_listener, execute_inputs, MOUSE } from "./input.js";


export const CNV = document.getElementById("myCanvas");
export const CTX = CNV.getContext("2d");

//set canvas size
const width = window.innerWidth;
const height = window.innerHeight;
if (width < height) {
    let temp = Math.max(Math.min(width, height), 100);
    CNV.width = temp
    CNV.height = temp*0.7
}
else {
    let temp = Math.max(Math.min(height*0.9, width), 100)
    CNV.width = temp*1.42
    CNV.height = temp
}
export const CNV10 = Math.floor(CNV.height * 0.1);

CTX.imageSmoothingEnabled = false;

export let gui = new dat.gui.GUI();
gui.hide()

export const ASSETS_DIR = "./assets/"
export const PNG_EXT = ".png";












function update_bools_all_objects() {
    for (const obj of My_Object.instances) {
        obj.update_bools();
    }
}

function give_bonus(bonus) {
    const obj = My_Object.get_player();
    if (obj) { obj.give_bonus(bonus); }
}



//dat.GUI Folders
const guiVariables = {
    "game freezed": false,
    "show image": true,
    "collision enabled": true,
    "show hitBox": false,
    "player_shoot": true,
    "turrets_shoot": true,
    "playerSpeed": 15,
    "player shot_by_seconds": 1/2,
    "giveInvicibility": function() {give_bonus("invicibility")},
    "giveGatling": function() {give_bonus("gatling")},
    "giveSpliter": function() {give_bonus("spliter")},
}


//PLAYER
let playerFolder = gui.addFolder("Player")
playerFolder.open()

playerFolder.add(guiVariables, "playerSpeed", 0, 100).onChange(val => {
    let obj = My_Object.get_player();
    if (obj) { obj.speed = val;}
})
playerFolder.add(guiVariables, "player_shoot").onChange(val => {
    let obj = My_Object.get_player();
    if (obj) { obj.shoot = val; }
 })
playerFolder.add(guiVariables, "player shot_by_seconds", 0.0, 10.0).onChange(val => {
    let obj = My_Object.get_player();
    if (obj) { obj.shot_by_seconds = val; }
 })
 playerFolder.add(guiVariables, "giveInvicibility");
 playerFolder.add(guiVariables, "giveGatling");
 playerFolder.add(guiVariables, "giveSpliter");


// OBJECTS
let objectsFolder = gui.addFolder("Objects")
objectsFolder.open();

objectsFolder.add(guiVariables, "show image")
objectsFolder.add(guiVariables, "collision enabled")
objectsFolder.add(guiVariables, "show hitBox")
objectsFolder.add(guiVariables, "game freezed")


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
    if (guiVariables["game freezed"]) { return; }
    for (const obj of My_Object.instances) {
        obj.animate(timestamp);
    }
}


function actions(timestamp) {
    for (const obj of My_Object.instances) {
        obj.action(timestamp, !guiVariables["game freezed"], guiVariables["collision enabled"]);
    }
}


function draw() {
    CTX.clearRect(0, 0, CNV.width, CNV.height);
    if (guiVariables["show image"]) {
        //draw imgs (that are not objects component)
        for (const img of My_Img.instances) {
            img.draw();
        }
        //draw objects
        for (const obj of My_Object.instances) {
            obj.draw();
        }
    }
    update_btn_with_img();
    //draw buttons
    for (const btn of My_Button.instances) {
        btn.draw()
    }

    My_Object.draw_player_bonus();

    //draw objects icone
    for (const obj of My_Object.instances) {
        if (obj.image) {
            obj.image.draw_icone();
        }
    }


    if (guiVariables["show hitBox"]) {
        for (const obj of My_Object.instances) {
            if (obj.hitBox) {
                obj.hitBox.draw_contours();
            }
        }
    }
}



function refresh(timestamp) {
    animations(timestamp);
    execute_inputs();
    actions(timestamp);
    My_Object.clear_dead_objects();
    My_Object.sort_objects();
    
    //the camera follows either the player or the canvas's center
    if (camera && !guiVariables["game freezed"]) {
        let objPlayer = My_Object.get_player();
        if (objPlayer) {
            camera.update(objPlayer);
        }
        else {
            camera.update(undefined, CNV.width/2, CNV.height/2);
        }
    }

    draw();
    MOUSE.moved = false;

    requestAnimationFrame(refresh);
}

init_interface();
initialise_listener();
create_menu("home_page");
requestAnimationFrame(refresh);
