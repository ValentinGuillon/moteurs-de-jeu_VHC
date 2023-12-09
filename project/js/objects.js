
import { CNV, CTX, ASSETS_DIR, PNG_EXT, CNV10 } from "./script.js";
import { My_Img, My_Img_Animated, draw_circle_stroke } from "./imgs.js"
import { HitBox_Circle, HitBox_Mask, HitBox_Rect } from "./hitBox.js";
import { direction, distance, getRandom, is_out_of_screen, normalize } from "./tools.js";
import { My_Button, create_menu } from "./interface.js";
import { generate_mobs } from './interface.js';




export function get_object(group_name) {
    for (const obj of My_Object.instances) {
        if (obj.group == group_name) {
            return obj;
        }
    }
    return undefined;
}


// Function that checks if the given object collides with any other objects.
// If collide with an object, compare their group, then call corresponding effect for each objects.
// Return 0 immediatly if the effect on the given object makes (like dying) makes him unable for next actions.
// Else, return 1.
function check_collisions(obj = My_Object, other_objects = Array(My_Object) , timestamp) {
    // if object has no hitBox
    if (!obj.hitBox) { return 1; }
    if (obj.group == "obstacle") { return 1; }
    if (obj.group == "bonus_invicibility") { return 1; }

    let objGroup = obj.group;
    if (objGroup == "player_auto") { objGroup = "player"};

    for (const other of other_objects) {
        if (other == obj) { continue; }
        if (!other.hitBox) { continue; }
        if (other.is_dead) { continue; }
        if (other.dying) { continue; }
        if (!other.can_move) { continue; }
        if (!(obj.hitBox.is_colliding(other.hitBox))) { continue; }

        let otherGroup = other.group;
        if (otherGroup == "player_auto") { otherGroup = "player"};
        switch (objGroup) {
            case "player":
                switch(otherGroup) {
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
                        other.die();
                        obj.give_invicibility(timestamp);
                        break;
                    case "obstacle":
                        obj.recul(other)
                        break;
                }
                break;

            case "ally_projectile":
                switch(otherGroup) {
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
                switch(otherGroup) {
                    case "player":
                        obj.die();
                        other.recul(obj)
                        other.die();
                        return 0;
                    case "ally_projectile":
                        obj.die();
                        other.die();
                        return 0;
                    case "enemy_chasing":
                        other.recul(obj)
                        break;
                }
                break;

            case "enemy_projectile":
                switch (otherGroup) {
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
                switch (otherGroup) {
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
                    case "enemy_turret":
                        obj.recul(other);
                        break;
                }
                break;
        }
    }

    return 1;
}



export class My_Object {
    constructor(xCenter, yCenter, image, hitBox, group = "", speed = 1, velocityX = 0.0, velocityY = 0.0) {
        this.x = xCenter;
        this.y = yCenter;

        this.image = image;
        this.hitBox = hitBox;

        this.speed = speed;
        this.velocityX = velocityX; //between -1 and 1
        this.velocityY = velocityY; //between -1 and 1

        this.group = group; //"player", "enemy", "obstacle"

        this.previousTimestampWhenMoved = undefined;

        this.id = -1;

        this.can_move = true;
        this.dying = false;
        this.is_dead = false;

        My_Object.addInstance(this);
        this.update_bools();
    }



    static instances = [];
    static id = 0;
    static imgVisible = true;
    static collision = true;
    static hitBoxVisible = false;
    static moving = true;
    static playerSpeed = 15;


    static destroy_objects () {
        My_Object.instances = [];
    }


    static clear_dead_objects() {
    let newList = My_Object.instances.filter(function(element) {
        return !element.is_dead;
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
                const obj1 = list[j];
                const obj2 = list[j+1];
                let y1 = obj1.y;
                let y2 = obj2.y;
                if (obj1.hitBox instanceof HitBox_Mask) {
                    y1 = obj1.hitBox.centerMaskY;
                }
                if (obj2.hitBox instanceof HitBox_Mask) {
                    y2 = obj2.hitBox.centerMaskY;
                }

                let switch_obj = false;
                if (y1 > y2) { switch_obj = true; }
                if (!switch_obj) { continue; }
                list[j] = obj2;
                list[j+1] = obj1;
            }
        }
    }


    static addInstance(obj) {
        if (obj.id != -1) {
            console.log("This obj already added:")
            console.log(obj)
            return;
        }

        obj.id = My_Object.id;
        My_Object.id++;
        My_Object.instances.push(obj);
    }



    /*
     * METHODS FOR SUBCLASSES
     */

    //precedes this.status_update()
    additionnal_update(timestamp) {
        return; 
    }


    //follows this.action()
    //called after collisions has been checked
    auto_actions(timestamp) {
        return;
    }


    generate_on_death() {
        return;
    }



    /*
     * MAIN METHODS (called outside)
     */

    action(timestamp) {
        this.status_update(timestamp);
        
        if (this.is_dead) { return; }
        if (this.dying) { return; }
        if (!this.can_move) { 
            this.previousTimestampWhenMoved = timestamp;
            return;
        }

        this.move(timestamp);

        if (this.hitBox) {
            let continu = check_collisions(this, My_Object.instances, timestamp);
            if (!continu) { return; }
        }

        this.auto_actions(timestamp);
    }


    animate(timestamp) {
        if (!this.image) { return; }
        if (!this.can_move) { return; }
        if (this.is_dead) { return; }
        if (!(this.image instanceof My_Img_Animated)) { return; }

        let loop = true;
        if (this.dying) { loop = false; }
        this.image.next_frame(timestamp, loop);
    }



    draw() {
        if (this.is_dead) { return ; }
        if (this.image) { 
            this.image.draw();
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
        if (this.image instanceof My_Img_Animated) {
            this.image.die();
        }
    }


    recul(obj) {
        let thisX = this.x;
        let thisY = this.y;
        let objX = obj.x;
        let objY = obj.y;
        if (this.hitBox instanceof HitBox_Mask) {
            thisX = this.hitBox.centerMaskX;
            thisY = this.hitBox.centerMaskY;
        }
        if (obj.hitBox instanceof HitBox_Mask) {
            objX = obj.hitBox.centerMaskX;
            objY = obj.hitBox.centerMaskY;
        }

        let vel = direction(objX, objY, thisX, thisY);
        vel = normalize(vel.x, vel.y);
        if (obj.hitBox instanceof HitBox_Rect) {
            if (Math.abs(vel.x) > Math.abs(vel.y)) {
                vel.y = 0;
                if (vel.x < 0) { vel.x = -0.1; }
                else { vel.x = 0.1; }
            }
            else {
                vel.x = 0;
                if (vel.y < 0) { vel.y = -0.1; }
                else {vel.y = 0.1; }
            }
        }
        this.add_to_position(vel.x, vel.y);
        if (this.hitBox.is_colliding(obj.hitBox)) {
            this.recul(obj);
        }
    }



    rebond() {
        this.velocityX *= -1;
        this.velocityY *= -1;
    }


    /*
     * CALLED INSIDE the class or subclasses
     */

    move(timestamp) {
        if (!this.can_move) { return; }
        if (this.is_dead) { return; }
        if (this.dying) { return; }

        if (this.previousTimestampWhenMoved == undefined) {
            this.previousTimestampWhenMoved = timestamp;
        }

        let elapsed = (timestamp - this.previousTimestampWhenMoved) / 100;

        this.normalize_velocity();
        this.add_to_position(this.speed * this.velocityX * elapsed, this.speed * this.velocityY * elapsed);

        this.previousTimestampWhenMoved = timestamp;
    }


    add_to_position(add_X, add_Y) {
        this.x += add_X;
        this.y += add_Y;
        if (this.image) {
            this.image.x += add_X;
            this.image.y += add_Y;
        }
        if (this.hitBox) {
            this.hitBox.x += add_X;
            this.hitBox.y += add_Y;
            if (this.hitBox instanceof HitBox_Mask) {
                this.hitBox.centerMaskX += add_X;
                this.hitBox.centerMaskY += add_Y;
            }
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

    status_update(timestamp) {
        this.additionnal_update(timestamp);

        if (this.hitBox instanceof HitBox_Mask) {
            this.hitBox.update_mask();
        }

        if (this.is_dead) { return; }
        if (!this.dying) { return; }

        if (this.image instanceof My_Img_Animated) {
            if (this.image.is_dead) {
                this.is_dead = true;
            }
        }
        else {
            this.is_dead = true;
        }

        if (this.is_dead) {
            this.generate_on_death();
        }
    }


    normalize_velocity() {
        const vel = normalize(this.velocityX, this.velocityY)
        this.velocityX = vel.x;
        this.velocityY = vel.y
    }



    /*
     * DEBUG (dat.GUI)
     */

    update_bools() {
        if (this.image) {
            this.image.is_visible = My_Object.imgVisible;
        }
        this.can_move = My_Object.moving;
        if (this.hitBox) {
            this.hitBox.contours = My_Object.hitBoxVisible;
        }
        if (this.is_dead || this.dying) { return; }
        if (this.hitBox) {
            this.hitBox.collision = My_Object.collision;
        }
    }
}























// // A template subclass of My_Object
// // You must give "subclass_name" and a "group_name"

// export class subclass_name extends My_Object {
//     constructor(x, y, image, hitBox /*you can add brand new properties*/) {
//         super(x, y, image, hitBox, "group_name");
//         /*you can add brand new this.properties*/
//     }

//     //precedes this.status_update()
//     additionnal_update(timestamp) {
//         return; 
//     }

//     //follows this.action(timestamp)
//     //called after collisions has been checked
//     auto_actions(timestamp) {
//         return;
//     }
// }




export class Obstacle extends My_Object {
    constructor(xCenter, yCenter, image, hitBox) {
        super(xCenter, yCenter, image, hitBox, "obstacle");
    }
}




export class Bonus_Invicibility extends My_Object {
    constructor(xCenter, yCenter, image, hitBox) {
        super(xCenter, yCenter, image, hitBox, "bonus_invicibility");
    }
}




export class Player extends My_Object {
    constructor(xCenter, yCenter, image, hitBox, speed) {
        super(xCenter, yCenter, image, hitBox, "player", speed);
        this.is_invincible = false;
        this.invicibility_duration = 5; //seconds
        this.timestampWhenInvicibililtyGiven = undefined;
    
        this.shoot = true;
        this.shot_by_seconds = 1; //1 / x, to shot every x seconds
        this.timestampWhenLastShot = undefined;
    }


    give_invicibility(timestamp) {
        this.is_invincible = true;
        this.timestampWhenInvicibililtyGiven = timestamp;
    }


    die() {
        if (this.is_invincible) { return; }
        this.collision = false;
        if (this.hitBox) {
            this.hitBox.collision = false;
        }
        this.dying = true;
        if (this.image instanceof My_Img_Animated) {
            this.image.die();
        }
    }


    additionnal_update(timestamp) {
        if (this.is_invincible) {
            if (this.timestampWhenInvicibililtyGiven == undefined) {
                this.timestampWhenInvicibililtyGiven = timestamp;
                return;
            }
            let elapsed = timestamp - this.timestampWhenInvicibililtyGiven;
            let delay = this.invicibility_duration * 1000
            if (elapsed >= delay) {
                this.is_invincible = false;
            }
        }
    }


    auto_actions(timestamp) {
        this.check_out_of_screen();
        this.update_velocity(0, 0);
        this.tirer(timestamp);
    }


    generate_projectile(x, y){
        //found the nearest ennemy
        let nearest_obj = undefined;
        let smallest_dist = undefined;
        const targets = ["enemy_chasing", "enemy_turret"];
        for (const obj of My_Object.instances) {
            if (obj.is_dead || obj.dying) { continue; }
            if (is_out_of_screen(obj.x, obj.y)) { continue; }
            //check if obj is a possible target
            let is_a_target = false;
            for (const target of targets) {
                if (obj.group != target) { continue; }
                is_a_target = true;
            }
            if (!is_a_target) { continue; }

            //obj is a target
            let dist = distance(this.x, this.y, obj.x, obj.y);
            //update nearest_obj based on distance
            if ((smallest_dist == undefined) || (dist < smallest_dist)) {
                nearest_obj = obj;
                smallest_dist = dist;
            }
        }

        let vel = {"x": 0, "y": 0};
        //don't shoot if their is no target
        if (nearest_obj == undefined) { return; }

        //direction toward nearest_obj
        else {
            vel = direction(this.x, this.y, nearest_obj.x, nearest_obj.y);
        }
    
        //create projectile
        create_projectile(x, y, vel.x, vel.y, "ally");

    }


    tirer(timestamp){
        if (!this.shoot) { return; }
        if (!My_Object.moving) { return; }

        if (this.timestampWhenLastShot == undefined) {
            this.timestampWhenLastShot = timestamp;
        }
        let elapsed = timestamp - this.timestampWhenLastShot;
        let delay = 1000 / this.shot_by_seconds
        if (elapsed >= delay){
            this.generate_projectile(this.x, this.y);
            this.timestampWhenLastShot = timestamp;
        }
    }


    check_out_of_screen() {
        //out of screen
        let limit_right = CNV.width;
        let limit_down = CNV.height;

        if (this.x > limit_right) {
            this.add_to_position(-limit_right, 0)
        }
        else if (this.x < 0) {
            this.add_to_position(limit_right, 0)
        }
        if (this.y > limit_down) {
            this.add_to_position(0, -limit_down)
        }
        else if (this.y < 0) {
            this.add_to_position(0, limit_down)
        }
    }


    give_direction(direction = "") {
        if (this.is_dead) { return; }
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


    draw_invincible() {
        let radius = (this.image.width+this.image.height) / 4
        draw_circle_stroke(this.x, this.y, radius, "#AeAeA7", 3)
    }


    draw() {
        if (this.is_dead) { return ; }
        if (this.image) { 
            this.image.draw();
        }
        if (this.is_invincible) {
            this.draw_invincible();
        }
        if (this.hitBox) {
            this.hitBox.draw_contours();
        }
    }
}




export class Enemy_Turret extends My_Object {
    constructor(xCenter, yCenter, image, hitBox) {
        super(xCenter, yCenter, image, hitBox, "enemy_turret");

        this.shoot = true;
        this.shot_by_seconds = 3; // 1/X, to shot every X seconds
        this.timestampWhenLastShot = undefined;
    }

    die() {
        this.shoot = false
        this.collision = false;
        if (this.hitBox) {
            this.hitBox.collision = false;
        }
        this.dying = true;
        if (this.image instanceof My_Img_Animated) {
            this.image.die();
        }
    }

    auto_actions(timestamp) {
        this.tirer(timestamp);
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
        create_projectile(x, y, velX, velY, "enemy");
    }


    tirer(timestamp){
        if (!this.shoot) { return; }
        if (!My_Object.moving) { return; }

        if (this.timestampWhenLastShot == undefined) {
            this.timestampWhenLastShot = timestamp;
        }

        let elapsed = timestamp - this.timestampWhenLastShot;
        let delay = 1000 / this.shot_by_seconds
        if (elapsed >= delay){
            this.generate_projectile(this.x, this.y - this.image.height*0.5);
            this.timestampWhenLastShot = timestamp;
        }
    }
}




export class Enemy_Projectile extends My_Object {
    constructor(xCenter, yCenter, image, hitBox, speed, velocityX, velocityY) {
        super(xCenter, yCenter, image, hitBox, "enemy_projectile", speed, velocityX, velocityY);
    }

    auto_actions(timestamp) {
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
    constructor(xCenter, yCenter, image, hitBox, speed, velocityX, velocityY)  {
        super(xCenter, yCenter, image, hitBox, "ally_projectile", speed, velocityX, velocityY);
    }

    auto_actions(timestamp) {
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
    constructor(xCenter, yCenter, image, hitBox, speed, player) {
        super(xCenter, yCenter, image, hitBox, "enemy_chasing", speed);
        this.player = player; // Référence à l'objet joueur
        // this.chaseSpeed = 6; // Vitesse de poursuite de l'ennemi
    }

    auto_actions(timestamp) {
        this.chasePlayer();
    }

    chasePlayer() {
        //Calcule la direction vers le joueur
        let dx = this.player.x - this.x;
        let dy = this.player.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        //Normalise la direction et applique la vitesse
        if (dist > 1) {
            dx = (dx / dist);
            dy = (dy / dist);
            this.update_velocity(dx, dy);
        }
    }

    die() {
        super.die();
        generate_mobs(this.player); // Générer de nouvel ennemi lors de la mort de cet ennemi
    }

    generate_on_death() {
        const chance_bonus = getRandom(0, 2);
        if (!chance_bonus) {
            create_bonus(this.x, this.y);
            return;
        }
        const chance_mobs = getRandom(0, 1);
        if(!chance_mobs) {
            const nb = getRandom(1, 3);
            for (let i = 0; i < nb; i++) {
                create_enemy_chasing(this.x+i*1, this.y);
            }
            return;
        }
    }
}


export class Player_Auto extends My_Object {
    constructor(xCenter, yCenter, image, hitBox, speed) {
        super(xCenter, yCenter, image, hitBox, "player_auto", speed);
        this.is_invincible = false;
        this.invicibility_duration = 2; //seconds
        this.timestampWhenInvicibililtyGiven = undefined;
    
        this.shoot = true;
        this.shot_by_seconds = 1; //1 / x, to shot every x seconds
        this.timestampWhenLastShot = undefined;
    }

    generate_on_death() {
        create_menu("game test");
    }


    give_invicibility(timestamp) {
        this.is_invincible = true;
        this.timestampWhenInvicibililtyGiven = timestamp;
    }


    die() {
        if (this.is_invincible) { return; }
        this.collision = false;
        if (this.hitBox) {
            this.hitBox.collision = false;
        }
        this.dying = true;
        if (this.image instanceof My_Img_Animated) {
            this.image.die();
        }
    }


    additionnal_update(timestamp) {
        if (this.is_invincible) {
            if (this.timestampWhenInvicibililtyGiven == undefined) {
                this.timestampWhenInvicibililtyGiven = timestamp;
                return;
            }
            let elapsed = timestamp - this.timestampWhenInvicibililtyGiven;
            let delay = this.invicibility_duration * 1000
            if (elapsed >= delay) {
                this.is_invincible = false;
            }
        }
    }


    auto_actions(timestamp) {
        this.update_velocity(0, 0);
        this.tirer(timestamp);
        this.choose_direction();
    }


    //define the velocity based on nearest enemy and bonus
    choose_direction() {
        const good = ["bonus_invicibility"];
        const bad = ["obstacle", "enemy_turret", "enemy_projectile", "enemy_chasing"]
        let go_to = []
        let flee_to = []

        //found all targets
        for (const obj of My_Object.instances) {
            if (obj.dying || obj.dead) { continue; }
            if (obj == this) { continue; }
            
            let found = false;
            //good
            for (const name of good) {
                if (obj.group == name) {
                    found = true;
                    break;
                }
            }
            if (found) {
                go_to.push(obj);
                continue;
            }

            //bad
            if (is_out_of_screen(obj.x, obj.y)) { continue; }
            for (const name of bad) {
                if (obj.group == name) {
                    found = true;
                    break;
                }
            }
            if (found) {
                flee_to.push(obj);
                continue;
            }
        }

        //nearest
        let weight = 1.2;
        let near_good = undefined;
        let near_bad = undefined;

        let near_dist = undefined;
        //good
        for (const obj of go_to) {
            let dist = distance(obj.x, obj.y, this.x, this.y);
            if (near_dist == undefined || dist < near_dist) {
                near_dist = dist;
                near_good = obj;
            }
        }
        near_dist = undefined;
        //bad
        for (const obj of flee_to) {
            let dist = distance(obj.x, obj.y, this.x, this.y);
            if (near_dist == undefined ||  dist < near_dist) {
                near_dist = dist;
                near_bad = obj;
            }
        }

        //final direction
        let dir_good = {"x": 0, "y": 0};
        let dir_bad = {"x": 0, "y": 0};
        
        if (near_good) {
            dir_good = direction(this.x, this.y, near_good.x, near_good.y);
        }
        if (near_bad) {
            dir_bad = direction(near_bad.x, near_bad.y, this.x, this.y);
        }
        
        //add weight
        if (near_good && near_bad) {
            let dist_bad = distance(this.x, this.y, near_bad.x, near_bad.y);
            if (dist_bad < CNV.width*0.1) {
                weight = 0.6;
            }
        }

        this.update_velocity(dir_good.x*weight + dir_bad.x, dir_good.y*weight + dir_bad.y);
    }


    generate_projectile(x, y){
        //found the nearest ennemy
        let nearest_obj = undefined;
        let smallest_dist = undefined;
        const targets = ["enemy_chasing", "enemy_turret"];
        for (const obj of My_Object.instances) {
            if (obj.is_dead || obj.dying) { continue; }
            if (is_out_of_screen(obj.x, obj.y)) { continue; }
            //check if obj is a possible target
            let is_a_target = false;
            for (const target of targets) {
                if (obj.group != target) { continue; }
                is_a_target = true;
            }
            if (!is_a_target) { continue; }

            //obj is a target
            let dist = distance(this.x, this.y, obj.x, obj.y);
            //update nearest_obj based on distance
            if ((smallest_dist == undefined) || (dist < smallest_dist)) {
                nearest_obj = obj;
                smallest_dist = dist;
            }
        }

        let vel = {"x": 0, "y": 0};
        //don't shoot if their is no targets
        if (nearest_obj == undefined) { return; }

        //direction toward nearest_obj
        else {
            vel = direction(this.x, this.y, nearest_obj.x, nearest_obj.y);
        }
    
        //create projectile
        create_projectile(x, y, vel.x, vel.y, "ally");

    }


    tirer(timestamp){
        if (!this.shoot) { return; }
        if (!My_Object.moving) { return; }

        if (this.timestampWhenLastShot == undefined) {
            this.timestampWhenLastShot = timestamp;
        }
        let elapsed = timestamp - this.timestampWhenLastShot;
        let delay = 1000 / this.shot_by_seconds
        if (elapsed >= delay){
            this.generate_projectile(this.x, this.y);
            this.timestampWhenLastShot = timestamp;
        }
    }


    draw_invincible() {
        let radius = (this.image.width+this.image.height) / 4
        draw_circle_stroke(this.x, this.y, radius, "#AeAeA7", 3)
    }


    draw() {
        if (this.is_dead) { return ; }
        if (this.image) { 
            this.image.draw();
        }
        if (this.is_invincible) {
            this.draw_invincible();
        }
        if (this.hitBox) {
            this.hitBox.draw_contours();
        }
    }
}



export class Moving_Background extends My_Object {
    constructor(x, y, image, speed /*you can add brand new properties*/) {
        super(x, y, image, undefined, "", speed, -1.0);
        /*you can add brand new this.properties*/

        this.moveTo = "right";
        if (getRandom(0, 1)) {
            this.moveTo = "left";
            this.velocityX = 1.0;
        }
    }


    auto_actions(timestamp) {
        this.slide();
    }

    slide() {
        const right = this.image.x + this.image.width*0.9
        const left = this.image.x + this.image.width*0.1
        switch (this.moveTo) {
            case "right":
                if (right < CNV.width) {
                    this.moveTo = "left";
                    this.update_velocity(1, 0);
                } 
                break;
            case "left":
                if (left > 0) {
                    this.moveTo = "right"
                    this.update_velocity(-1, 0);
                } 
        
            default:
                break;
        }
    }
}












export function create_object(name, x, y, args = {"vassel hitbox": "circle", "filename": ASSETS_DIR+"terrain/terrain", "player auto": false}, changeDefaults = false, defaults = {"width": CNV10, "height": CNV10}) {
    // console.log("new", name);
    if (changeDefaults) {
        switch (name) {
            case "bonus":
                create_bonus(x, y, defaults["width"], defaults["height"]);
                break;
            case "tree":
                create_tree(x, y, defaults["width"], defaults["height"]);
                break;
            case "border":
                create_border(x, y, defaults["width"], defaults["height"]);
                break;
            case "vassel":
                create_vassel(x, y, args["vassel hitbox"], defaults["width"], defaults["height"]);
                break;
            case "tower":
                create_tower(x, y, defaults["width"], defaults["height"]);
                break;
            case "player":
                return create_player(x, y, args["player auto"], defaults["width"], defaults["height"]);
                break;
            case "obstacle":
                return create_obstacle(x, y, args["filename"], defaults["width"], defaults["height"]);
                break;
            case "enemy chasing":
                create_enemy_chasing(x, y, args["filename"], defaults["width"], defaults["height"])
                break;
            case "moving background":
                create_moving_background(x, y, args["filename"], defaults["width"], defaults["height"]);
                break;
            default:
                console.log("error: there is no method to create this abject (\"" + name + "\").")
                console.log("In create_object in objects.js.")
                break;
        }
    }
    else {
        switch (name) {
            case "bonus":
                create_bonus(x, y);
                break;
            case "tree":
                create_tree(x, y);
                break;
            case "border":
                create_border(x, y);
                break;
            case "vassel":
                create_vassel(x, y, args["vassel hitbox"]);
                break;
            case "tower":
                create_tower(x, y);
                break;
            case "player":
                return create_player(x, y, args["player auto"]);
                break;
            case "obstacle":
                return create_obstacle(x, y, args["filename"]);
                break;
            case "enemy chasing":
                create_enemy_chasing(x, y, args["filename"]);
                break
            case "moving background":
                create_moving_background(x, y, args["filename"]);
                break;
            default:
                console.log("error: there is no method to create this abject (\"" + name + "\").")
                console.log("In create_object in objects.js.")
                break;
        }
    }
}



function create_bonus(x, y, width = CNV10*1.5, height = CNV10*1.5) {
    // prepare sprites
    let imgName = "stars_";
    let nb = [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2];
    let sprites = {"standing": {"fps": 10, "frames": []}};
    for (let i = 0; i < nb.length; i++) {
        sprites["standing"]["frames"].push(ASSETS_DIR + imgName + nb[i] + PNG_EXT);
    }
    // create object
    let imgObj = new My_Img_Animated(x, y, width, height, sprites, sprites["standing"]["frames"][0]);
    let hitBoxObj = new HitBox_Mask(x, y, ASSETS_DIR+imgName+"mask_v2"+PNG_EXT, width, height)
    new Bonus_Invicibility(x, y, imgObj, hitBoxObj)
}



function create_tree(x, y, width = CNV10, height = CNV10) {
    // prepare sprite
    let imgName = "forest/";
    if (getRandom(0, 1)) {
        imgName += "tree_large"
    }
    else {
        imgName += "tree_thin"
    }
    // create object
    let imgObj = new My_Img(ASSETS_DIR+imgName+PNG_EXT, x, y, width, height)
    let hitBox = new HitBox_Circle(x, y, (width+height)/4)
    new Obstacle(x, y, imgObj, hitBox)
}



function create_border(x, y, width, height) {
    // prepare sprite
    let imgName = "forest/tree_large";
    // create object
    let imgObj = new My_Img(ASSETS_DIR+imgName+PNG_EXT, x, y, width, height)
    let hitBox = new HitBox_Rect(x, y, width, height)
    new Obstacle(x, y, imgObj, hitBox)
}



function create_vassel(x, y, type, width = CNV10*1.5, height = CNV10*1.5) {
    // prepare sprites
    let imgName = "vassels_";
    let sprites = {"standing": {"fps": 10, "frames": []}};
    for (let i = 0; i < 6; i++) {
        sprites["standing"]["frames"].push(ASSETS_DIR + imgName + (i+1) + PNG_EXT);
    }
    // create object
    let imgObj = new My_Img_Animated(x, y, width, height, sprites);
    let hitBoxObj = undefined;
    if (type == "circle") {
        hitBoxObj = new HitBox_Circle(x, y, (width+height)/4)
    }
    else if (type == "mask") {
        hitBoxObj = new HitBox_Mask(x, y, ASSETS_DIR+imgName+"mask_v2"+PNG_EXT, width, height)
    }
    else if (type == "rect") {
        hitBoxObj = new HitBox_Rect(x, y, width, height)
    }
    new Obstacle(x, y, imgObj, hitBoxObj)

}



function create_tower(x, y, width = CNV10*1.5, height = CNV10*1.5) {
    // prepare sprites
    let imgName = "towers_";
    let nb = [6, 6, 7, 7, 8, 8, 7, 7];
    let sprites = {"standing": {"fps": 5, "frames": []}, "dying": {"fps": 5, "frames": []}};
    for (let i = 0; i < nb.length; i++) {
        sprites["standing"]["frames"].push(ASSETS_DIR + imgName + nb[i] + PNG_EXT);
    }
    for (let i = 0; i < 8; i++) {
        sprites["dying"]["frames"].push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
    }
    // create object
    let imgObj = new My_Img_Animated(x, y, width, height, sprites);
    let hitBoxObj = new HitBox_Mask(x, y, ASSETS_DIR+imgName+"mask_v2"+PNG_EXT, width, height)
    new Enemy_Turret(x, y, imgObj, hitBoxObj)
}



function create_player(x, y, auto = false, width = CNV10*1.6, height = CNV10*2) {
    // prepare sprites
    let imgPlayerName = "RedDeathFrame_";
    let sprites = {"standing": {"fps": 6, "frames": []}, "dying": {"fps": 6, "frames": []}};
    for (let i = 0; i < 5; i++) {
        sprites["standing"]["frames"].push(ASSETS_DIR + imgPlayerName + (i+1) + PNG_EXT);
    }
    for (let i = 0; i < 5; i++) {
        sprites["dying"]["frames"].push(ASSETS_DIR + "explosion_perso_" + (i+1) + PNG_EXT);
    }

    let imgAnimatedPlayer = new My_Img_Animated(x, y, width, height, sprites)
    let hitBoxPerso = new HitBox_Mask(x, y, ASSETS_DIR+imgPlayerName+"mask_v3"+PNG_EXT, width, height)
    // let hitBoxPerso = new HitBox_Circle(x, y, (width+height)/4)
    // let hitBoxPerso = new HitBox_Rect(x, y, width, height)
    // return new Player(x, y, imgAnimatedPlayer, hitBoxPerso, 15);
    if (auto) {
        return new Player_Auto(x, y, imgAnimatedPlayer, hitBoxPerso, CNV10*0.5);
    }
    else {
        return new Player(x, y, imgAnimatedPlayer, hitBoxPerso, CNV10*0.5);
    }
}



function create_obstacle(x, y, name, width = CNV10, height = CNV10) {
    let image = new My_Img(name+PNG_EXT, x, y, width, height);
    let hitBox = new HitBox_Mask(x, y, name+"_mask"+PNG_EXT, width, height);
    new Obstacle(x, y, image, hitBox);
}




function create_enemy_chasing(x, y, name = "BAT", width = CNV10, height = CNV10) {
    let sprites = {"standing": {"fps": 10, "frames": []}, "dying": {"fps": 10, "frames": []}};

    for (let i = 0; i < 3; i++) {
        sprites["standing"]["frames"].push(ASSETS_DIR + name + (i+1) + PNG_EXT);
    }

    for (let i = 0; i < 8; i++) {
        sprites["dying"]["frames"].push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
    }


    let enemyImage = new My_Img_Animated(x, y, width, height, sprites, sprites["standing"]["frames"][2], {"in": "#FFFFFF", "border": "#000000"});
    //Hitbox sous forme de cercle
    let enemyHitBox = new HitBox_Circle(x, y, (width+height)/4);
    let object = get_object("player");
    if (!object) {
        object = get_object("player_auto")
    }
    if (!object || object.dying || object.dead) { return; }
    new Enemy_Chasing(x, y, enemyImage, enemyHitBox, CNV10*0.2, object);
}



function create_projectile(x, y, velX, velY, type = {"ally, enemy": undefined}, width = CNV10*0.7, height = CNV10*0.5) {
    // width = CNV10*0.7, height = CNV10*0.5
    // prepare sprites
    let sprites = {"standing": {"fps": 4, "frames": []}, "dying": {"fps": 4, "frames": []}};
    for (let i = 0; i < 4; i++) {
        sprites["standing"]["frames"].push(ASSETS_DIR + "fireballs_mid_" + (i+1) + PNG_EXT);
    }

    for (let i = 0; i < 8; i++) {
        sprites["dying"]["frames"].push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
    }

    let imgBall = new My_Img_Animated(x, y, width, height, sprites)
    let hitBoxBall = new HitBox_Mask(x, y, ASSETS_DIR + "fireballs_mid_mask" + PNG_EXT, width, height);
    if (type == "ally") {
        new Ally_Projectile(x, y, imgBall, hitBoxBall, CNV10*0.3, velX, velY);
    }
    else if (type == "enemy") {
        new Enemy_Projectile(x, y, imgBall, hitBoxBall, CNV10*0.3, velX, velY);
    }
}




function create_moving_background(x, y, name, width = CNV.width*1.5, height = CNV.height*1.2) {
    let img = new My_Img(ASSETS_DIR+name+PNG_EXT, x, y, width, height);
    new Moving_Background(x, y, img, CNV10*0.02)
}