
import { My_Object } from "./objects.js";


export class Camera {
    constructor (x, y, imgBackground) {
        this.x = x;
        this.y = y;
        this.imgBackground = imgBackground;
        this.weight = 2; //a small weight made a harder camera
    }

    absolute_average(a, b) {
        if (a < 0) { a *= -1; }
        if (b < 0) { b *= -1; }
        return (a + b) / 2;
    }

    move_objects(addX, addY, central_obj) {
        if (addX < 1 && addX > -1) { addX = 0; }
        if (addY < 1 && addY > -1) { addY = 0; }

        this.imgBackground.x += addX;
        this.imgBackground.y += addY;

        for (const obj of My_Object.instances) {
            // if (obj.id == central_obj.id && obj instanceof Player_Object) { continue; }
            if (obj.group == "enemy_chasing") {
                obj.update_position(addX/2, addY/2);
                continue;
            }
            obj.update_position(addX, addY);
        }
    }


    //déplace la "caméra" pour placer X et Y au centre de l'écran
    update(cnv, obj = undefined, X = 0, Y = 0) {
        if (obj) {
            if (obj.dead || obj.dying) { return; }
            X = obj.x; Y = obj.y;
        }

        let x_mid = cnv.width / 2
        let y_mid = cnv.height / 2
        
        let diff_x = x_mid - X
        let diff_y = y_mid - Y

        this.move_objects(diff_x/this.weight, diff_y/this.weight, obj);
    }
}

