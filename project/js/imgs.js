

import { is_in_rect, distance, min } from "./tools.js";

export function draw_rect(ctx, x, y, width, height, color) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = color
    ctx.fill();
    ctx.closePath();
}


export function draw_point(ctx, x, y, color) {
    draw_rect(ctx, x, y, 1, 1, color);
}



export class My_Img {
    constructor(imgSrc, x, y, width = 25, height = 25, iconeSrc) {
        this.real_constructor(imgSrc, x, y, width, height, iconeSrc)

        //dat.GUI
        this.visible = true;
    }


    real_constructor(imgSrc, x, y, width, height, iconeSrc) {
        this.imgSrc = imgSrc;
        this.iconeSrc = iconeSrc

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
            this.iconeSize = 50;
        }
    }


    overwrite(imgSrc, x, y, width = 25, height = 25) {
        this.real_constructor(imgSrc, x, y, width, height);
    }


    draw(ctx, cnv, drawBackground = false) {
        if (!this.imgSrc) { return; }
        if (!this.visible) { return; }
        if (this.iconeSrc && this.is_out_of_canvas(cnv) && !drawBackground) {
            this.draw_icone(ctx, cnv);
        }
        if (drawBackground || !this.is_entirely_out_of_canvas(cnv)) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    draw_icone(ctx, cnv) {
        let target = {"x": this.x+this.width/2, "y": this.y+this.height/2}
        let origin = {"x": cnv.width/2, "y": cnv.height/2}
        let dist = distance(target.x, target.y, origin.x, origin.y)
        let vector = {"x": (target.x - origin.x)/dist , "y": (target.y - origin.y) /dist}

        let border = {"x": 0, "y": 0};
        if (vector.x > 0) { border.x = cnv.width; }
        if (vector.y > 0) { border.y = cnv.height; }
        let distFromBorder = cnv.width + cnv.height;

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
        if (dist > 800) {
            size = Math.abs(size*0.2);
        }
        else if (dist > 500) {
            size = Math.abs(size*0.4);
        }
        else if (dist > 200) {
            size = Math.abs(size*0.6);
        }
        else if (dist > 100) {
            size = Math.abs(size*0.8);
        }
        ctx.drawImage(this.icone, X-size/2, Y-size/2, size, size);
    }

    is_out_of_canvas(cnv) {
        if (!is_in_rect(this.x+this.width/2, this.y+this.height/2, 0, 0, cnv.width, cnv.height)) {
            return true;
        }
        return false;
    }

    is_entirely_out_of_canvas(cnv) {
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
            if (is_in_rect(coords[i].x, coords[i].y, 0, 0, cnv.width, cnv.height)) {
                return false;
            }
        }
        return true;
    }
}




//animated sprite with a SINGLE animation
export class My_Img_Animated extends My_Img {
    constructor(sprites, x, y, width, height, sprites_death = [], iconeSrc = undefined) {
        super(sprites[0], x, y, width, height, iconeSrc);
        this.sprites = sprites;
        this.sprites_death = sprites_death;

        this.dead = false;

        //dat.GUI
        this.animated = true;
    }

    // return 0 if there is no sprite left
    next_frame(loop = true) {
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


    draw(ctx, cnv) {
        if (!this.visible) { return; }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, 2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}
