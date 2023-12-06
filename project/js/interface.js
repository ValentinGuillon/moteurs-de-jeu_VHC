
import { CNV, CTX, ASSETS_DIR, PNG_EXT } from "./script.js";
import { getRandom, is_in_rect } from "./tools.js";
import { My_Img, My_Img_Animated, My_Circle, draw_rect } from "./imgs.js";
import { HitBox_Circle, HitBox_Mask } from "./hitBox.js";
import { My_Object, Enemy_Chasing, create_object }
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
// }



export function create_home_page() {
    const btnSize = CNV.height*0.1;
    new Button_with_text("Launch Game", "home", CNV.width/2-btnSize/2, CNV.height/2-btnSize/2, btnSize*2, btnSize, "#00FFFF")
    new Button_with_text("Mute", "mute_music", btnSize, btnSize*2, btnSize, btnSize, "#00FFFF")
}



function create_main_menu() {
    const btnSize = CNV.height*0.1;
    jukebox.play_main_menu()
    My_Img.destroy_imgs();
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    new Button_with_text("Test", "play_test", CNV.width/2, CNV.height*0.3, btnSize*2, btnSize*2, "#00FFFF")
    new Button_with_text("Play", "play_game", CNV.width/2, CNV.height*0.3*2, btnSize*2, btnSize*2, "#00FFFF")
    new Button_with_text("Test Map", "play_test_map", CNV.width/2, CNV.height*0.3*3, btnSize*2, btnSize*2, "#00FFFF")
    if (jukebox.muted) {
        new Button_with_text("Unmute", "mute_music", btnSize, btnSize*2, btnSize, btnSize, "#00FFFF")
    }
    else {
        new Button_with_text("Mute", "mute_music", btnSize, btnSize*2, btnSize, btnSize, "#00FFFF")
    }
    let imgBackgroundName = "arena";
    let spriteBackground = ASSETS_DIR + imgBackgroundName + PNG_EXT;
    let imgBackground = new My_Img(spriteBackground, CNV.width/2, CNV.height/2, CNV.width, CNV.height, undefined, true);
    My_Img.add_instance(imgBackground);
}



function create_game_test() {
    const btnSize = CNV.height*0.1;
    jukebox.play_game()
    My_Button.destroy_buttons()
    My_Img.destroy_imgs();
    new Button_with_text("X", "go_main-menu", CNV.width - btnSize*2, btnSize*2, btnSize, btnSize, "#00FFFF")
    if (jukebox.muted) {
        new Button_with_text("Unmute", "mute_music", btnSize, btnSize*2, btnSize, btnSize, "#00FFFF")
    }
    else {
        new Button_with_text("Mute", "mute_music", btnSize, btnSize*2, btnSize, btnSize, "#00FFFF")
    }


    //BACKGROUND
    // image
    let imgBackgroundName = "arena";
    let spriteBackground = ASSETS_DIR + imgBackgroundName + PNG_EXT;
    let imgBackground = new My_Img(spriteBackground, CNV.width/2, CNV.height/2, CNV.width*2, CNV.height*2, undefined, true);
    My_Img.add_instance(imgBackground)


    //PLAYER
    let objectPlayer = create_object("player", {"x": CNV.width/2, "y": CNV.height/2, "width": Math.floor(btnSize*1.6), "height": Math.floor(btnSize*2)});
    


    //(next instances are in another scope so variables can easily be reused by copy/paste)

    // OBSTACLES
    {
        let x_mid = CNV.width / 2
        let y_mid = CNV.height / 2
        let x_objs = [x_mid+60, x_mid-60, x_mid+60, x_mid-60]
        let y_objs = [y_mid-60, y_mid+60, y_mid+60, y_mid-60]
        //with circle hitBox
        for (let i = 0; i < 2; i++) {
            create_object("vassel circle", {"x": x_objs[i], "y": y_objs[i], "width": 60, "height": 60});
        }
        //with mask hitBox
        for (let i = 2; i < 3; i++) {
            create_object("vassel mask", {"x": x_objs[i], "y": y_objs[i], "width": 60, "height": 60});
        }
        //with rect hitBox
        for (let i = 3; i < 4; i++) {
            create_object("vassel rect", {"x": x_objs[i], "y": y_objs[i], "width": 60, "height": 60});
        }
    }


    // TOWERS
    {
        let diff = 30;
        let x_objs = [diff, diff, CNV.width-diff, CNV.width-diff]
        let y_objs = [diff, CNV.height-diff, diff, CNV.height-diff]
        for (let i = 0; i < 4; i++) {
            create_object("tower", {"x": x_objs[i], "y": y_objs[i], "width": 40, "height": 40})
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
            create_object("bonus", {"x": x_objs[i], "y": y_objs[i], "width": 50, "height": 50})
        }
    }


    // instances des mobs
    {
        //Ennemis qui poursuivent le joueur
        let nombreEnnemis = 10;
        for (let i = 0; i < nombreEnnemis; i++) {
            let enemyX = getRandom((CNV.width/3)*2, CNV.width); // Position X aléatoire
            let enemyY = getRandom(0, CNV.height); // Position Y aléatoire

            let imgEnemyName = "BAT";
            let spritesEnemy = [];
            let spritesEnemyDead = [];

            for (let i = 0; i < 3; i++) {
                spritesEnemy.push(ASSETS_DIR + imgEnemyName + (i+1) + PNG_EXT);
            }

            for (let i = 0; i < 8; i++) {
                spritesEnemyDead.push(ASSETS_DIR + "explosion_balle_" + (i+1) + PNG_EXT);
            }


            let enemyImage = new My_Img_Animated(spritesEnemy, enemyX, enemyY, 64, 64, 10, spritesEnemyDead);
            //Hitbox sous forme de cercle
            let enemyHitBox = new HitBox_Circle(enemyX, enemyY, 10);
            new Enemy_Chasing(enemyX, enemyY, enemyImage, enemyHitBox, objectPlayer);
        }
    }
}



function create_game_survive() {
    jukebox.play_game();
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    My_Img.destroy_imgs();
    new Button_with_text("X", "go_main-menu", CNV.width-40, 40, 30, 30, "#00FFFF");
    if (jukebox.muted) {
        new Button_with_text("Unmute", "mute_music", 40, 40, 30, 30, "#00FFFF");
    }
    else {
        new Button_with_text("Mute", "mute_music", 40, 40, 30, 30, "#00FFFF");
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
    create_object("player", {"x": CNV.width/2, "y": CNV.height/2, "width": 30, "height": 50});
    
}



function create_test_maps() {
    jukebox.play_game();
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    My_Img.destroy_imgs();
    new Button_with_text("X", "go_main-menu", CNV.width-40, 40, 30, 30, "#00FFFF");
    if (jukebox.muted) {
        new Button_with_text("Unmute", "mute_music", 40, 40, 30, 30, "#00FFFF");
    }
    else {
        new Button_with_text("Mute", "mute_music", 40, 40, 30, 30, "#00FFFF");
    }

    construct_terrain();

    //PLAYER
    create_object("player", {"x": CNV.width/2, "y": CNV.height/2, "width": 30, "height": 50});
}
