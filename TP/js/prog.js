
let cnv = document.getElementById("myCanvas");
let ctx = cnv.getContext("2d");

ctx.imageSmoothingEnabled = false;

let gui = new dat.gui.GUI();

let assetsDir = "assets/"
let pngExt = ".png";



function getRandom(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}











class My_Circle {
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




class myImg {
    constructor(imgSrc, w = 25, h = 25) {
        this.imgSrc = imgSrc;

        //size
        // this.defaultW = w; //used for dat.GUI
        // this.defaultH = h; //used for dat.GUI
        this.w = w;
        this.h = h;

        //position (relative to cnv)
        this.x = (cnv.width / 2) - (this.w / 2);
        this.y = (cnv.height / 2) - (this.h / 2);

        //predefined Image class
        this.img = new Image();
        this.img.src = this.imgSrc;

        //test
        this.visible = true;
    }


    draw(ctx) {
        if (this.visible) {
            // let decalageX = this.w / 2;
            // let decalageY = this.h / 2;
            // ctx.drawImage(this.img, this.x - decalageX, this.y - decalageY, this.w, this.h);

            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }


    // reset() {
    //     this.w = this.defaultW;
    //     this.h = this.defaultH;
    //     this.x = (cnv.width / 2) - (this.w / 2);
    //     this.y = (cnv.height / 2) - (this.h / 2);
    //     this.img.src = this.img;
    // }
}




//animated sprite with a SINGLE animation
class myAnimatedImg extends myImg {
    constructor(sprites = [], w = 25, h = 25) {
        super(sprites[0], w, h);
        this.sprites = sprites;

        this.animated = true;

        // this.xSpeed = 10;
        // this.ySpeed = 0;
    }


    next_frame() {
        if (!this.animated) {
            this.img.src = this.imgSrc;
        }
        else {
            let next = this.sprites.shift(); //remove the first list's element
            this.sprites.push(next);         //push it at the end
            this.img.src = next;             //update current Img source
        }
    }


    // //comment faire hériter de myImg.reset() ???
    // reset() {
    //     this.img.src = this.img;
    //     this.w = this.defaultW; //defaultW comes from myImg class
    //     this.h = this.defaultH; //defaultH comes from myImg class
    //     this.x = (cnv.width / 2) - (this.w / 2);
    //     this.y = (cnv.height / 2) - (this.h / 2);
    //     this.xSpeed = 10;
    //     this.ySpeed = 0;
    //     this.walk = true;
    // }
}




class HitBox_Circle {
    constructor(x, y, rad) {
        this.x = x;
        this.y = y;
        this.rad = rad;

        this.collision = true;
        this.contours = true;
    }

    is_collides(obj) {
        if (!this.collision) { return false; }

        let distanceX = this.x - obj.x;
        let distanceY = this.y - obj.y;
        let distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

        return distance < this.rad + obj.rad;
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
        ctx.arc(this.x, this.y, this.rad, 0, 2*Math.PI);

        ctx.lineWidth = thickness;
        ctx.strokeStyle = color;

        ctx.stroke();

        ctx.closePath();
    }
}




class My_object {
    constructor(x, y, img, hitBox, velocityX = 1.0, velocityY = 0.0) {
        this.x = x;
        this.y = y;
        this.img = img;
        this.hitBox = hitBox;

        this.speed = 10;
        this.velocityX = velocityX; //beween -1 and 1
        this.velocityY = velocityY; //beween -1 and 1

        this.id = -1;

        this.stop = false;
    }
    
    static instances = [];
    static id = 0;
    static imgVisible = true;
    static collision = true;
    static hitBoxVisible = false;
    static moving = true;

    update_bool() {
        this.img.visible = My_object.imgVisible;
        this.hitBox.collision = My_object.collision;
        this.hitBox.contours = My_object.hitBoxVisible;
        this.stop = !My_object.moving;
    }

    addInstance() {
        if (this.id != -1) {
            console.log("This obj already added:")
            console.log(this)
            return;
        }

        this.id = My_object.id;
        My_object.id++;
        My_object.instances.push(this);
    }


    draw(ctx) {
        this.img.draw(ctx);
        this.hitBox.draw_contours(ctx);
    }

    move(cnv, other_objects) {
        if (this.stop) { return; }

        //collision with every objects
        for (const obj of other_objects) {
            if (obj == this) { continue; }
            if (obj.hitBox.is_collides(this.hitBox)) {
                console.log("COLLISION", this.id, obj.id);
                this.velocityX *= -1;
                // this.velocityY *= -1;
                obj.velocityX *= -1;
                obj.velocityY *= -1;
            }
        }


        let limit_right = cnv.width;
        let limit_down = cnv.height;

        //update position
        this.x += this.speed * this.velocityX;
        this.y += this.speed * this.velocityY;

        //out of screen
        if (this.x > limit_right) {
            this.x -= limit_right;
        }
        else if (this.x < 0) {
            this.x = limit_right - this.x;
        }
        if (this.y > limit_down) {
            this.y -= limit_down;
        }
        else if (this.y < 0) {
            this.y = limit_down - this.y;
        }

        //update img and hitBox position
        this.img.x = this.x;
        this.img.y = this.y;

        this.hitBox.x = this.x;
        this.hitBox.y = this.y;

    }

    randomlyUpdateVelocity() {
    }
}









//PAYSAGE (IMAGE FIXE)
// image
let imgPaysageName = "paysage";
let spritePaysage = assetsDir + imgPaysageName + pngExt;
let imgPaysage = new myImg(spritePaysage, cnv.width, cnv.height);

// dat.GUI Folder
let paysageFolder = gui.addFolder("Paysage");
// paysageFolder.open()

paysageFolder.add(imgPaysage, "visible")




//ANIMATED CHARACTER (ANIMATED IMAGE FIX)
// image
let imgPersoName = "RedDeathFrame_";
let spritesPerso = [];
for (let i = 0; i < 5; i++) {
    spritesPerso.push(assetsDir + imgPersoName + (i+1) + pngExt);
}

let imgAnimatedPerso = new myAnimatedImg(spritesPerso, 100, 100)
// let hitBoxPerso = new HitBox_Circle(100, 100, 40);
// let objectPerso = new My_object(imgAnimatedPerso.x, imgAnimatedPerso.y, imgAnimatedPerso, hitBoxPerso, 0, 0);
// objectPerso.addInstance()

// dat.GUI folder
let persoFolder = gui.addFolder("Perso");

persoFolder.add(imgAnimatedPerso, "x", 0, cnv.width - imgAnimatedPerso.w, 1);
persoFolder.add(imgAnimatedPerso, "y", 0, cnv.height - imgAnimatedPerso.h, 1);
persoFolder.add(imgAnimatedPerso, "w", 10, cnv.width, 1);
persoFolder.add(imgAnimatedPerso, "h", 10, cnv.height, 1);
persoFolder.add(imgAnimatedPerso, "animated");
persoFolder.add(imgAnimatedPerso, "visible");
// persoFolder.add(imgAnimatedPerso, "reset");




// circles
let circlesFolder = gui.addFolder("Circles");
circlesFolder.open()

circlesFolder.add(My_object, "imgVisible")
circlesFolder.add(My_object, "collision")
circlesFolder.add(My_object, "hitBoxVisible")
circlesFolder.add(My_object, "moving")



//generate movingCircles to random position
for (let i = 0; i < 10; i++) {
    let tempX = getRandom(0, cnv.width);
    let tempY = getRandom(0, cnv.height);
    let rad = 20;
    let velx = Math.random();
    let vely = Math.random();
    let negative_velx = getRandom(0, 1);
    let negative_vely = getRandom(0, 1);
    if (negative_velx) { velx *= -1; }
    if (negative_vely) { vely *= -1; }

    let circleImg = new My_Circle(tempX, tempY, rad, "#00FF00");
    let hitBox = new HitBox_Circle(tempX, tempY, rad);

    let newObj = new My_object(tempX, tempY, circleImg, hitBox, velx, vely);

    newObj.addInstance();
}








function updateGui() {
    paysageFolder.updateDisplay();
    persoFolder.updateDisplay();
}
let itemp = 0;
function animations() {
    if (itemp == 5) {
        imgAnimatedPerso.next_frame();
        itemp = 0;
    }
    itemp++;
}

function updates() {
    for (const obj of My_object.instances) {
        obj.update_bool();
    }
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    imgPaysage.draw(ctx);
    imgAnimatedPerso.draw(ctx);

    for (const obj of My_object.instances) {
        obj.draw(ctx);
    }

}

function move() {
    for (const obj of My_object.instances) {
        obj.move(cnv, My_object.instances);
    }
}



function update() {
    animations();
    move();
    draw();

    updates();
    
    updateGui();
}

setInterval(update, 50);
