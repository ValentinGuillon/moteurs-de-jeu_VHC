

import { CNV, gui } from "./script.js";
import { get_object } from "./objects.js";
import { My_Button } from "./interface.js";


export const MOUSE = {"x": 0, "y": 0};

var key_map = {};


export function initialise_listener() {
    // click detection
    CNV.addEventListener('click', function(evt) {
        var mousePos = getMousePos(evt);
        execute_click(mousePos, My_Button.instances)
    }, false);

    // keys detection
    onkeydown = onkeyup = function(e){
        key_map[e.key] = e.type == 'keydown';
    }
    
    // mouve position
    CNV.onmousemove = (event) => {
        var mousePos = getMousePos(event);
        MOUSE.x = mousePos.x
        MOUSE.y = mousePos.y
      }
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
        const inside = btn.is_inside(pos.x, pos.y);
        if (inside) {
            btn.action();
            return;
        }
    }
}




export function execute_inputs() {
    let rightPressed = false;
    let leftPressed = false;
    let downPressed = false;
    let upPressed = false;
    let rightPressed2 = false;
    let leftPressed2 = false;
    let downPressed2 = false;
    let upPressed2 = false;

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
            case "u":
                upPressed2 = true;
                break;
            case "h":
                leftPressed2 = true;
                break;
            case "j":
                downPressed2 = true;
                break;
            case "k":
                rightPressed2 = true;
                break;
            case "l":
                gui.hide();
                break;
            case "m":
                gui.show();
                break;
        }
    }

    let objPlayer = get_object("player");
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
    let objPlayer2 = get_object("player2");
    if (objPlayer2) {
        //horizontal
        if (rightPressed2 && !leftPressed2) {
            objPlayer2.give_direction("right")
        }
        else if (!rightPressed2 && leftPressed2) {
            objPlayer2.give_direction("left")
        }
        //vertical
        if (downPressed2 && !upPressed2) {
            objPlayer2.give_direction("down")
        }
        else if (!downPressed2 && upPressed2) {
            objPlayer2.give_direction("up")
        }
    }
}
