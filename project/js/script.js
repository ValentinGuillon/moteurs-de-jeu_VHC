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
import { My_Button, create_home_page, camera } from "./interface.js";
import { My_Img } from "./imgs.js";


export const CNV = document.getElementById("myCanvas");
export const CTX = CNV.getContext("2d");

CTX.imageSmoothingEnabled = false;

let gui = new dat.gui.GUI();

export const ASSETS_DIR = "./assets/"
export const PNG_EXT = ".png";











//dat.GUI Folders
// BACKGROUND 
// let backgroundFolder = gui.addFolder("Background")
// backgroundFolder.add(imgBackground, "visible")

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
        if (obj.dead || obj.dying) { continue; }
        obj.shoot = !obj.shoot;
    }
}

let towersFolderBool = { towersCanShoot: true }
towersFolder.add(towersFolderBool, "towersCanShoot").onChange(val => { update_towers_shoot() } )



//dat.GUI Folders (END)












// click detection
CNV.addEventListener('click', function(evt) {
    var mousePos = getMousePos(evt);
    execute_click(mousePos, My_Button.instances)
}, false);

// keys detection
var key_map = {};
onkeydown = onkeyup = function(e){
    key_map[e.key] = e.type == 'keydown';
}





// Function to get the mouse position
function getMousePos(event) {
    if (!event) { return; }
    var rect = CNV.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
}


//check if a point is inside any button
//execute button action
function execute_click(pos, btns) {
    for (const btn of btns) {
        let X1 = btn.x;
        let Y1 = btn.y - btn.height;
        let X2 = btn.x + btn.width;
        let Y2 = btn.y;
        let inside = pos.x > X1 && pos.x < X2 && pos.y > Y1 && pos.y < Y2
        if (inside) {
            btn.action();
            return;
        }
    }
}


function get_player_object() {
    for (const obj of My_Object.instances) {
        if (obj.group == "player") {
            return obj;
        }
    }
    return undefined;
}


function execute_inputs() {
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

    let objPlayer = get_player_object();
    if (objPlayer) {
        //horizontal
        if (rightPressed && !leftPressed) {
            objPlayer.give_direction("right")
        }
        else if (!rightPressed && leftPressed) {
            objPlayer.give_direction("left")
        }
        //vertical
        if (downPressed && !upPressed) {
            objPlayer.give_direction("down")
        }
        else if (!downPressed && upPressed) {
            objPlayer.give_direction("up")
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
        let objPlayer = get_player_object()
        if (objPlayer) {
            camera.update(objPlayer);
        }
        else {
            camera.update(undefined, CNV.width/2, CNV.height/2);
        }
    }

    draw();

    updateGui()
    requestAnimationFrame(refresh);
}

create_home_page();
requestAnimationFrame(refresh);
