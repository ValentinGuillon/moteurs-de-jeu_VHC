
import { CNV, CTX, ASSETS_DIR, PNG_EXT } from "./script.js";
import { getRandom, is_in_rect } from "./tools.js";
import { My_Img, My_Img_Animated, My_Circle, draw_rect } from "./imgs.js";
import { HitBox_Circle, HitBox_Mask } from "./hitBox.js";
import { My_Object, Player, Enemy_Turret, Obstacle, Enemy_Chasing, Bonus_Invicibility }
    from "./objects.js";
import { Camera } from "./camera.js";
import { Jukebox } from "./audio.js";






export let imgBackground = new My_Img(undefined, 0, 0, undefined, undefined);
export let camera = undefined
export let jukebox = new Jukebox()




export class My_Button {
    constructor(type, x, y, width, height, font_color = "#FFFFFF", back_color = "#000000") {
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

    static destroy_buttons () {
        My_Button.instances = [];
    }

    static get_mute_button() {
        for (const btn of My_Button.instances) {
            if (btn.type == "mute_music") {
                return btn;
            }
        }
        return undefined;
    }


    //for subclasses
    draw() {
        return;
    }


    action () {
        switch (this.type) {
            case "home":
                console.log("hOme")
                create_main_menu()
                break;

            case "play_test":
                console.log("plAy game test")
                create_game_test()
                break;

            case "play_game":
                console.log("plAy game survive")
                create_game_survive()
                break;

            case "go_main-menu":
                console.log("back menu")
                create_main_menu()
                break;

            case "mute_music":
                jukebox.mute_music();
                let btn = My_Button.get_mute_button();
                if (!btn) { break; }
                if (jukebox.muted) {
                    btn.update_text("Unmute")
                }
                else {
                    btn.update_text("Mute")
                }

                break;

            default:
                console.log("no effect")
        }
    }


    draw_zone() {
        draw_rect(this.x, this.y-this.height, this.width, this.height, this.back_color);
    }


    add_instance(obj) {
        My_Button.instances.push(obj);
    }
}





export class Button_with_text extends My_Button {
    constructor(text, type, x, y, width, height, font_color = "#FFFFFF", back_color = "#000000") {
        super(type, x, y, width, height, font_color, back_color)
        this.text = text;
    }

    draw() {
        this.draw_zone();
        CTX.font = "48px serif";
        CTX.fillStyle = this.font_color;
        CTX.fillText(this.text, this.x, this.y);
    }

    update_text(new_text) {
        this.text = new_text;
    }
}






// function create_template {
//     //buttons
//     //objects
//     camera = new Camera(..., ..., ...)
// }



export function create_home_page() {
    new Button_with_text("Launch Game", "home", 200, 100, 100, 100, "#00FFFF")
    new Button_with_text("Mute", "mute_music", 40, 40, 30, 30, "#00FFFF")
}



function create_main_menu() {
    jukebox.play_main_menu()
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    new Button_with_text("Test", "play_test", CNV.width/2-100, 200, 100, 100, "#00FFFF")
    new Button_with_text("Play", "play_game", CNV.width/2-100, 320, 100, 100, "#00FFFF")
    if (jukebox.muted) {
        new Button_with_text("Unmute", "mute_music", 40, 40, 30, 30, "#00FFFF")
    }
    else {
        new Button_with_text("Mute", "mute_music", 40, 40, 30, 30, "#00FFFF")
    }
    let imgBackgroundName = "arena";
    let spriteBackground = ASSETS_DIR + imgBackgroundName + PNG_EXT;
    imgBackground.overwrite(spriteBackground, CNV.width/2, CNV.height/2, CNV.width, CNV.height);

    camera = new Camera(CNV.width/2, CNV.height/2, imgBackground);
}



function create_game_test() {
    jukebox.play_game()
    My_Button.destroy_buttons()
    new Button_with_text("X", "go_main-menu", CNV.width-40, 40, 30, 30, "#00FFFF")
    if (jukebox.muted) {
        new Button_with_text("Unmute", "mute_music", 40, 40, 30, 30, "#00FFFF")
    }
    else {
        new Button_with_text("Mute", "mute_music", 40, 40, 30, 30, "#00FFFF")
    }


    //BACKGROUND
    // image
    let imgBackgroundName = "arena";
    let spriteBackground = ASSETS_DIR + imgBackgroundName + PNG_EXT;
    imgBackground.overwrite(spriteBackground, CNV.width/2, CNV.height/2, CNV.width*2, CNV.height*2);


    //PLAYER
    // sprites
    let imgPlayerName = "RedDeathFrame_";
    let spritesPlayerDefault = [];
    for (let i = 0; i < 5; i++) {
        spritesPlayerDefault.push(ASSETS_DIR + imgPlayerName + (i+1) + PNG_EXT);
    }
    let spritesPlayerDead = [];
    for (let i = 0; i < 5; i++) {
        spritesPlayerDead.push(ASSETS_DIR + "explosion_perso_" + (i+1) + PNG_EXT);
    }

    let xPlayer = CNV.width/2; let yPlayer = CNV.height/2;
    // animated img
    let imgAnimatedPlayer = new My_Img_Animated(spritesPlayerDefault, xPlayer, yPlayer, 30, 50, 6, spritesPlayerDead)
    // hitbox
    // let hitBoxPerso = new HitBox_Circle(xPlayer, yPlayer, 
    //     (imgAnimatedPlayer.width + imgAnimatedPlayer.height) / 5)
    let hitBoxPerso = new HitBox_Mask(xPlayer, yPlayer, ASSETS_DIR+imgPlayerName+"mask_v2"+PNG_EXT, 30, 50)

    // object
    let objectPlayer = new Player(xPlayer, yPlayer, imgAnimatedPlayer, hitBoxPerso);



    //(next instances are in another scope so variables can easily be reused by copy/paste)

    // OBSTACLES
    {
        let x_mid = CNV.width / 2
        let y_mid = CNV.height / 2
        let x_objs = [x_mid+60, x_mid-60, x_mid+60, x_mid-60]
        let y_objs = [y_mid-60, y_mid+60, y_mid+60, y_mid-60]
        //with circle hitBox
        for (let i = 0; i < 2; i++) {
            let imgName = "vassels_";
            let spritesDefault = [];
            for (let i = 0; i < 6; i++) {
                spritesDefault.push(ASSETS_DIR + imgName + (i+1) + PNG_EXT);
            }

            let X = x_objs[i]
            let Y = y_objs[i]
            let imgObj = new My_Img_Animated(spritesDefault, X, Y, 60, 60, 10);
            //hitBox
            let hitBoxObj = new HitBox_Circle(X, Y, 30)
            new Obstacle(X, Y, imgObj, hitBoxObj)
        }
        //with mask hitBox
        for (let i = 2; i < 4; i++) {
            let imgName = "vassels_";
            let spritesDefault = [];
            for (let i = 0; i < 6; i++) {
                spritesDefault.push(ASSETS_DIR + imgName + (i+1) + PNG_EXT);
            }

            let X = x_objs[i]
            let Y = y_objs[i]
            let imgObj = new My_Img_Animated(spritesDefault, X, Y, 60, 60, 10);
            //hitBox
            let hitBoxObj = new HitBox_Mask(X, Y, ASSETS_DIR+imgName+"mask_v2"+PNG_EXT, 60, 60)
            new Obstacle(X, Y, imgObj, hitBoxObj)
        }
    }


    // TOWERS
    {
        let diff = 30;
        let x_objs = [diff, diff, CNV.width-diff, CNV.width-diff]
        let y_objs = [diff, CNV.height-diff, diff, CNV.height-diff]
        for (let i = 0; i < 4; i++) {
            let imgName = "towers_";
            let nb = [6, 6, 7, 7, 8, 8, 7, 7];
            let spritesDefault = [];
            for (let i = 0; i < nb.length; i++) {
                spritesDefault.push(ASSETS_DIR + imgName + nb[i] + PNG_EXT);
            }
            let sprites_explosion_src = [];
            for (let i = 0; i < 8; i++) {
                sprites_explosion_src.push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
            }

            let X = x_objs[i]
            let Y = y_objs[i]
            let imgObj = new My_Img_Animated(spritesDefault, X, Y, 40, 40, 5, sprites_explosion_src);
            // let hitBoxObj = new HitBox_Circle(X, Y, 15)
            let hitBoxObj = new HitBox_Mask(X, Y, ASSETS_DIR+imgName+"mask_v2"+PNG_EXT, 40, 40)
            new Enemy_Turret(X, Y, imgObj, hitBoxObj)
        }
    }


    // BONUS
    {
        let x_mid = CNV.width / 2
        let y_mid = CNV.height / 2
        let diff = 40;
        let x_objs = [diff, x_mid, x_mid, CNV.width-diff]
        let y_objs = [y_mid, diff, CNV.height-diff, y_mid]
        for (let i = 0; i < 4; i++) {
            let imgName = "stars_";
            let nb = [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2];
            let spritesDefault = [];
            for (let i = 0; i < nb.length; i++) {
                spritesDefault.push(ASSETS_DIR + imgName + nb[i] + PNG_EXT);
            }

            let X = x_objs[i]
            let Y = y_objs[i]
            let imgObj = new My_Img_Animated(spritesDefault, X, Y, 50, 50, 3);
            // let hitBoxObj = new HitBox_Circle(X, Y, 20)
            let hitBoxObj = new HitBox_Mask(X, Y, ASSETS_DIR+imgName+"mask_v2"+PNG_EXT, 50, 50)
            new Bonus_Invicibility(X, Y, imgObj, hitBoxObj)
        }
    }


    // instances des mobs
    {
        //Ennemis qui poursuivent le joueur
        let nombreEnnemis = 10;
        for (let i = 0; i < nombreEnnemis; i++) {
            let enemyX = getRandom((CNV.width/3)*2, CNV.width); // Position X aléatoire
            let enemyY = getRandom(0, CNV.height); // Position Y aléatoire

            let enemyImage = new My_Circle(enemyX, enemyY, 15, "green")
            //Hitbox sous forme de cercle
            let enemyHitBox = new HitBox_Circle(enemyX, enemyY, 15);
            new Enemy_Chasing(enemyX, enemyY, enemyImage, enemyHitBox, objectPlayer);
        }
    }



    camera = new Camera(CNV.width/2, CNV.height/2, imgBackground);
}



function create_game_survive() {
    jukebox.play_game();
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    new Button_with_text("X", "go_main-menu", CNV.width-40, 40, 30, 30, "#00FFFF")
    if (jukebox.muted) {
        new Button_with_text("Unmute", "mute_music", 40, 40, 30, 30, "#00FFFF")
    }
    else {
        new Button_with_text("Mute", "mute_music", 40, 40, 30, 30, "#00FFFF")
    }

    let cnvMidX = CNV.width/2
    let cnvMidY = CNV.height/2
    let mapWidth = CNV.width*4
    let mapHeight = CNV.height*4

    let limits = {
        "x":      cnvMidX-(mapWidth/2),
        "y":      cnvMidY-(mapHeight/2),
        "width":  mapWidth,
        "height": mapHeight,
    }

    let imgBackgroundName = "arena";
    let spriteBackground = ASSETS_DIR + imgBackgroundName + PNG_EXT;
    imgBackground.overwrite(spriteBackground, cnvMidX, cnvMidY, limits.width, limits.height);


    //PLAYER
    // sprites
    let imgPlayerName = "RedDeathFrame_";
    let spritesPlayerDefault = [];
    for (let i = 0; i < 5; i++) {
        spritesPlayerDefault.push(ASSETS_DIR + imgPlayerName + (i+1) + PNG_EXT);
    }
    let spritesPlayerDead = [];
    for (let i = 0; i < 5; i++) {
        spritesPlayerDead.push(ASSETS_DIR + "explosion_perso_" + (i+1) + PNG_EXT);
    }

    let xPlayer = CNV.width/2; let yPlayer = CNV.height/2;
    // animated img
    let imgAnimatedPlayer = new My_Img_Animated(spritesPlayerDefault, xPlayer, yPlayer, 30, 50, 6, spritesPlayerDead)
    // hitbox
    // let hitBoxPerso = new HitBox_Circle(xPlayer, yPlayer, 
    //     (imgAnimatedPlayer.width + imgAnimatedPlayer.height) / 5)
    let hitBoxPerso = new HitBox_Mask(xPlayer, yPlayer, ASSETS_DIR+imgPlayerName+"mask_v2"+PNG_EXT, 30, 50)

    // object
    let objectPlayer = new Player(xPlayer, yPlayer, imgAnimatedPlayer, hitBoxPerso, 10);


    // OBSTACLES
    {
        let imgName = "vassels_";
        let radius = 30;
        let rows = Math.floor(limits.width / (radius*2))
        let columns = Math.floor(limits.height / (radius*2))
        

    
        //limits obstacles
        for (let i = 1; i <= rows; i++) {
            for (let j = 1; j <= columns ; j++) {
                if (!(i == 1 || i == rows || j == 1 || j == columns)) { continue; }
                //get here only if it's a border
                let X = limits.x + (i*(radius*2)) - radius
                let Y = limits.y + (j* (radius*2)) - radius

                let spritesDefault = [];
                for (let i = 0; i < 6; i++) {
                    spritesDefault.push(ASSETS_DIR + imgName + (i+1) + PNG_EXT);
                }

                // let imgObj = new My_Img_Animated(spritesDefault, X, Y, 60, 60, 10);
                let imgObj = new My_Circle(X, Y, 30, "#0000FF");
                //hitBox
                let hitBoxObj = new HitBox_Circle(X, Y, 30)
                new Obstacle(X, Y, imgObj, hitBoxObj)
            }
        }
    }



    // TOWERS
    {
        let offset = ((limits.width+limits.height) /2) /4;
        // let offset = 30;
        let coords = [
            {"x": limits.x + offset,     "y": limits.y + offset},
            {"x": limits.x + offset,     "y": limits.y + limits.height - offset},
            {"x": limits.x + limits.width - offset, "y": limits.y + offset},
            {"x": limits.x + limits.width - offset, "y": limits.y + limits.height - offset},
        ]
        // let coords = [
        //     {"x": -offset,     "y": offset},
        //     {"x": -offset,     "y": CNV.height - offset},
        //     {"x": CNV.width - offset, "y": offset},
        //     {"x": CNV.width - offset, "y": CNV.height - offset},
        // ]
        for (let i = 0; i < coords.length; i++) {
            let imgName = "towers_";
            let nb = [6, 6, 7, 7, 8, 8, 7, 7];
            let spritesDefault = [];
            for (let i = 0; i < nb.length; i++) {
                spritesDefault.push(ASSETS_DIR + imgName + nb[i] + PNG_EXT);
            }
            let sprites_explosion_src = [];
            for (let i = 0; i < 8; i++) {
                sprites_explosion_src.push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
            }

            let X = coords[i].x
            let Y = coords[i].y
            let imgObj = new My_Img_Animated(spritesDefault, X, Y, 40, 40, 3, sprites_explosion_src, ASSETS_DIR+"test_icone"+PNG_EXT);
            // let hitBoxObj = new HitBox_Circle(X, Y, 15)
            let hitBoxObj = new HitBox_Mask(X, Y, ASSETS_DIR+imgName+"mask_v2"+PNG_EXT, 40, 40)
            new Enemy_Turret(X, Y, imgObj, hitBoxObj)
        }
    }


    // MOBS
    {
        let nombreObj = 10;
        for (let i = 0; i < nombreObj; i++) {
            //define position
            let X = getRandom(10, CNV.width-10);
            let Y = getRandom(cnvMidX+20, CNV.height-10);
            let restart = false;
            if (!is_in_rect(X, Y, 10, 10, CNV.width-10, CNV.height-10)) {
                restart = true;
            }
            if (is_in_rect(X, Y, cnvMidX-50, cnvMidY-50, cnvMidX+50, cnvMidY+50)) {
                restart = true;
            }
            if (restart) {
                i--;
                continue;
            }

            //create object
            // let objImg = new My_Circle(X, Y, 20, "green")
            let objImg = new My_Img(ASSETS_DIR+"test_mob"+PNG_EXT, X, Y, 40, 40, ASSETS_DIR+"test_icone_2"+PNG_EXT)
            let objHitBox = new HitBox_Circle(X, Y, 20);
            new Enemy_Chasing(X, Y, objImg, objHitBox, objectPlayer);
        }
    }


    camera = new Camera(CNV.width/2, CNV.height/2, imgBackground);
}


