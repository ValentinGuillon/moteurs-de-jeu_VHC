

import {My_Img, My_Img_Animated} from "./imgs.js"

export let shoot = true;


export class My_Object {
    constructor(x, y, object_image, hitBox, group = "", velocityX = 1.0, velocityY = 0.0) {
        this.x = x;
        this.y = y;
        this.object_image = object_image;
        this.hitBox = hitBox;

        this.speed = 10;
        this.velocityX = velocityX; //between -1 and 1
        this.velocityY = velocityY; //between -1 and 1

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
        this.stop = !My_Object.moving;
        this.hitBox.contours = My_Object.hitBoxVisible;
        if (this.dead || this.dying) { return; }
        this.hitBox.collision = My_Object.collision;
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
            this.draw_invincible(ctx);
        }
        this.hitBox.draw_contours(ctx);
    }

    draw_invincible(ctx) {
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

            if (obj.hitBox.is_colliding(this.hitBox)) {
                switch (this.group) {
                    case "ally":
                        switch(obj.group) {
                            case "bonus":
                                this.invincible = true;
                                return 1;
                            case "ally":
                                return 1;
                            case "enemy":
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
                            case "static":
                                this.die();
                                return 0;
                            case "ally":
                                this.die();
                                return 0;
                            case "projectile":
                                return 1;
                            case "enemy":
                                return 1;
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
        this.velocityX *= -1;
        this.velocityY *= -1;
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



// export {shoot, My_Object}
