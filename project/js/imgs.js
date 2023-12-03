
import { CNV, CTX } from "./script.js";
import { is_in_rect, distance, min } from "./tools.js";

export function draw_rect(x, y, width, height, color) {
    CTX.beginPath();
    CTX.rect(x, y, width, height);
    CTX.fillStyle = color
    CTX.fill();
    CTX.closePath();
}


export function draw_point(x, y, color) {
    draw_rect(x, y, 1, 1, color);
}


export function draw_circle_stroke(x, y, radius, color, thickness = 1) {
    CTX.beginPath();
    CTX.arc(x, y, radius, 0, 2*Math.PI);
    CTX.lineWidth = thickness;
    CTX.strokeStyle = color;
    CTX.stroke();
    CTX.closePath();
}


export function draw_circle_fill(x, y, radius, color) {
    CTX.beginPath();
    CTX.arc(x, y, radius, 0, 2*Math.PI);
    CTX.fillStyle = color;
    CTX.fill();
    CTX.closePath();
}



export class My_Img {
    constructor(imgSrc, x, y, width = 25, height = 25, iconeSrc = undefined, background_component = false) {
        this.imgSrc = imgSrc;
        this.iconeSrc = iconeSrc
        this.background_component = background_component;
    
        //size
        this.width = width;
        this.height = height;
    
        //position
        this.x = x - (width/2);
        this.y = y - (height/2);
    
        //predefined Image class
        this.img = new Image();
        if(imgSrc) {
            this.img.src = this.imgSrc;
        }
    
        this.icone = new Image();
        if(iconeSrc) {
            this.icone.src = this.iconeSrc;
            this.iconeSize = 40;
        }

        //dat.GUI
        this.visible = true;
    }



    static instances = [];

    static destroy_imgs() {
        My_Img.instances = [];
    }

    static add_instance(img) {
        My_Img.instances.push(img);
    }



    draw() {
        if (!this.imgSrc) { return; }
        if (!this.visible) { return; }
        if (this.iconeSrc && this.is_out_of_canvas()) {
            this.draw_icone();
        }
        if (this.background_component || !this.is_entirely_out_of_canvas()) {
            CTX.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    draw_icone() {
        let target = {"x": this.x+this.width/2, "y": this.y+this.height/2}
        let origin = {"x": CNV.width/2, "y": CNV.height/2}
        let dist = distance(target.x, target.y, origin.x, origin.y)
        let vector = {"x": (target.x - origin.x)/dist , "y": (target.y - origin.y) /dist}

        let border = {"x": 0, "y": 0};
        if (vector.x > 0) { border.x = CNV.width; }
        if (vector.y > 0) { border.y = CNV.height; }
        let distFromBorder = CNV.width + CNV.height;

        //move the origin to the target until he's near the border
        while (distFromBorder > 30) {
            origin.x += vector.x;
            origin.y += vector.y;

            let horizontal = Math.abs(distance(border.x, 0, origin.x, 0));
            let vertical = Math.abs(distance(0, border.y, 0, origin.y));
            distFromBorder = min(horizontal, vertical);
        }

        //define the icone size based on distance with the target
        let X = origin.x;
        let Y = origin.y;
        dist = distance(target.x, target.y, X, Y);
        let size = this.iconeSize;
        let thickness = 2;
        if (dist > 800) {
            size = Math.abs(size*0.2);
            thickness *= 0.2;
        }
        else if (dist > 500) {
            size = Math.abs(size*0.4);
            thickness *= 0.4;
        }
        else if (dist > 200) {
            size = Math.abs(size*0.6);
            thickness *= 0.6;
        }
        else if (dist > 100) {
            size = Math.abs(size*0.8);
            thickness *= 0.8;
        }

        let subSize = size * 0.8;
        draw_circle_fill(X, Y, size/2, "#000000");
        draw_circle_stroke(X, Y, size/2, "#FFFFFF", thickness);
        CTX.drawImage(this.icone, X-subSize/2, Y-subSize/2, subSize, subSize);
    }

    is_out_of_canvas() {
        if (!is_in_rect(this.x+this.width/2, this.y+this.height/2, 0, 0, CNV.width, CNV.height)) {
            return true;
        }
        return false;
    }

    is_entirely_out_of_canvas() {
        let left = this.x - this.width/2;
        let right = this.x + this.width/2;
        let up = this.y - this.height/2;
        let down = this.y + this.height/2;
        let coords = [
            {"x": left, "y": up},
            {"x": right, "y": up},
            {"x": left, "y": down},
            {"x": right, "y": down},
        ]

        for (let i = 0; i < 4; i++) {
            if (is_in_rect(coords[i].x, coords[i].y, 0, 0, CNV.width, CNV.height)) {
                return false;
            }
        }
        return true;
    }
}




//animated sprite with a SINGLE animation
export class My_Img_Animated extends My_Img {
    constructor(sprites, x, y, width, height, fps, sprites_death = [], iconeSrc = undefined) {
        super(sprites[0], x, y, width, height, iconeSrc);
        this.sprites = sprites;
        this.sprites_death = sprites_death;

        this.dead = false;

        this.fps = fps;
        this.previousTimestamp = undefined;

        //dat.GUI
        this.animated = true;
    }

    // return 0 if there is no sprite left
    next_frame(timestamp, loop = true) {
        if (this.previousTimestamp == undefined) {
            this.previousTimestamp = timestamp;
        }

        let elapsed = timestamp - this.previousTimestamp;
        let delay = 1000 / this.fps
        if (elapsed < delay) { return 1; }

        this.previousTimestamp = timestamp;

        if (this.sprites.length == 0) {
            this.dead = true;
            return 0;
        }
        
        if (!this.animated) {
            this.img.src = this.imgSrc;
            return 1;
        }

        let next = this.sprites.shift(); //remove the first list's element
        this.img.src = next;             //update current Img source
        if (loop) {
            this.sprites.push(next);     //push it at the end
        }
        return 1;
    }

    die() {
        this.sprites = this.sprites_death;
    }

}




export class My_Circle {
    constructor(x, y, rad, color) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.color = color;

        this.visible = true;
    }


    draw() {
        if (!this.visible) { return; }

        draw_circle_fill(this.x, this.y, this.rad, this.color);
    }
}
