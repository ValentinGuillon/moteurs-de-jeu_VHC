
import { CNV, CTX, ASSETS_DIR, PNG_EXT, CNV10 } from "./script.js";
import { direction, getRandom, is_in_rect } from "./tools.js";
import { My_Img, My_Img_Animated, My_Circle, draw_rect, draw_point } from "./imgs.js";
import { HitBox_Circle, HitBox_Mask } from "./hitBox.js";
import { My_Object, Enemy_Chasing, create_object, Moving_Background }
    from "./objects.js";
import { Camera } from "./camera.js";
import { Jukebox } from "./audio.js";
import { construct_map, construct_terrain } from "./map_constructor.js";






export let camera = undefined
export let jukebox = undefined

export function init_interface() {
    camera = new Camera()
    jukebox = new Jukebox()
}



export class My_Button {
    constructor(type, xCenter, yCenter, width, height) {
        this.type = type
        this.x = xCenter;
        this.y = yCenter;
        this.width = width;
        this.height = height;
        this.add_instance(this);
    }



    static instances = [];

    static destroy_buttons () {
        My_Button.instances = [];
    }


    //for subclasses
    draw() {
        return;
    }

    is_inside(x, y) {
        const X1 = this.x - this.width/2
        const Y1 = this.y - this.height/2
        const X2 = X1 + this.width
        const Y2 = Y1 + this.height
        return is_in_rect(x, y, X1, Y1, X2, Y2);
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

            case "play_test_map":
                console.log("plAy test map")
                create_test_maps();
                break;

            case "go_main-menu":
                console.log("back menu")
                create_main_menu()
                break;

            case "mute_music":
                jukebox.mute_music();
                if (jukebox.muted) {
                    // this.update_text("Unmute")
                    this.set("off")
                }
                else {
                    // this.update_text("Mute")
                    this.set("on")
                }

                break;

            default:
                console.log("no effect")
        }
    }


    add_instance(obj) {
        My_Button.instances.push(obj);
    }
}





export class Button_with_text extends My_Button {
    constructor(text, type, x, y, width, height, font_color = "#FFFFFF", back_color = "#000000") {
        super(type, x, y, width, height, font_color, back_color)
        this.text = text;
        this.font_color = font_color;
        this.back_color = back_color;
    }

    draw() {
        this.draw_zone();
        CTX.font = "48px serif";
        CTX.fillStyle = this.font_color;
        CTX.fillText(this.text, this.x, this.y);
    }

    draw_zone() {
        draw_rect(this.x, this.y-this.height, this.width, this.height, this.back_color);
    }


    update_text(new_text) {
        this.text = new_text;
    }

    is_inside(x, y) {
        const X1 = this.x
        const Y1 = this.y - this.height
        const X2 = X1 + this.width
        const Y2 = Y1 + this.height
        return is_in_rect(x, y, X1, Y1, X2, Y2);
    }
}



export class Button_with_Image extends My_Button {
    constructor(image_src = {"default": "", "hover": ""}, type, x, y, width, height, play = "default") {
        super(type, x, y, width, height)
        this.change_when_hover = false;
        if (image_src["hover"]) {
            this.change_when_hover = true;
        }
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.image_src = image_src;

        this.img = new Image();
        this.set(play);
    }

    set(name) {
        const old = this.img.src;
        if (name == old) { return; }
        this.img.src = this.image_src[name];
    }


    draw() {
        CTX.drawImage(this.img, this.x, this.y, this.width, this.height);
    }


    is_inside(x, y) {
        const X1 = this.x
        const Y1 = this.y
        const X2 = X1 + this.width
        const Y2 = Y1 + this.height
        return is_in_rect(x, y, X1, Y1, X2, Y2);
    }
}



// function create_template {
//     //buttons
//     //objects
// }



export function create_home_page() {
    const btnSize = CNV10;
    new Button_with_text("Launch Game", "home", CNV.width/2-btnSize/2, CNV.height/2-btnSize/2, btnSize*2, btnSize, "#00FFFF")
    new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "on")
}



function create_main_menu() {
    const btnSize = CNV10;
    jukebox.play_main_menu()
    My_Img.destroy_imgs();
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    new Button_with_text("Test", "play_test", CNV.width/2, CNV.height*0.3, btnSize*2, btnSize*2, "#00FFFF")
    new Button_with_Image({"default": ASSETS_DIR+"btn_play.png", "hover": ASSETS_DIR+"btn_play_hover.png"}, "play_game", CNV.width/2, CNV.height/2, btnSize*8, btnSize*4)
    new Button_with_text("Test Map", "play_test_map", CNV.width/2, CNV.height*0.3*3, btnSize*2, btnSize*2, "#00FFFF")
    if (jukebox.muted) {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "off")
    }
    else {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "on")
    }
    create_object("moving background", CNV.width/2, CNV.height/2, {"filename": "arena"})
}

export function generate_mobs(objectPlayer) {
    let enemyX = getRandom((CNV.width/3)*2, CNV.width*1.2);
    let enemyY = getRandom(-CNV.height*0.2, CNV.height*1.2);

    create_object("enemy chasing", enemyX, enemyY, {"filename": "BAT"})
}




function create_game_test() {
    const btnSize = Math.floor(CNV10);
    jukebox.play_game()
    My_Button.destroy_buttons()
    My_Img.destroy_imgs();
    My_Object.destroy_objects();
    new Button_with_Image({"default": ASSETS_DIR+"close.png"}, "go_main-menu", CNV.width-btnSize*2, btnSize*2, btnSize*2, btnSize*2);
    if (jukebox.muted) {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "off")
    }
    else {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "on")
    }


    //BACKGROUND
    // image
    let imgBackgroundName = "arena";
    let spriteBackground = ASSETS_DIR + imgBackgroundName + PNG_EXT;
    let imgBackground = new My_Img(spriteBackground, CNV.width/2, CNV.height/2, CNV.width*2, CNV.height*2, undefined, true);
    My_Img.add_instance(imgBackground)


    //PLAYER
    let objectPlayer = create_object("player", CNV.width/2, CNV.height/2, {"player auto": true});
    // Génération des ennemis initiaux
    for (let i = 0; i < 2; i++) {
        generate_mobs(objectPlayer);
    }


    //(next instances are in another scope so variables can easily be reused by copy/paste)

    // OBSTACLES
    {
        let x_mid = CNV.width / 2
        let y_mid = CNV.height / 2
        let x_objs = [x_mid+(CNV10*2), x_mid-(CNV10*2), x_mid+(CNV10*2), x_mid-(CNV10*2)]
        let y_objs = [y_mid-(CNV10*2), y_mid+(CNV10*2), y_mid+(CNV10*2), y_mid-(CNV10*2)]
        //with circle hitBox
        for (let i = 0; i < 2; i++) {
            create_object("vassel", x_objs[i], y_objs[i], {"vassel hitbox": "circle"});
        }
        //with mask hitBox
        for (let i = 2; i < 3; i++) {
            console.log(CNV10*1.5)
            create_object("vassel", x_objs[i], y_objs[i], {"vassel hitbox": "mask"});
        }
        //with rect hitBox
        for (let i = 3; i < 4; i++) {
            create_object("vassel", x_objs[i], y_objs[i], {"vassel hitbox": "rect"});
        }
    }


    // TOWERS
    {
        let diff = CNV10*1.5;
        let x_objs = [diff, diff, CNV.width-diff, CNV.width-diff]
        let y_objs = [diff, CNV.height-diff, diff, CNV.height-diff]
        for (let i = 0; i < 4; i++) {
            create_object("tower", x_objs[i], y_objs[i])
        }
    }


    // BONUS
    {
        let x_mid = CNV.width / 2
        let y_mid = CNV.height / 2
        let diff = CNV10*1.6;
        let x_objs = [diff, x_mid, x_mid, CNV.width-diff]
        let y_objs = [y_mid, diff, CNV.height-diff, y_mid]
        for (let i = 0; i < 4; i++) {
            create_object("bonus", x_objs[i], y_objs[i])
        }
    }


    // instances des mobs
    // {
    //     //Ennemis qui poursuivent le joueur
    //     let nombreEnnemis = 10;
    //     for (let i = 0; i < nombreEnnemis; i++) {
    //         let enemyX = getRandom((CNV.width/3)*2, CNV.width); // Position X aléatoire
    //         let enemyY = getRandom(0, CNV.height); // Position Y aléatoire

    //         let imgEnemyName = "BAT";
    //         let sprites = {};
    //         let spritesEnemy = [];
    //         let spritesEnemyDead = [];

    //         for (let i = 0; i < 3; i++) {
    //             spritesEnemy.push(ASSETS_DIR + imgEnemyName + (i+1) + PNG_EXT);
    //         }
    //         sprites["standing"] = {"fps": 10, "frames": spritesEnemy};

    //         for (let i = 0; i < 8; i++) {
    //             spritesEnemyDead.push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
    //         }
    //         sprites["dying"] = {"fps": 10, "frames": spritesEnemyDead};


    //         let enemyImage = new My_Img_Animated(enemyX, enemyY, 64, 64, sprites);
    //         //Hitbox sous forme de cercle
    //         let enemyHitBox = new HitBox_Circle(enemyX, enemyY, 10);
    //         new Enemy_Chasing(enemyX, enemyY, enemyImage, enemyHitBox, 6, objectPlayer);

    //         // create_object("")
    //     }
    // }
}



function create_game_survive() {
    const btnSize = CNV10;
    jukebox.play_game();
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    My_Img.destroy_imgs();
    new Button_with_Image({"default": ASSETS_DIR+"close.png"}, "go_main-menu", CNV.width-btnSize*2, btnSize*2, btnSize*2, btnSize*2);
    if (jukebox.muted) {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "off")
    }
    else {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "on")
    }

    construct_map();

    // let cnvMidX = CNV.width/2
    // let cnvMidY = CNV.height/2
    // let mapWidth = CNV.width*8
    // let mapHeight = CNV.height*8

    // let limits = {
    //     "x":      cnvMidX-(mapWidth/2),
    //     "y":      cnvMidY-(mapHeight/2),
    //     "width":  mapWidth,
    //     "height": mapHeight,
    // }



    //PLAYER
    let objectPlayer = create_object("player", CNV.width/2, CNV.height/2, {"player auto": false});
    for (let i = 0; i < 2; i++) {
        generate_mobs(objectPlayer);
    }
}



function create_test_maps() {
    const btnSize = CNV10;
    jukebox.play_game();
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    My_Img.destroy_imgs();
    new Button_with_Image({"default": ASSETS_DIR+"close.png"}, "go_main-menu", CNV.width-btnSize*2, btnSize*2, btnSize*2, btnSize*2);
    if (jukebox.muted) {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "off")
    }
    else {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize*2, btnSize*2, btnSize*2, btnSize*2, "on")
    }

    construct_terrain();

    //PLAYER
    create_object("player", CNV.width/2, CNV.height/2, {"player auto": false});
}
