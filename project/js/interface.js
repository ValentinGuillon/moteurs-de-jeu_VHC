
import { getRandom } from "./tools.js";
import { draw_rect } from "./tools.js";
import { My_Img, My_Img_Animated } from "./imgs.js";
import { HitBox_Circle, HitBox_Mask } from "./hitBox.js";
import { My_Object, Player_Object, Enemy_Turret_Object, Static_Object, Enemy_Chasing_Object, Bonus_Object, Projectile_Object }
    from "./objects.js";
import { Camera } from "./camera.js";
import { My_Circle } from "./formes.js"



let assetsDir = "assets/"
let pngExt = ".png";


export let objectPlayer = undefined
export let imgBackground = undefined
export let camera = undefined


export class My_Button {
    constructor(ctx, cnv, type, x, y, width, height, font_color = "#FFFFFF", back_color = "#000000") {
        this.ctx = ctx;
        this.cnv = cnv;
        this.type = type
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.font_color = font_color;
        this.back_color = back_color;
        this.add_instance(this);
    }

    static instances = [];

    add_instance(obj) {
        My_Button.instances.push(obj);
    }

    action () {
        switch (this.type) {
            case "play_test":
                console.log("plAy")
                create_game_test(this.ctx, this.cnv)
                break;
            case "demo":
                console.log("démO")
                create_Main_Menu(this.ctx, this.cnv)
                break;
            case "go_main-menu":
                console.log("back menu")
                create_Main_Menu(this.ctx, this.cnv)
                break;
            default:
                console.log("no effect")
        }
    }

    draw() {
        return;
    }

    draw_zone() {
        draw_rect(this.ctx, this.x, this.y-this.height, this.width, this.height, this.back_color);
    }
}


export class Button_with_text extends My_Button {
    constructor(ctx, cnv, text, type, x, y, width, height, font_color = "#FFFFFF", back_color = "#000000") {
        super(ctx, cnv, type, x, y, width, height, font_color, back_color)
        this.text = text;
    }

    draw() {
        this.draw_zone();
        this.ctx.font = "48px serif";
        this.ctx.fillStyle = this.font_color;
        this.ctx.fillText(this.text, this.x, this.y);
    }
}


function destroy_button () {
    My_Button.instances = [];
}


export function create_Main_Menu(ctx, cnv) {
    destroy_button()
    objectPlayer = undefined
    My_Object.instances = [];
    new Button_with_text(ctx, cnv, "Play", "play_test", cnv.width/2-100, 200, 100, 100, "#00FFFF")
    // new Button_with_text(ctx, cnv, "Demo", "demo", 200, 100, 100, 100, "#00FFFF")
    let imgBackgroundName = "arena";
    let spriteBackground = assetsDir + imgBackgroundName + pngExt;
    imgBackground = new My_Img(spriteBackground, 0, 0, cnv.width, cnv.height);
    camera = new Camera(cnv.width/2, cnv.height/2, imgBackground);
}


function create_other_menu(ctx, cnv) {
    destroy_button()
    // new Button_with_text(ctx, cnv, "Play", "play", 0, 100, 100, 100, "#00FFFF")
    new Button_with_text(ctx, cnv, "Demo", "demo", 200, 100, 100, 100, "#00FFFF")
}


function create_game_test(ctx, cnv) {
    destroy_button()
    new Button_with_text(ctx, cnv, "X", "go_main-menu", cnv.width-40, 40, 30, 30, "#00FFFF")

    //BACKGROUND
    // image
    let imgBackgroundName = "arena";
    let spriteBackground = assetsDir + imgBackgroundName + pngExt;
    imgBackground = new My_Img(spriteBackground, -cnv.width/2, -cnv.height/2, cnv.width*2, cnv.height*2);
    // backgroundFolder.add(imgBackground, "visible")
    camera = new Camera(cnv.width/2, cnv.height/2, imgBackground);

    //PLAYER
    // sprites
    let imgPlayerName = "RedDeathFrame_";
    let spritesPlayerDefault = [];
    for (let i = 0; i < 5; i++) {
        spritesPlayerDefault.push(assetsDir + imgPlayerName + (i+1) + pngExt);
    }
    let spritesPlayerDead = [];
    for (let i = 0; i < 5; i++) {
        spritesPlayerDead.push(assetsDir + "explosion_perso_" + (i+1) + pngExt);
    }

    let xPlayer = cnv.width/2; let yPlayer = cnv.height/2;
    // animated img
    let imgAnimatedPlayer = new My_Img_Animated(spritesPlayerDefault, xPlayer-15, yPlayer-25, 30, 50, spritesPlayerDead)
    // hitbox
    // let hitBoxPerso = new HitBox_Circle(xPlayer, yPlayer, 
    //     (imgAnimatedPlayer.width + imgAnimatedPlayer.height) / 5)
    let hitBoxPerso = new HitBox_Mask(xPlayer-15, yPlayer-25, assetsDir+imgPlayerName+"mask_v2"+pngExt, 30, 50, ctx)

    //object
    objectPlayer = new Player_Object(xPlayer, yPlayer, imgAnimatedPlayer, hitBoxPerso);

    // playerFolder.add(imgAnimatedPlayer, "animated")
    // playerFolder.add(imgAnimatedPlayer, "visible")
    // playerFolder.add(objectPlayer.hitBox, "collision")
    // playerFolder.add(objectPlayer.hitBox, "contours")

    // obstacles
    {
        let x_mid = cnv.width / 2
        let y_mid = cnv.height / 2
        let x_objs = [x_mid+60, x_mid+60, x_mid-60, x_mid-60]
        let y_objs = [y_mid+60, y_mid-60, y_mid+60, y_mid-60]
        for (let i = 0; i < 2; i++) {
            let imgName = "vassels_";
            let spritesDefault = [];
            for (let i = 0; i < 6; i++) {
                spritesDefault.push(assetsDir + imgName + (i+1) + pngExt);
            }

            let X = x_objs[i]
            let Y = y_objs[i]
            let imgObj = new My_Img_Animated(spritesDefault, X-30, Y-30, 60, 60);
            // let hitBoxObj = new HitBox_Circle(X, Y, 30)
            let hitBoxObj = new HitBox_Mask(X-30, Y-30, assetsDir+imgName+"mask_v2"+pngExt, 60, 60, ctx)
            new Static_Object(X, Y, imgObj, hitBoxObj)
        }
        for (let i = 2; i < 4; i++) {
            let imgName = "vassels_";
            let spritesDefault = [];
            for (let i = 0; i < 6; i++) {
                spritesDefault.push(assetsDir + imgName + (i+1) + pngExt);
            }

            let X = x_objs[i]
            let Y = y_objs[i]
            let imgObj = new My_Img_Animated(spritesDefault, X-30, Y-30, 60, 60);
            let hitBoxObj = new HitBox_Circle(X, Y, 30)
            // let hitBoxObj = new HitBox_Mask(X-30, Y-30, assetsDir+imgName+"mask_v2"+pngExt, 60, 60, ctx)
            new Static_Object(X, Y, imgObj, hitBoxObj)
        }
    }


    // towers
    {
        let diff = 30;
        let x_objs = [diff, diff, cnv.width-diff, cnv.width-diff]
        let y_objs = [diff, cnv.height-diff, diff, cnv.height-diff]
        for (let i = 0; i < 4; i++) {
            let imgName = "towers_";
            let nb = [6, 6, 7, 7, 8, 8, 7, 7];
            let spritesDefault = [];
            for (let i = 0; i < nb.length; i++) {
                spritesDefault.push(assetsDir + imgName + nb[i] + pngExt);
            }
            let sprites_explosion_src = [];
            for (let i = 0; i < 8; i++) {
                sprites_explosion_src.push(assetsDir + "explosion_balle_" + (i+1) + pngExt);
            }

            let X = x_objs[i]
            let Y = y_objs[i]
            let imgObj = new My_Img_Animated(spritesDefault, X-20, Y-20, 40, 40, sprites_explosion_src);
            // let hitBoxObj = new HitBox_Circle(X, Y, 15)
            let hitBoxObj = new HitBox_Mask(X-20, Y-20, assetsDir+imgName+"mask_v2"+pngExt, 40, 40, ctx)
            new Enemy_Turret_Object(X, Y, imgObj, hitBoxObj, ctx)
        }
    }




    // bonus
    {
        let x_mid = cnv.width / 2
        let y_mid = cnv.height / 2
        let diff = 40;
        let x_objs = [diff, x_mid, x_mid, cnv.width-diff]
        let y_objs = [y_mid, diff, cnv.height-diff, y_mid]
        for (let i = 0; i < 4; i++) {
            let imgName = "stars_";
            let nb = [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2];
            let spritesDefault = [];
            for (let i = 0; i < nb.length; i++) {
                spritesDefault.push(assetsDir + imgName + nb[i] + pngExt);
            }

            let X = x_objs[i]
            let Y = y_objs[i]
            let imgObj = new My_Img_Animated(spritesDefault, X-25, Y-25, 50, 50);
            // let hitBoxObj = new HitBox_Circle(X, Y, 20)
            let hitBoxObj = new HitBox_Mask(X-25, Y-25, assetsDir+imgName+"mask_v2"+pngExt, 50, 50, ctx)
            new Bonus_Object(X, Y, imgObj, hitBoxObj)
        }
    }


    // instances des mobs
    {
        //Ennemis qui poursuivent le joueur
        let nombreEnnemis = 10;
        for (let i = 0; i < nombreEnnemis; i++) {
            let enemyX = getRandom(cnv.width/2, cnv.width); // Position X aléatoire
            let enemyY = getRandom(0, cnv.height); // Position Y aléatoire

            // // Création du cercle rouge pour faire l'ennemi
            // let enemyImage = {
            //     draw: function(ctx) {
            //         ctx.beginPath();
            //         ctx.arc(enemyX, enemyY, 15, 0, 2 * Math.PI); // Rayon de 15
            //         ctx.fillStyle = 'green';
            //         ctx.fill();
            //         ctx.closePath();
            //     },
            //     x: enemyX,
            //     y: enemyY
            // };
            let enemyImage = new My_Circle(enemyX, enemyY, 15, "green")

            //Hitbox sous forme de cercle
            let enemyHitBox = new HitBox_Circle(enemyX, enemyY, 15);

            let chasingEnemy = new Enemy_Chasing_Object(enemyX, enemyY, enemyImage, enemyHitBox, objectPlayer);
            // My_Object.instances.push(chasingEnemy);
        }
    }



}



