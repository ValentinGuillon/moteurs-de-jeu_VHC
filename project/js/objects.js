
import { CNV, CTX, ASSETS_DIR, PNG_EXT } from "./script.js";
import { My_Img, My_Img_Animated } from "./imgs.js"
import { HitBox_Circle, HitBox_Mask } from "./hitBox.js";
import { getRandom } from "./tools.js";






// return 1 to allow next actions, 0 to not.
function check_collisions(obj, other_objects) {
    if (!obj.hitBox) { return 1; }
    for (const other of other_objects) {
        if (other == obj) { continue; }
        if (!other.hitBox) { continue; }
        if (other.dead) { continue; }
        if (other.dying) { continue; }
        if (other.stop) { continue; }

        if (!(obj.hitBox.is_colliding(other.hitBox))) { continue; }

        switch (obj.group) {
            case "player":
                switch(other.group) {
                    case "enemy_projectile":
                        obj.recul(other);
                        obj.die();
                        other.die();
                        return 0;
                    case "enemy_turret":
                        obj.recul(other);
                        obj.die();
                        other.die();
                        return 0;
                    case "bonus_invicibility":
                        obj.give_invicibility();
                        break;
                    case "obstacle":
                        obj.recul(other)
                        // obj.roll_back(other);
                        break;
                }
                break;

            case "ally_projectile":
                switch(other.group) {
                    case "enemy_turret":
                        obj.die();
                        other.die();
                        return 0;
                    case "enemy_projectile":
                        obj.die();
                        other.die();
                        return 0;
                    case "enemy_chasing":
                        obj.die();
                        other.die();
                        return 0;
                    case "obstacle":
                        obj.die();
                        return 0;
                }
                break;

            case "enemy_turret":
                switch(other.group) {
                    case "player":
                        obj.die();
                        other.recul(obj)
                        other.die();
                        return 0;
                    case "ally_projectile":
                        obj.die();
                        other.die();
                        return 0;
                }
                break;

            case "enemy_projectile":
                switch (other.group) {
                    case "obstacle":
                        obj.die();
                        return 0;
                    case "player":
                        obj.die();
                        other.recul(obj);
                        other.die();
                        return 0;
                    case "ally_projectile":
                        obj.die();
                        other.die();
                        return 0;

                }
                break;

            case "enemy_chasing":
                switch (other.group) {
                    case "enemy_chasing":
                        obj.recul(other)
                        return 0;
                    case "obstacle":
                        obj.recul(other)
                        return 0;
                    case "player":
                        obj.die();
                        other.recul(obj)
                        other.die();
                        return 0;
                    case "ally_projectile":
                        obj.die();
                        other.die();
                        return 0;
                }
                break;

            case "bonus_invicibility":
                switch (other.group) {
                    case "player":
                        obj.die()
                        other.give_invicibility();
                        return 0;
                }
                break;
        }
    }

    return 1;
}



export class My_Object {
    constructor(x, y, object_image, hitBox, group = "", velocityX = 0.0, velocityY = 0.0) {
        this.x = x;
        this.y = y;
        this.previousX = x;
        this.previousY = y;
        this.object_image = object_image;
        this.hitBox = hitBox;

        this.speed = 10;
        this.velocityX = velocityX; //between -1 and 1
        this.velocityY = velocityY; //between -1 and 1

        this.group = group; //"player", "enemy", "obstacle"

        this.id = -1;

        this.stop = false;
        this.dying = false;
        this.dead = false;

        this.addInstance();
        this.update_bools();
    }



    static instances = [];
    static id = 0;
    static imgVisible = true;
    static collision = false;
    static hitBoxVisible = true;
    static moving = true;
    static playerSpeed = 10;


    static destroy_objects () {
        My_Object.instances = [];
    }


    static clear_dead_objects() {
    let newList = My_Object.instances.filter(function(element) {
        return !element.dead;
        });
        My_Object.instances = newList;
    }


    //sort My_Objects.instances bases on element.y
    //bubble sort
    static sort_objects() {
        let length = My_Object.instances.length
        let list = My_Object.instances
        for (let i = 0; i < length-1; i++) {
            for (let j = i; j < length-1; j++) {
                let switch_obj = false;
                if (list[j].y > list[j+1].y) { switch_obj = true; }
                if (!switch_obj) { continue; }
                let temp = list[j];
                list[j] = list[j+1];
                list[j+1] = temp;
            }
        }
    }



    /*
     * METHODS FOR SUBCLASSES
     */

    //precedes this.status_update()
    additionnal_update() {
        return; 
    }


    //follows this.action()
    //called after collisions has been checked
    auto_actions() {
        return;
    }



    /*
     * MAIN METHODS (called outside)
     */

    action() {
        this.status_update();
        
        if (this.dead) { return; }
        if (this.dying) { return; }
        if (this.stop) { return; }

        this.move();

        // draw_rect(this.x-5, this.y-5, 10, 10, "#000000")
        if (this.hitBox) {
            let continu = check_collisions(this, My_Object.instances);
            if (!continu) { return; }
        }

        this.auto_actions();
    }


    animate() {
        if (!this.object_image) { return; }
        if (this.stop) { return; }
        if (this.dead) { return; }
        if (!(this.object_image instanceof My_Img_Animated)) { return; }

        let loop = true;
        if (this.dying) { loop = false; }
        this.object_image.next_frame(loop);
    }



    draw() {
        if (this.dead) { return ; }
        if (this.object_image) { 
            this.object_image.draw();
        }
        if (this.hitBox) {
            this.hitBox.draw_contours();
        }
    }



    /*
     * EFFECTS ON THIS OBJECT
     */

    die() {
        this.collision = false;
        if (this.hitBox) {
            this.hitBox.collision = false;
        }
        this.dying = true;
        if (this.object_image instanceof My_Img_Animated) {
            this.object_image.die();
        }
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

        this.update_position(reculX, reculY)
    }

    
    //WIP, to replace recul()
    //a diagonal must must allow one movement
    //ex: if the wall is on right, a right-up step must allow an up step.
    //DONE
    //ça fait chier si la nouvelle position est dans une autre collision
    roll_back(other) {
        let x_diff = this.previousX - this.x;
        let y_diff = this.previousY - this.y;

        let allowed = false;
        //test roll back x
        this.update_position(x_diff, 0);
        if (!(other.hitBox.is_colliding(this.hitBox))) { allowed = true; }
        //test roll back y
        if (!allowed) {
            this.update_position(-x_diff, y_diff);
        }
        if (other.hitBox.is_colliding(this.hitBox)) { console.log("bro ?")}
    }


    rebond() {
        this.velocityX *= -1;
        this.velocityY *= -1;
    }


    /*
     * CALLED INSIDE the class or subclasses
     */

    move() {
        if (this.dead) { return; }
        if (this.dying) { return; }

        this.normalize_velocity();
        this.update_position(this.speed * this.velocityX, this.speed * this.velocityY);
    }


    update_position(add_X, add_Y) {
        this.x += add_X;
        this.y += add_Y;
        if (this.object_image) {
            this.object_image.x += add_X;
            this.object_image.y += add_Y;
        }
        if (this.hitBox) {
            this.hitBox.x += add_X;
            this.hitBox.y += add_Y;
        }
    }


    update_velocity(x = undefined, y = undefined) {
        if (x != undefined) {
            this.velocityX = x;
        }
        if (y != undefined) {
            this.velocityY = y;
        }
    }

    status_update() {
        this.additionnal_update();

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
    }


    draw_invincible() {
        let radius = (this.hitBox.width+this.hitBox.height) / 4
        CTX.beginPath();
        CTX.arc(this.x, this.y, radius, 0, 2*Math.PI);
        CTX.lineWidth = 2;
        CTX.strokeStyle = "#9e9e97";
        CTX.stroke();
        CTX.closePath();
    }


    normalize_velocity() {
        if (this.velocityX == 0 || this.velocityY == 0) { return; }

        let X = this.velocityX;
        let Y = this.velocityY;

        let hypothenuse = Math.sqrt((X*X) + (Y*Y));

        this.velocityX /= hypothenuse;
        this.velocityY /= hypothenuse;
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



    /*
     * DEBUG (dat.GUI)
     */

    update_bools() {
        if (this.object_image) {
            this.object_image.visible = My_Object.imgVisible;
        }
        this.stop = !My_Object.moving;
        if (this.hitBox) {
            this.hitBox.contours = My_Object.hitBoxVisible;
        }
        if (this.dead || this.dying) { return; }
        if (this.hitBox) {
            this.hitBox.collision = My_Object.collision;
        }
    }
}























// // A template subclass of My_Object
// // You must give "subclass_name" and a "group_name"

// export class subclass_name extends My_Object {
//     constructor(x, y, object_image, hitBox /*you can add brand new properties*/) {
//         super(x, y, object_image, hitBox, "group_name");
//         /*you can add brand new this.properties*/
//     }

//     //precedes this.status_update()
//     additionnal_update() {
//         return; 
//     }

//     //follows this.action()
//     //called after collisions has been checked
//     auto_actions() {
//         return;
//     }
// }




export class Obstacle extends My_Object {
    constructor(x, y, object_image, hitBox) {
        super(x, y, object_image, hitBox, "obstacle");
    }
}




export class Bonus_Invicibility extends My_Object {
    constructor(x, y, object_image, hitBox) {
        super(x, y, object_image, hitBox, "bonus_invicibility");
    }
}




export class Player extends My_Object {
    constructor(x, y, object_image, hitBox) {
        super(x, y, object_image, hitBox, "player");
        this.speed = My_Object.playerSpeed;
        this.invincible = false;
        this.invicibility_duration = 30;
        this.invicibility_timer = 0;
    
        this.shoot = true;
        this.delay = 5;
        this.intervale = 0;
    }


    give_invicibility() {
        this.invincible = true;
        this.invicibility_timer = 0;
    }


    die() {
        if (this.invincible) { return; }
        this.collision = false;
        if (this.hitBox) {
            this.hitBox.collision = false;
        }
        this.dying = true;
        if (this.object_image instanceof My_Img_Animated) {
            this.object_image.die();
        }
    }


    additionnal_update() {
        if (this.invincible) {
            this.invicibility_timer++;
            if (this.invicibility_timer == this.invicibility_duration) {
                this.invicibility_timer = 0;
                this.invincible = false;
            }
        }
    }


    auto_actions() {
        this.check_out_of_screen();
        this.tirer();
    }

    generate_projectile(x, y){
        // faire en sorte que les projectiles aient une vélocité influencé par l'ennemi le plus proche (histoire de cosinus blabla...)
        // OU faire en sorte de tirer régulièrement en cercle (maths aussi)
        let velX = Math.random();
        let velY = Math.random();
        if (getRandom(0, 1)) {
            velX *= -1;
        }
        if (getRandom(0, 1)) {
            velY *= -1;
        }
        let sprite_ball_src = [];
        for (let i = 0; i < 4; i++) {
            sprite_ball_src.push(ASSETS_DIR + "fireballs_mid_" + (i+1) + PNG_EXT);
        }

        let sprites_explosion_src = [];
        for (let i = 0; i < 8; i++) {
            sprites_explosion_src.push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
        }

        let imgBall = new My_Img_Animated(sprite_ball_src, x-10, y-7.5, 20, 15, sprites_explosion_src)
        let hitBoxBall = new HitBox_Circle(x, y, (imgBall.height + imgBall.width) / 4);
        new Ally_Projectile(x, y, imgBall, hitBoxBall, velX, velY);

    }

    tirer(){
        if (!this.shoot) { return; }
        if (!My_Object.moving) { return; }

        if (this.intervale == this.delay){
            this.generate_projectile(this.x, this.y - 20);
            this.intervale = 0;
        }
        this.intervale++;
    }


    check_out_of_screen() {
        //out of screen
        let limit_right = CNV.width;
        let limit_down = CNV.height;

        if (this.x > limit_right) {
            this.update_position(-limit_right, 0)
        }
        else if (this.x < 0) {
            this.update_position(limit_right, 0)
        }
        if (this.y > limit_down) {
            this.update_position(0, -limit_down)
        }
        else if (this.y < 0) {
            this.update_position(0, limit_down)
        }

        this.update_velocity(0, 0);
    }


    give_direction(direction = "") {
        if (this.dead) { return; }
        if (this.dying) { return; }

        //update position
        switch (direction) {
            case "down":
                this.update_velocity(undefined, 1)
                break;
            case "up":
                this.update_velocity(undefined, -1)
                break
            case "right":
                this.update_velocity(1, undefined)
                break
            case "left":
                this.update_velocity(-1, undefined)
                break
            default:
                console.log("error: player must have an allowed direction.")
        }
    }


    draw() {
        if (this.dead) { return ; }
        if (this.object_image) { 
            this.object_image.draw();
        }
        if (this.invincible) {
            this.draw_invincible();
        }
        if (this.hitBox) {
            this.hitBox.draw_contours();
        }
    }
}




export class Enemy_Turret extends My_Object {
    constructor(x, y, object_image, hitBox) {
        super(x, y, object_image, hitBox, "enemy_turret");
        this.shoot = true;
        this.delay = 5;
        this.timer = 0;
    }

    die() {
        this.shoot = false
        this.collision = false;
        if (this.hitBox) {
            this.hitBox.collision = false;
        }
        this.dying = true;
        if (this.object_image instanceof My_Img_Animated) {
            this.object_image.die();
        }
    }

    auto_actions() {
        this.tirer();
    }


    generate_projectile(x, y){
        let velX = Math.random();
        let velY = Math.random();
        if (getRandom(0, 1)) {
            velX *= -1;
        }
        if (getRandom(0, 1)) {
            velY *= -1;
        }
        let sprite_ball_src = [];
        for (let i = 0; i < 4; i++) {
            sprite_ball_src.push(ASSETS_DIR + "fireballs_mid_" + (i+1) + PNG_EXT);
        }

        let sprites_explosion_src = [];
        for (let i = 0; i < 8; i++) {
            sprites_explosion_src.push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
        }

        let imgBall = new My_Img_Animated(sprite_ball_src, x-10, y-7.5, 20, 15, sprites_explosion_src)
        // let hitBoxBall = new HitBox_Circle(x, y, (imgBall.height + imgBall.width) / 4);
        let hitBoxBall = new HitBox_Mask(x-10, y-7.5, ASSETS_DIR + "fireballs_mid_mask" + PNG_EXT, 20, 15)
        new Enemy_Projectile(x, y, imgBall, hitBoxBall, velX, velY);
    }


    tirer(){
        if (!this.shoot) { return; }
        if (!My_Object.moving) { return; }

        if (this.timer == this.delay){
            this.generate_projectile(this.x, this.y - 20);
            this.timer = 0;
        }
        this.timer++;
    }
}




export class Enemy_Projectile extends My_Object {
    constructor(x, y, object_image, hitBox, velocityX, velocityY) {
        super(x, y, object_image, hitBox, "enemy_projectile", velocityX, velocityY);
    }

    auto_actions() {
        if (this.is_out_of_screen()) {
            this.die();
        }
    }

    is_out_of_screen() {
        let out_right = this.x > CNV.width;
        let out_left = this.x < 0;
        let out_down = this.y > CNV.height;
        let out_up = this.y < 0;
        return out_right || out_left || out_down || out_up;
    }
}




export class Ally_Projectile extends My_Object {
    constructor(x, y, object_image, hitBox, velocityX = 0.0, velocityY = 0.0) 
    {
        super(x, y, object_image, hitBox, "ally_projectile", velocityX, velocityY);
    }

    auto_actions() {
        if (this.is_out_of_screen()) {
            this.die();
        }
    }

    is_out_of_screen() {
        let out_right = this.x > CNV.width;
        let out_left = this.x < 0;
        let out_down = this.y > CNV.height;
        let out_up = this.y < 0;
        return out_right || out_left || out_down || out_up;
    }
}




export class Enemy_Chasing extends My_Object {
    constructor(x, y, object_image, hitBox, player) {
        super(x, y, object_image, hitBox, "enemy_chasing");
        this.player = player; // Référence à l'objet joueur
        this.chaseSpeed = 6; // Vitesse de poursuite de l'ennemi
    }

    auto_actions() {
        this.chasePlayer();
    }

    chasePlayer() {
        //Calcule la direction vers le joueur
        let dx = this.player.x - this.x;
        let dy = this.player.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        //Normalise la direction et applique la vitesse
        if (distance > 1) {
            dx = (dx / distance) * this.chaseSpeed;
            dy = (dy / distance) * this.chaseSpeed;
            this.update_position(dx, dy);
        }
    }
}
