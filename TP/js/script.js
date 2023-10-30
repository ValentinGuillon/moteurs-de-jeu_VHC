
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




class My_Img {
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
        this.img.src = this.imgSrc;

        //dat.GUI
        this.visible = true;
    }


    draw(ctx) {
        if (this.visible) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
}



//animated sprite with a SINGLE animation
class My_Img_Animated extends My_Img {
    constructor(sprites = [], x = 0, y = 0, width = 25, height = 25) {
        super(sprites[0], x, y, width, height);
        this.sprites = sprites;

        //dat.GUI
        this.animated = true;
    }


    next_frame() {
        if (!this.animated) {
            this.img.src = this.imgSrc;
            return;
        }

        let next = this.sprites.shift(); //remove the first list's element
        this.sprites.push(next);         //push it at the end
        this.img.src = next;             //update current Img source
    }
}




class HitBox_Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        //dat.GUI
        this.collision = true;
        this.contours = true;
    }


    is_colliding(obj) {
        if (!this.collision) { return false; }

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




class My_Object {
    constructor(x, y, object_image, hitBox, group = "", velocityX = 1.0, velocityY = 0.0) {
        this.x = x;
        this.y = y;
        this.object_image = object_image;
        this.hitBox = hitBox;

        this.speed = 10;
        this.velocityX = velocityX; //beween -1 and 1
        this.velocityY = velocityY; //beween -1 and 1

        this.group = group; //"ally", "ennemy", "static"

        this.id = -1;

        this.stop = false;
        this.dead = false;

        this.addInstance();
    }

    static instances = [];
    static id = 0;
    static imgVisible = true;
    static collision = true;
    static hitBoxVisible = true;
    static moving = true;

    update_bool() {
        this.object_image.visible = My_Object.imgVisible;
        this.hitBox.collision = My_Object.collision;
        this.hitBox.contours = My_Object.hitBoxVisible;
        this.stop = !My_Object.moving;
    }

    addInstance() {
        if (this.id != -1) {
            console.log("This obj already added:")
            console.log(this)
            return;
        }

        this.id = My_Object.id;
        My_Object.id++;
        My_Object.instances.push(this);
    }


    draw(ctx) {
        if (this.dead) { return; }
        this.object_image.draw(ctx);
        this.hitBox.draw_contours(ctx);
    }


    move(cnv, other_objects, direction = "") {
        if (this.dead) { return; }

        //collision with every objects
        let continu = this.check_collisions(other_objects);
        if (!continu) { return; }

        let limit_right = cnv.width;
        let limit_down = cnv.height;

        //update position
        switch (direction) {
            case "down":
                this.y += this.speed;
                this.object_image.y += this.speed;
                this.hitBox.y += this.speed;
                break;
            case "up":
                this.y -= this.speed;
                this.object_image.y -= this.speed;
                this.hitBox.y -= this.speed;
                break
            case "right":
                this.x += this.speed;
                this.object_image.x += this.speed;
                this.hitBox.x += this.speed;
                break
            case "left":
                this.x -= this.speed;
                this.object_image.x -= this.speed;
                this.hitBox.x -= this.speed;
                break
            default:
                this.x += this.speed * this.velocityX;
                this.y += this.speed * this.velocityY;
                this.object_image.x += this.speed * this.velocityX;
                this.object_image.y += this.speed * this.velocityY;
                this.hitBox.x += this.speed * this.velocityX;
                this.hitBox.y += this.speed * this.velocityY;
        }

        //out of screen
        if (this.x > limit_right) {
            this.x -= limit_right;
            this.object_image.x -= limit_right;
            this.hitBox.x -= limit_right;
        }
        else if (this.x < 0) {
            this.x = limit_right + this.x;
            this.object_image.x = limit_right + this.object_image.x;
            this.hitBox.x = limit_right + this.hitBox.x;
        }
        if (this.y > limit_down) {
            this.y -= limit_down;
            this.object_image.y -= limit_down;
            this.hitBox.y -= limit_down;
        }
        else if (this.y < 0) {
            this.y = limit_down + this.y;
            this.object_image.y = limit_down + this.object_image.y;
            this.hitBox.y = limit_down + this.hitBox.y;
        }

    }

    check_collisions(other_objects) {
        for (const obj of other_objects) {
            if (obj == this) { continue; }
            if (obj.dead) { continue; }
            // if (obj.group == "static") { continue; }

            if (obj.hitBox.is_colliding(this.hitBox)) {
                console.log("COLLISION", this.group, this.id, obj.group, obj.id);
                switch (this.group) {
                    case "ally":
                        switch(obj.group) {
                            case "ally":
                                console.log("hi bro")
                            case "ennemy":
                                //détruire this
                                // console.log("\"this\" must die")
                                // console.log("\"obj\" must die")
                                this.dead = true;
                                // this.destroy();
                                return;
                                break;
                            case "ennemy_healer":
                                    //détruire this
                                    console.log("\"this\" must die")
                                    console.log("\"obj\" must die")
                                    break;
                            default:
                                this.rebond();
                        }
                        break;
                    case "ennemy":
                        switch(obj.group) {
                            case "static":
                                this.velocityX = 0;
                                this.velocityY = 0;
                                
                                break;
                            case "ennemy_healer":
                                if (this.velocityX && this.velocityY) { break; }
                                this.velocityX = Math.random();
                                this.velocityY = Math.random();
                                if (getRandom(0, 1)) { this.velocityX *= -1; }
                                if (getRandom(0, 1)) { this.velocityY *= -1; }
                                break;
                            default:
                                this.rebond();
                        }
                    case "ennemy_healer":
                        switch (obj.group) {
                            case "ennemy":
                                console.log("hi bad bro");
                                break;
                            case "ennemy_healer":
                                console.log("Good healing")
                                break;
                            default:
                                this.rebond();
                        }
                    default:
                        console.log("does nothing")
                }
            }
        }

        return 1;
    }

    rebond() {
        //maybe choose in which direction to go (opposite from the cause of the rebond)
        this.velocityX *= -1;
        this.velocityY *= -1;
        // switch (getRandom(1, 0)) { //temp. Must be 0, 1
        //     case 0:
        //         this.velocityX *= -1;
        //         break;
        //     case 1:
        //         this.velocityY *= -1;
        //         break;
        //     default:
        //         this.velocityX *= -1;
        //         this.velocityY *= -1;
        // }
    }

    destroy() {
        let i = 0;
        for (const a of My_Object.instances) {
            if (this == a) { break; }
            i++;
        }
        delete My_Object.instances[i];
    }
}









//BACKGROUND (IMAGE FIXE)
// image
let imgBackgroundName = "arena";
let spriteBackground = assetsDir + imgBackgroundName + pngExt;
let imgBackground = new My_Img(spriteBackground, 0, 0, cnv.width, cnv.height);



//ANIMATED CHARACTER
// image
let imgPersoName = "RedDeathFrame_";
let spritesPerso = [];
for (let i = 0; i < 5; i++) {
    spritesPerso.push(assetsDir + imgPersoName + (i+1) + pngExt);
}
let imgAnimatedPerso = new My_Img_Animated(spritesPerso, cnv.width / 2, cnv.height / 2, 30, 50)
// hitbox
let hitBoxPerso = new HitBox_Circle(
    imgAnimatedPerso.x + (imgAnimatedPerso.width / 2),
    imgAnimatedPerso.y + (imgAnimatedPerso.height / 2), 
    (imgAnimatedPerso.width + imgAnimatedPerso.height) / 4)
//object
let objectPerso = new My_Object(hitBoxPerso.x, hitBoxPerso.y, imgAnimatedPerso, hitBoxPerso, "static", 0, 0);




// balls
// ennemy
for (let i = 0; i < 10; i++) {
    let randX = getRandom(0, cnv.width);
    let randY = getRandom(0, cnv.height);
    let velX = Math.random();
    let velY = Math.random();
    if (getRandom(0, 1)) {
        velX *= -1;
    }
    if (getRandom(0, 1)) {
        velY *= -1;
    }

    let imgBall = new My_Circle(randX, randY, 30, "#AAFF00");
    let hitBoxBall = new HitBox_Circle(randX, randY, 30);
    new My_Object(randX, randY, imgBall, hitBoxBall, "ennemy", velX, velY);
}
// ally
for (let i = 0; i < 10; i++) {
    let randX = getRandom(0, cnv.width);
    let randY = getRandom(0, cnv.height);
    let velX = Math.random();
    let velY = Math.random();
    if (getRandom(0, 1)) {
        velX *= -1;
    }
    if (getRandom(0, 1)) {
        velY *= -1;
    }

    let imgBall = new My_Circle(randX, randY, 30, "#0000FF");
    let hitBoxBall = new HitBox_Circle(randX, randY, 30);
    new My_Object(randX, randY, imgBall, hitBoxBall, "ally", velX, velY);
}
// ennemy healer
for (let i = 0; i < 2; i++) {
    let randX = getRandom(0, cnv.width);
    let randY = getRandom(0, cnv.height);
    let velX = Math.random();
    let velY = Math.random();
    if (getRandom(0, 1)) {
        velX *= -1;
    }
    if (getRandom(0, 1)) {
        velY *= -1;
    }

    let imgBall = new My_Circle(randX, randY, 30, "#AA00AA");
    let hitBoxBall = new HitBox_Circle(randX, randY, 30);
    new My_Object(randX, randY, imgBall, hitBoxBall, "ennemy_healer", velX, velY);
}




// dat.GUI Folder
let backgroundFolder = gui.addFolder("Backgroung");
backgroundFolder.add(imgBackground, "visible")

// dat.GUI folder
let persoFolder = gui.addFolder("Perso");
persoFolder.add(imgAnimatedPerso, "x", 0, cnv.width - imgAnimatedPerso.w, 1);
persoFolder.add(imgAnimatedPerso, "y", 0, cnv.height - imgAnimatedPerso.h, 1);
persoFolder.add(imgAnimatedPerso, "width", 10, cnv.width, 1);
persoFolder.add(imgAnimatedPerso, "height", 10, cnv.height, 1);
persoFolder.add(imgAnimatedPerso, "animated");
persoFolder.add(imgAnimatedPerso, "visible");

// dat.GUI folder
let objectsFolder = gui.addFolder("Objects")
objectsFolder.add(My_Object, "imgVisible");
objectsFolder.add(My_Object, "collision");
objectsFolder.add(My_Object, "hitBoxVisible");
objectsFolder.add(My_Object, "moving");






// KEYS DETECTION
document.addEventListener("keydown", button_pressed);

function button_pressed(e) {
    switch (e.key) {
        case "z":
            console.log("press z")
            objectPerso.move(cnv, My_Object.instances, "up")
            break;
        case "q":
            console.log("press q")
            objectPerso.move(cnv, My_Object.instances, "left")
            break;
        case "s":
            console.log("press s")
            objectPerso.move(cnv, My_Object.instances, "down")
            break;
        case "d":
            console.log("press d")
            objectPerso.move(cnv, My_Object.instances, "right")
            break;
    }
}







function updateGui() {
    backgroundFolder.updateDisplay();
    persoFolder.updateDisplay();
}

let itemp = 0;
function animations() {
    if (itemp == 4) {
        imgAnimatedPerso.next_frame();
        itemp = 0;
    }
    itemp++;
}

function updates() {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    imgBackground.draw(ctx);
    imgAnimatedPerso.draw(ctx);

    for (const obj of My_Object.instances) {
        obj.draw(ctx);
    }

}

function move() {
    for (const obj of My_Object.instances) {
        obj.move(cnv, My_Object.instances);
    }
}



function update() {
    // console.log("NEW UPDATE")
    animations();
    move();
    draw();

    updates();
    
    updateGui();
    // requestAnimationFrame(update)
}



setInterval(update, 100);
// requestAnimationFrame(update)
