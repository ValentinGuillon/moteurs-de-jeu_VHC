
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
    constructor(sprites, x = 0, y = 0, width = 25, height = 25, sprites_death = []) {
        super(sprites[0], x, y, width, height);
        this.sprites = sprites;
        this.sprites_death = sprites_death;

        this.dead = false;

        //dat.GUI
        this.animated = true;
    }

    // return 0 if there is no sprite left
    next_frame(loop = true) {
        if (this.sprites.lenght == 0) {
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
        // this.dead = true;
    }

}




class HitBox_Circle {
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


let shoot = true;

class My_Object {
    constructor(x, y, object_image, hitBox, group = "", velocityX = 1.0, velocityY = 0.0) {
        this.x = x;
        this.y = y;
        this.object_image = object_image;
        this.hitBox = hitBox;

        this.speed = 10;
        this.velocityX = velocityX; //beween -1 and 1
        this.velocityY = velocityY; //beween -1 and 1

        this.group = group; //"ally", "enemy", "static"
        this.invincible = false;
        this.duration = 30;
        this.timer = 0;

        this.id = -1;

        this.stop = false;
        this.dying = false;
        this.dead = false;

        this.addInstance();
        this.update_bool();
    }

    static instances = [];
    static instances_dead = [];
    static id = 0;
    static imgVisible = true;
    static collision = true;
    static hitBoxVisible = false;
    static moving = true;


    update() {
        if (this.invincible) {
            this.timer++;
            if (this.timer == this.duration) {
                this.timer = 0;
                this.invincible = false;
            }
        }

        if (this.dead) { return; }
        if (!this.dying) { return; }

        if (this.object_image instanceof My_Img_Animated) {
            if (this.object_image.dead) {
                this.dead = true;
            }
        }
        else {
            this.dead = true;
        }

        if (this.dead) {
            My_Object.instances_dead.push(this);
        }
    }

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
        if (this.dead) { return ; }
        this.object_image.draw(ctx);
        if (this.invincible) {
            this.draw_invincible();
        }
        this.hitBox.draw_contours(ctx);
    }

    draw_invincible() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.hitBox.radius, 0, 2*Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#9e9e97";
        ctx.stroke();
        ctx.closePath();
    }


    move(cnv, other_objects, direction = "") {
        if (this.dead) { return; }
        if (this.dying) { return; }

        //collision with every objects
        let continu = this.check_collisions(other_objects);
        if (!continu) { return; }
        if (this.stop) { return; }

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
            if(this.group == "projectile"){
                this.die()
                return;
            }
            this.x -= limit_right;
            this.object_image.x -= limit_right;
            this.hitBox.x -= limit_right;
        }
        else if (this.x < 0) {
            if(this.group == "projectile"){
                this.die()
                return;
            }
            this.x = limit_right + this.x;
            this.object_image.x = limit_right + this.object_image.x;
            this.hitBox.x = limit_right + this.hitBox.x;

        }
        if (this.y > limit_down) {
            if(this.group == "projectile"){
                this.die()
                return;
            }
            this.y -= limit_down;
            this.object_image.y -= limit_down;
            this.hitBox.y -= limit_down;

        }
        else if (this.y < 0) {
            if(this.group == "projectile"){
                this.die()
                return;
            }
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
                // console.log("COLLISION", this.group, this.id, obj.group, obj.id);
                switch (this.group) {
                    case "ally":
                        switch(obj.group) {
                            case "bonus":
                                this.invincible = true;
                                return 1;
                            case "ally":
                                // console.log("hi bro")
                                return 1;
                            case "enemy":
                                //détruire this
                                this.die();
                                return 0;
                            case "projectile":
                                this.die();
                                return 0;
                            case "static":
                                this.recul(obj);
                                return 1;
                            default:
                                this.rebond();
                                return 1;
                        }
                    case "enemy":
                        switch(obj.group) {
                            case "enemy":
                                return 1;
                            case "ally":
                                shoot = false;
                                this.die();
                                return 0;
                            case "projectile":
                                return 1;
                            case "static":
                                console.log("n'est pas sensé pouvoir avancé");
                                this.rebond()
                                return 1;
                            default:
                                this.rebond();
                                return 1;
                        }
                    case "projectile":
                        switch (obj.group) {
                            case "projectile":
                                return 1;
                            case "static":
                                this.die();
                                return 0;
                            case "enemy":
                                return 1;
                            case "ally":
                                this.die();
                                return 0;
                            default:
                                this.rebond();
                                return 1;
                        }
                    case "bonus":
                        switch (obj.group) {
                            case "ally":
                                this.die()
                                return 0;
                            default:
                                return 1;
                        }
                    default:
                        // console.log("does nothing");
                        return 1;
                }
            }
        }

        return 1;
    }

    recul(obj) {
        let reculX = this.speed;
        let reculY = this.speed;

        if (this.x < obj.x) {
            reculX *= -1;
        }
        if (this.y < obj.y) {
            reculY *= -1;
        }

        this.x += reculX;
        this.y += reculY;
        this.object_image.x += reculX;
        this.object_image.y += reculY;
        this.hitBox.x += reculX;
        this.hitBox.y += reculY;
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

    die() {
        if (this.invincible) { return; }
        this.collision = false;
        this.hitBox.collision = false;
        this.dying = true;
        if (this.object_image instanceof My_Img_Animated) {
            this.object_image.die();
        }
    }


}





// 6 7 8 7



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
let sprites_death_src = [];
// let numbers = [1, 1, 1, 2, 2]
for (let i = 0; i < 12; i++) {
    sprites_death_src.push(assetsDir + "explosion_" + (i+1) + pngExt);
}
// img anim death

//img animated death
let imgAnimatedPerso = new My_Img_Animated(spritesPerso, 10, 10, 30, 50, sprites_death_src)
// hitbox
let hitBoxPerso = new HitBox_Circle(
    imgAnimatedPerso.x + (imgAnimatedPerso.width / 2),
    imgAnimatedPerso.y + (imgAnimatedPerso.height / 2), 
    (imgAnimatedPerso.width + imgAnimatedPerso.height) / 5)
//object
let objectPerso = new My_Object(hitBoxPerso.x, hitBoxPerso.y, imgAnimatedPerso, hitBoxPerso, "ally", 0, 0);

let imgObstaclesName = "vassels_";
let spritesObstacles = [];
for (let i = 0; i < 6; i++) {
    spritesObstacles.push(assetsDir + imgObstaclesName + (i+1) + pngExt);
}

// obstacles
for (let i = 0; i < 10; i++) {
    let randX = getRandom(0, cnv.width);
    let randY = getRandom(0, cnv.height);
    
    let distance = 0;
    while(distance < 150 || distance > 220) {
        randX = getRandom(0, cnv.width);
        randY = getRandom(0, cnv.height);
        
        let distanceX = cnv.width/2 - randX;
        let distanceY = cnv.height/2 - randY;
        distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
    }
    
    let imgAnimatedObstacle = new My_Img_Animated(spritesObstacles, randX - 15, randY - 15, 30, 30);
    let hitBoxObstacle = new HitBox_Circle(randX, randY, (imgAnimatedObstacle.width + imgAnimatedObstacle.height) / 4);
    new My_Object(randX, randY, imgAnimatedObstacle, hitBoxObstacle, "static", 0, 0);
}


//ANIMATED TOWERS
// image
let imgTowersName = "towers_";
let spritesTowers = [];
let numbers = [6, 6, 7, 7, 8, 8, 7, 7];
for (let i = 0; i < 8; i++) {
    spritesTowers.push(assetsDir + imgTowersName + numbers[i] + pngExt);
}

// img anim
let imgAnimatedTowers = new My_Img_Animated(spritesTowers, cnv.width/2 - 60/2, cnv.height/2 - 60/2, 60, 60)

let tourelles = []
//tourelles
for (let i = 0; i < 1; i++) {
    
    let X = cnv.width/2;
    let Y = cnv.height/2;

    let hitBoxTower = new HitBox_Circle(
        imgAnimatedTowers.x + (imgAnimatedTowers.width / 2),
        imgAnimatedTowers.y + imgAnimatedTowers.height / 4, 
        (imgAnimatedTowers.width + imgAnimatedTowers.height) / 10)
        
    //object
    let tourelle = new My_Object(X, Y, imgAnimatedTowers, hitBoxTower, "enemy", 0, 0);
    tourelles.push(tourelle);
}

//bonus
let bonus_pos = [
    cnv.width - 30, 30,
    30, cnv.height -30,
    cnv.width - 30, cnv.height -30
]
for (let i = 0; i < 6; i+=2)
{
    let X = bonus_pos[i];
    let Y = bonus_pos[i+1];

    let imgBonus = new My_Circle(X, Y, 20, "#370804");
    let hitBoxBonus = new HitBox_Circle(X, Y, 20);
        
    //object
    new My_Object(X, Y, imgBonus, hitBoxBonus, "bonus", 0, 0);
}




// dat.GUI Folder
let backgroundFolder = gui.addFolder("Backgroung");
backgroundFolder.add(imgBackground, "visible")

// dat.GUI folder
let persoFolder = gui.addFolder("Perso");
persoFolder.add(imgAnimatedPerso, "x", 0, cnv.width - imgAnimatedPerso.width, 1);
persoFolder.add(imgAnimatedPerso, "y", 0, cnv.height - imgAnimatedPerso.height, 1);
persoFolder.add(imgAnimatedPerso, "width", 10, cnv.width, 1);
persoFolder.add(imgAnimatedPerso, "height", 10, cnv.height, 1);
persoFolder.add(imgAnimatedPerso, "animated");
persoFolder.add(imgAnimatedPerso, "visible");
persoFolder.add(objectPerso.hitBox, "collision")
persoFolder.add(objectPerso.hitBox, "contours")
// objectPerso
// this.collision = true;
// this.contours = true;


// dat.GUI folder
let objectsFolder = gui.addFolder("Objects")
objectsFolder.open();
objectsFolder.add(My_Object, "imgVisible").onChange(val => {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
});
objectsFolder.add(My_Object, "collision").onChange(val => {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
});
objectsFolder.add(My_Object, "hitBoxVisible").onChange(val => {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
});
objectsFolder.add(My_Object, "moving").onChange(val => {
    for (const obj of My_Object.instances) {
        obj.update_bool();
    }
});




// KEYS DETECTION
var key_map = {};
onkeydown = onkeyup = function(e){
    key_map[e.key] = e.type == 'keydown';
}


function execute_inputs() {
    for (const key in key_map) {
        //touche non pressée
        if (!key_map[key]) { continue; }

        //touche pressée
        switch (key) {
            case "z":
                objectPerso.move(cnv, My_Object.instances, "up")
                break;
            case "q":
                objectPerso.move(cnv, My_Object.instances, "left")
                break;
            case "s":
                objectPerso.move(cnv, My_Object.instances, "down")
                break;
            case "d":
                objectPerso.move(cnv, My_Object.instances, "right")
                break;
        }
    }
}




function projectile(laucherX, launcherX){
    let x = laucherX;
    let y = launcherX;
    let velX = Math.random();
    let velY = Math.random();
    if (getRandom(0, 1)) {
        velX *= -1;
    }
    if (getRandom(0, 1)) {
        velY *= -1;
    }
    let sprite_ball_src = [];
    //img animated
    for (let i = 0; i < 4; i++) {
        sprite_ball_src.push(assetsDir + "fireballs_mid_" + (i+1) + pngExt);
    }

    //img animated death
    let sprites_explosion_src = [];
    // let numbers = [1, 1, 1, 2, 2]
    for (let i = 0; i < 12; i++) {
        sprites_explosion_src.push(assetsDir + "explosion_" + (i+1) + pngExt);
    }

    let imgBall = new My_Img_Animated(sprite_ball_src, x, y, 20, 15, sprites_explosion_src)
    let hitBoxBall = new HitBox_Circle(x + 10, y + 7.5, (imgBall.height + imgBall.width) / 4);
    new My_Object(hitBoxBall.x, hitBoxBall.y, imgBall, hitBoxBall, "projectile", velX, velY); 

}

let intervale = 0;
function tirer(x, y){
    console.log(shoot);
    if (!shoot) { return; };
    if (intervale == 2){

        projectile(x, y);
        intervale = 0;

    }
    intervale++;
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

    for (const obj of My_Object.instances) {
        if (obj.object_image instanceof My_Img_Animated) {
            let loop = true;
            if (obj.dying) { loop = false; }
            obj.object_image.next_frame(loop);
        }
    }
}


function clear_dead_objects() {
    for (const dead_obj of My_Object.instances_dead) {
        let valeurASupprimer = dead_obj;

        let nouvelleListe = My_Object.instances.filter(function(element) {
            return element !== valeurASupprimer;
        });
        My_Object.instances = nouvelleListe;
    }
    My_Object.instances_dead = [];
}

function updates() {
    // console.log(key_map)
    execute_inputs()

    for (const obj of My_Object.instances) {
        obj.update();
    }
    clear_dead_objects();
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
    console.log(My_Object.instances.length);
    console.log(My_Object.instances_dead.length);
    // let x = objectPerso.x - (objectPerso.object_image.width / 2);
    // let y = objectPerso.y - (objectPerso.object_image.height / 2);
    tirer(tourelles[0].x, tourelles[0].y);
    animations();
    move();
    draw();

    updates();
    
    updateGui();
    // requestAnimationFrame(update)
}



setInterval(update, 100);
// requestAnimationFrame(update)
