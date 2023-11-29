

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
    constructor(imgSrc, x, y, width = 25, height = 25) {
        this.imgSrc = imgSrc;

        //size
        this.width = width;
        this.height = height;

        //position
        this.x = x;
        this.y = y;

        //predefined Image class
        this.img = new Image();
        if(imgSrc) {
            this.img.src = this.imgSrc;
        }

        //dat.GUI
        this.visible = true;
    }

    overwrite(imgSrc, x, y, width = 25, height = 25) {
        this.imgSrc = imgSrc;

        //size
        this.width = width;
        this.height = height;

        //position
        this.x = x;
        this.y = y;

        //predefined Image class
        this.img = new Image();
        if(imgSrc) {
            this.img.src = this.imgSrc;
        }
    }


    draw(ctx) {
        if (!this.imgSrc) { return; }
        if (!this.visible) { return; }
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}




//animated sprite with a SINGLE animation
export class My_Img_Animated extends My_Img {
    constructor(sprites, x, y, width, height, sprites_death = []) {
        super(sprites[0], x, y, width, height);
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


    draw(ctx) {
        if (!this.visible) { return; }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, 2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}
