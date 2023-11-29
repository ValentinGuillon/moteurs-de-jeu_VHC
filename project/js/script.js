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
import { My_Button, create_home_page, imgBackground, camera } from "./interface.js";


let cnv = document.getElementById("myCanvas");
let ctx = cnv.getContext("2d");

ctx.imageSmoothingEnabled = false;

let gui = new dat.gui.GUI();

let assetsDir = "assets/"
let pngExt = ".png";











//dat.GUI Folders
// BACKGROUND 
let backgroundFolder = gui.addFolder("Background")
backgroundFolder.add(imgBackground, "visible")

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
cnv.addEventListener('click', function(evt) {
    var mousePos = getMousePos(cnv, evt);
    execute_click(mousePos, My_Button.instances)
}, false);

// keys detection
var key_map = {};
onkeydown = onkeyup = function(e){
    key_map[e.key] = e.type == 'keydown';
}





// Function to get the mouse position
function getMousePos(cnv, event) {
    if (!event) { return; }
    var rect = cnv.getBoundingClientRect();
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


function animations() {
    for (const obj of My_Object.instances) {
        obj.animate();
    }
}


function actions() {
    for (const obj of My_Object.instances) {
        obj.action(cnv, ctx);
    }
}


function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    //draw background
    if (imgBackground) {
        imgBackground.draw(ctx);
    }
    //draw objects
    for (const obj of My_Object.instances) {
        obj.draw(ctx);
    }
    //draw buttons
    for (const btn of My_Button.instances) {
        btn.draw()
    }
}


function updateGui() {
    backgroundFolder.updateDisplay();
}


function refresh() {
    My_Object.sort_objects();
    animations();
    execute_inputs();
    actions();

    //the camera follows either the player or the canvas's center
    if (camera) {
        let objPlayer = get_player_object()
        if (objPlayer) {
            camera.update(cnv, My_Object.instances, objPlayer);
        }
        else {
            camera.update(cnv, My_Object.instances, undefined, cnv.width/2, cnv.height/2);
        }
    }

    draw();

    My_Object.clear_dead_objects();
    
    updateGui()
}

create_home_page(ctx, cnv);
setInterval(refresh, 100);
