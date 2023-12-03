
import { My_Img } from "./imgs.js";
import { My_Object } from "./objects.js";
import { CNV, CTX } from "./script.js";


export class Camera {
    constructor() {
        this.smoothness = 10; //a small value made a harder camera
    }


    absolute_average(a, b) {
        if (a < 0) { a *= -1; }
        if (b < 0) { b *= -1; }
        return (a + b) / 2;
    }


    move_objects(addX, addY) {
        if (addX < 1 && addX > -1) { addX = 0; }
        if (addY < 1 && addY > -1) { addY = 0; }

        for (const img of My_Img.instances) {
            img.x += addX;
            img.y += addY;
        }

        for (const obj of My_Object.instances) {
            // if (obj.id == central_obj.id && obj instanceof Player) { continue; }
            obj.update_position(addX, addY);
        }
    }


    //déplace la "caméra" pour placer X et Y au centre de l'écran
    update(obj_focus = undefined, X = 0, Y = 0) {
        if (obj_focus) {
            if (obj_focus.dead || obj_focus.dying) { return; }
            X = obj_focus.x; Y = obj_focus.y;
        }

        let x_mid = CNV.width / 2
        let y_mid = CNV.height / 2
        
        let diff_x = x_mid - X
        let diff_y = y_mid - Y

        this.move_objects(diff_x/this.smoothness, diff_y/this.smoothness);
    }
}

