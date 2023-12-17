
import { CNV, CTX, ASSETS_DIR, PNG_EXT, CNV10 } from "./script.js";
import { direction, getRandom, is_in_rect } from "./tools.js";
import { My_Img, My_Img_Animated, My_Circle, draw_rect, draw_point } from "./imgs.js";
import { HitBox_Mask } from "./hitBox.js";
import { My_Object, Enemy_Chasing, create_object, Moving_Background, Enemy_Generator, Biome }
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
        this.x = xCenter - width/2;
        this.y = yCenter - height/2;
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

            case "play_demo":
                console.log("plAy demo")
                create_game("demo")
                break;

            case "play_game":
                console.log("plAy game survive")
                create_game("play")
                break;

            case "go_main-menu":
                console.log("back menu")
                create_main_menu()
                break;
            case "exit_game_over":
                console.log("exot game over")
                create_main_menu(false);
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
        CTX.font = this.height*0.5+"px serif";
        CTX.fillStyle = this.font_color;
        CTX.fillText(this.text, this.x, this.y+this.height*0.75, this.width);
    }

    draw_zone() {
        draw_rect(this.x, this.y, this.width, this.height, this.back_color);
    }


    update_text(new_text) {
        this.text = new_text;
    }

    is_inside(x, y) {
        const X1 = this.x
        const Y1 = this.y
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









export function generate_mobs(objectPlayer) {
    let enemyX = 0;
    let enemyY = 0;

    while(is_in_rect(enemyX, enemyY, 0, 0, CNV.width, CNV.height)) {
        enemyX = getRandom(-CNV.width*0.2, CNV.width*1.2);
        enemyY = getRandom(-CNV.height*0.2, CNV.height*1.2);
    }



    create_object("enemy chasing", enemyX, enemyY, {"filename": "BAT"})
}








export function create_menu(name = {"home_page || main_menu || play_game || play_demon || game_over": undefined}, reload_music = true, auto_skip = false) {
    switch (name) {
        case "home_page":
            create_home_page(reload_music);
            break;
        case "main_menu":
            create_main_menu(reload_music);
            break;
        case "play_game":
            create_game("play");
            break;
        case "play_demo":
            create_game("demo", reload_music);
            break;
        case "game_over":
            create_game_over(auto_skip);
            break;
    
        default:
            console.log("error: in interface.js, create_menu(...).")
            console.log("There is no menu called \"" + name + "\".")
            break;
    }
}



// function create_template(reload_music = true) {
//     const btnSize = CNV10;
//     if (reload_music) {
//         jukebox.play_main_menu()
//     }
//     My_Img.destroy_imgs();
//     My_Button.destroy_buttons();
//     My_Object.destroy_objects();
// }



function create_home_page() {
    const btnSize = CNV10;
    new Button_with_text("Launch Game", "home", CNV.width/2, CNV.height/2, btnSize*2, btnSize, "#00FFFF")
    new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize, btnSize, btnSize*1.5, btnSize*1.5, "on")

    const filename = ASSETS_DIR + "background/" + "home_" + getRandom(1, 3)+  PNG_EXT;
    const img = new My_Img(filename, CNV.width/2, CNV.height/2, CNV.width*1.5, CNV.height*1.2, undefined, undefined, true);
    My_Img.add_instance(img);
}



function create_main_menu(reload_music = true) {
    const btnSize = CNV10;

    My_Img.destroy_imgs();
    My_Button.destroy_buttons();
    My_Object.destroy_objects();

    if (reload_music) {
        jukebox.play_main_menu()
    }

    // buttons
    if (jukebox.muted) {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize, btnSize, btnSize*1.5, btnSize*1.5, "off")
    }
    else {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize, btnSize, btnSize*1.5, btnSize*1.5, "on")
    }

    const scale = 3;
    new Button_with_Image({"default": ASSETS_DIR+"btn_play.png", "hover": ASSETS_DIR+"btn_play_hover.png"}, "play_game", CNV.width/2, CNV.height/3, btnSize*2*scale, btnSize*scale)
    new Button_with_Image({"default": ASSETS_DIR+"btn_demo.png", "hover": ASSETS_DIR+"btn_demo_hover.png"}, "play_demo", CNV.width/2, (CNV.height/3)*2, btnSize*2*scale, btnSize*scale)

    const file_nb = getRandom(1, 6); 
    const BIOME = getRandom(1, 3);
    const nb = getRandom(1, 2);
    create_object("moving background", CNV.width/2, CNV.height/2, {"filename": "background/main-menu_biome_"+BIOME+"_"+nb+"_blur"}, true, {"width": CNV.width*2.2, "height": CNV.height*1.5})
    create_object("timer", 0, 0, {"timer name": "demo", "timer duration": 2})
    new Biome(BIOME);
}




function create_game(mode = "play", reload_music = true, choices = {"mode": {"play || demo": undefined}}) {
    const btnSize = CNV10;

    let obj = My_Object.get_object("biome");
    let biome = 0;
    if (obj == undefined) {
        biome = 1;
    }
    else {
        biome = obj.biome
    }

    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    My_Img.destroy_imgs();

    if (reload_music) {
        jukebox.play_game();
    }

    // buttons
    new Button_with_Image({"default": ASSETS_DIR+"close.png"}, "go_main-menu", CNV.width-btnSize, btnSize, btnSize*1.5, btnSize*1.5);
    if (jukebox.muted) {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize, btnSize, btnSize*1.5, btnSize*1.5, "off")
    }
    else {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize, btnSize, btnSize*1.5, btnSize*1.5, "on")
    }

    
    //objects
    //PLAYER
    let player = undefined;
    if (mode == "play") { 
        player = create_object("player", CNV.width/2, CNV.height/2);
    }
    else if (mode == "demo") {
        player = create_object("player", CNV.width/2, CNV.height/2, {"player auto": true});
    }
    
    //other
    // for (let i = 0; i < 2; i++) {
    //     generate_mobs(player);
    // }
    new Enemy_Generator(0, 0, undefined, undefined, player);


    // construct_map();
    construct_terrain(biome);
}





function create_game_over(auto_skip = false) {
    My_Button.destroy_buttons();
    My_Object.destroy_objects();
    My_Img.destroy_imgs();

    const btnSize = CNV10;
    jukebox.play_main_menu();

    if (jukebox.muted) {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize, btnSize, btnSize*1.5, btnSize*1.5, "off")
    }
    else {
        new Button_with_Image({"on": ASSETS_DIR+"sound_on.png", "off": ASSETS_DIR+"sound_off.png"}, "mute_music", btnSize, btnSize, btnSize*1.5, btnSize*1.5, "on")
    }


    new Button_with_text("Game Over", "exit_game_over", CNV.width/2, CNV.height/2, btnSize*2, btnSize*2, "#00FFFF")
    // create_object("moving background", CNV.width/2, CNV.height/2, {"filename": "arena"})
    const img = new My_Img(ASSETS_DIR+"background/game-over"+PNG_EXT, CNV.width/2, CNV.height/2, CNV.width, CNV.height, undefined, undefined, true);
    My_Img.add_instance(img);

    if(auto_skip) {
        create_object("timer", 0, 0, {"timer name": "main_menu", "timer duration": 2});
    }
}

