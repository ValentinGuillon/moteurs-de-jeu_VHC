
let assetsDir = "assets/"

export class Jukebox {
    constructor() {
        this.music = undefined;
        this.sound = undefined;
    }

    play_music() {
        if (!this.music) { return; }
        this.music.play();
    }
    
    stop_music() {
        if (!this.music) { return; };
        this.music.pause();
    }


    play_main_menu() {
        this.stop_music();
        this.music = new Audio(assetsDir + "main-menu_v1.mp3");
        this.music.volume = 0.5
        this.music.loop = true;
        this.play_music();
    }

    play_game() {
        this.stop_music();
        this.music = new Audio(assetsDir + "in-game_lugubre_v0.1.mp3");
        this.music.volume = 0.5
        this.music.loop = true;
        this.play_music();
    }
}

