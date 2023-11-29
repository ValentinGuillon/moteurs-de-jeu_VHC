
let assetsDir = "assets/"

export class Jukebox {
    constructor() {
        this.music = undefined;
    }

    play() {
        if (!this.music) { return; }
        this.music.play();
    }
    
    stop() {
        if (!this.music) { return; };
        this.music.pause();
    }


    play_main_menu() {
        this.stop();
        this.music = new Audio(assetsDir + "main-menu_v1.mp3");
        this.music.volume = 0.5
        this.music.loop = true;
        this.play();
    }

    play_game() {
        this.stop();
        this.music = new Audio(assetsDir + "in-game_lugubre_v0.1.mp3");
        this.music.volume = 0.5
        this.music.loop = true;
        this.play();
    }
}

