

import { CNV, gui } from "./script.js";
import { get_player_object } from "./objects.js";
import { My_Button } from "./interface.js";




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
            case "l":
                gui.hide();
                break;
            case "m":
                gui.show();
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
