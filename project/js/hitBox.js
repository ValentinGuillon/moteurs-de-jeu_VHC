
import { distance, convert, draw_rect, draw_point } from "./tools.js";

export class HitBox_Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        //dat.GUI
        this.collision = true;
        this.contours = false;
    }


    is_colliding(obj) {
        if (!this.collision) { return false; }

        //collision disabled
        if (!this.collision) { return false; }
        //collide with another mask
        if (obj instanceof HitBox_Mask) {
            return obj.collide_with_circle(this);
        }
        //collide with Circle
        else if (obj instanceof HitBox_Circle) {
            return this.collide_with_circle(obj);
        }
        return false;
    }

    collide_with_circle(obj) {
        let distanceX = this.x - obj.x;
        let distanceY = this.y - obj.y;
        let distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

        return distance < this.radius + obj.radius;
    }


    draw_contours(ctx) {
        if (!this.contours) { return; }

        let thickness = 2;
        let color = "#FF0000";
        if (!this.collision) {
            thickness = 2;
            color = "#FF0000AA";
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
}



/*
 * !!! cette class doit recevoir une image respectant les règles suivantes:
 * A la même taille que l'image dont elle est le mask
 * Le fond doit être transparent
 */
export class HitBox_Mask {
    constructor(x, y, img, width, height, ctx) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = ctx
        this.mask = [] //boolens correspondant aux pixels d'une image
        this.mask_created = 20;
        
        //predefined Image class
        this.img = new Image();
        this.img.src = img;

        //dat.GUI
        this.collision = true;
        this.contours = false;
    }


    is_colliding(obj) {
        //creation of the mask
        if (this.mask_created > 0) {
            this.update_mask();
            this.mask_created--;
        }

        //collision disabled
        if (!this.collision) { return false; }

        //collide with other mask
        if (obj instanceof HitBox_Mask) {
            // draw_rect(this.ctx, this.x, this.y, this.width, this.height, "#55555511")
            return this.collide_with_mask(obj);
        }
        //collide with Circle
        else if (obj instanceof HitBox_Circle) {
            return this.collide_with_circle(obj);
        }

        return false;
    }


    //return true if at least one pixel of this.mask and obj.mask are both true
    collide_with_mask(obj) {
        //pre check
        //check if objects overlaps
        let overlapX = this.x+this.width >= obj.x && this.x < obj.x+obj.width
        let overlapY = this.y+this.height >= obj.y && this.y < obj.y+obj.height
        let englobeX = this.x < obj.x && this.x+this.width > obj.x+obj.width
        let englobeY = this.y < obj.y && this.y+this.height > obj.y+obj.height
        let insideX = this.x > obj.x && this.x+this.width < obj.x+obj.width
        let insideY = this.y > obj.y && this.y+this.height < obj.y+obj.height
        if (!(
            (overlapX && overlapY) ||
            ((englobeX || insideX || overlapX) && (englobeY || insideY || overlapY))
        )) { return false; }

        // console.log("overlap")
        //check
        let count = 0
        for (let j = 0; j < this.height; j++) {
            for (let i = 0; i < this.width; i++, count++) {
                //coordonnées générales du pixel
                let X = this.x + i;
                let Y = this.y + j;

                //si le point n'est pas surperposé à obj
                if (X < obj.x || X > obj.x + obj.width) { continue;}
                if (Y < obj.y || Y > obj.y + obj.height) { continue; }

                //index dans this.mask
                let iThis = i + (j * this.width);

                //index dans obj.mask
                let xOther = Math.floor(X - obj.x)
                let yOther = Math.floor(Y - obj.y)
                let iOther = xOther + (yOther * obj.width);

                // if (this.mask[iThis]) {
                //     draw_point(this.ctx, X, Y, "#00FF0055")
                // }

                if (this.mask[iThis] && obj.mask[iOther]) {
                    // draw_rect(this.ctx, X-1, Y-1, 3, 3, "#FF0000")
                    // console.log("collision")
                    return true; // Collision detected
                }
            }
        }
        return false;
    }

    //return true if the distance between the center of obj and at least one true pixel of this.mask is smaller than obj.radius
    collide_with_circle(obj) {
        //opti pour réduire par 4 le parcours de this.mask:
        //pre check pour vérifier la position relative de obj (haut ou haut-droite ou haut-gauche...) dans les 8 directions
        //ex: si l'obj est en haut à gauche, il faut vérifier ignorer les pixels dans la partie bas-droite de this.mask (donc x > width/2 && y > height/2)
        //ex: --   obj ----   bas, il faut ignore les pixels d'en haut (donc y < this.height/2)

        // draw_rect(this.ctx, obj.x-10, obj.y-10, 20, 20, "#FF000055")
        
        // this.ctx.beginPath();
        // this.ctx.arc(obj.x, obj.y, obj.radius, 0, 2*Math.PI);
        // this.ctx.lineWidth = 2;
        // this.ctx.fillStyle = "#0000FF55";
        // this.ctx.fill();
        // this.ctx.closePath();

        //pre check
        //check if objects overlaps
        let overlapX = this.x+this.width >= obj.x-obj.radius && this.x < obj.x+obj.radius
        let overlapY = this.y+this.height >= obj.y-obj.radius && this.y < obj.y+obj.radius
        if (!overlapX || !overlapY) { return false; }

        /*
         * pour chaque pixel true de this.mask
         *   si la distance avec le centre de obj est plus petite que rayon de obj, return true
         * return false
         */
        for (let j = 0; j < this.height; j++) {
            for (let i = 0; i < this.width; i++) {
                if (!this.mask[i + j*this.width]) { continue; }
                // draw_point(this.ctx, this.x+i, this.y+j, "#00FF00")
                let dist = distance(obj.x, obj.y, this.x+i, this.y+j)
                if (dist < obj.radius) { 
                    // draw_rect(this.ctx, this.x+i-1, this.y+j-1, 3, 3, "#FF0000")
                    // console.log("collision")
                    return true; }
            }
        }
        return false;
    }


    update_mask() {
        this.mask = this.create_mask();
    }


    get_pixels() {
        //draw the img
        draw_rect(this.ctx, this.x, this.y, this.width, this.height, "#00FF00")
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

        //get pixels data where the img was drawn
        let imgData = this.ctx.getImageData(this.x, this.y, this.width, this.height)
        return imgData.data;
    }

    create_mask() {
        let data = this.get_pixels();
        let mask = []
        let i = 0;
        for (let j = 0; j < this.height; j++) {
            for (let k = 0; k < this.width; k++, i+=4) {
                let color = convert(data[i], data[i+1], data[i+2]);
                //bordure
                if (j*k == 0 || j+1 == this.height || k+1 == this.width) {
                    color = false
                }
                //fond
                else if (color == "#00FF00") {
                    color = false;
                }
                //hitBox
                else {
                    color = true;
                }

                mask.push(color)
            }
        }
        return mask
    }


    draw_mask() {
        let color = "#FF0000BB"
        if (!this.collision) {
            color = "#FF000055";
        }
        let i = 0;
        for (let j = 0; j < this.height; j++) {
            for (let k = 0; k < this.width; k++, i++) {
                if (!this.mask[i]) { continue; }
                draw_point(this.ctx, this.x+k, this.y+j, color)
            }
        }
    }


    draw_contours(ctx) {
        if (!this.contours) { return; }
        this.draw_mask()
    }
}