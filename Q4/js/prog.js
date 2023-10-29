

let cnv = document.getElementById("myCanvas");
let ctx = cnv.getContext("2d");


ctx.imageSmoothingEnabled = false;



function getRandom(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


class myImg {
    constructor(imgSrc, w = 25, h = 25) {
    this.defaultW = w;
    this.defaultH = h;
    this.w = w;
    this.h = h;
    this.imgSrc = imgSrc;

    this.x = (cnv.width / 2) - (this.w / 2);
    this.y = (cnv.height / 2) - (this.h / 2);

    this.img = new Image();
    this.img.src = this.imgSrc;
    }

    reset() {
        this.w = this.defaultW;
        this.h = this.defaultH;
        this.x = (cnv.width / 2) - (this.w / 2);
        this.y = (cnv.height / 2) - (this.h / 2);
        this.img.src = this.img;
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }
}



class myAnimatedImg extends myImg {
    constructor(sprites = [], w = 25, h = 25) {
        super(sprites[0], w, h);
        this.sprites = sprites;
        this.walk = true;
        this.speed = 10;
        this.ySpeed = 0;
    }

    move(cnv) {
        if (!this.walk) { return }

        //move to the right
        this.x += this.speed;
        //check out of screen
        if (this.x > (cnv.width - this.w)) {
            this.x = 0;
        }


        //change ySpeed (random)
        let val = getRandom(1, 2);
        let negative = getRandom(0, 1);
        if (negative) {
            this.ySpeed -= val;
        }
        else {
            this.ySpeed += val;
        }
        this.y += this.ySpeed
        //check out of screen
        if (this.y > cnv.height) {
            this.y = 0;
        }
        else if (this.y < 0) {
            this.y = cnv.height - this.h
        }
    }

    change_walk() {
        if (this.walk) { this.walk = false;}
        else { this.walk = true;}
    }

    next_frame() {
        // let size = this.sprites.length;
        let next = this.sprites.shift();
        // console.log(next);
        this.sprites.push(next);
        this.img.src = next;
        // console.log(this.sprites)
    }

    //comment faire hériter de myImg.reset() ???
    reset() {
        this.w = this.defaultW;
        this.h = this.defaultH;
        this.x = (cnv.width / 2) - (this.w / 2);
        this.y = (cnv.height / 2) - (this.h / 2);
        this.img.src = this.img;
        this.speed = 10;
        this.ySpeed = 0;
        this.walk = true;
    }
}




class flakeCircle {
    constructor(x = 0, speed = 1, size = 1) {
        this.x = x;
        this.y = 0;
        this.size = size;
        this.speed = speed;
        this.isDead = false;
    }

    check_has_to_die(cnv) {
        if (this.y > cnv.height) {
            this.isDead = true;
        }

        if (!snow.collision) { return; }

        let right_perso = imgAnimatedPerso.x;
        let left_perso = imgAnimatedPerso.x + imgAnimatedPerso.w;
        if (this.x < right_perso || this.x > left_perso) {
            return;
        }

        let up_perso = imgAnimatedPerso.y;
        let down_perso = imgAnimatedPerso.y + imgAnimatedPerso.h;

        if (this.y < up_perso || this.y > down_perso) {
            return;
        }

        this.isDead = true;

    }

    drop(cnv) {
        this.check_has_to_die(cnv);
        if (this.isDead) { return; }

        this.y += this.speed;
        this.check_has_to_die(cnv);
    }

    draw(ctx, cnv) {
        this.check_has_to_die(cnv);
        if (this.isDead) { return; }
        //circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();
        //rectangle
        // ctx.beginPath();
        // ctx.fillStyle = "#FFFFFF";
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        // ctx.closePath();

        this.check_has_to_die(cnv);
    }
}


class snowAnim {
    constructor(min = 1, max = 10) {
        this.minFlakesByWave = min;
        this.maxFlakesByWave = max;
        // this.next_drop = 10; //time
        this.drop = true;
        this.pause = false;
        this.flakes = []
        this.nb_flakes = 0
        this.collision = true;
    }


    clear_flakes() { this.flakes = []; }

    remove_dead_flakes() {
        //remove dead flakes
        let iDeadFlakes = []
        for (let i = 0; i < this.flakes.length; i++) {
            if (this.flakes[i].isDead) {
                iDeadFlakes.push(i);
            }
        }

        for (let i = iDeadFlakes.length - 1; i >= 0; i--) {
            this.flakes.splice(iDeadFlakes[i], 1);
        }

        this.nb_flakes = this.flakes.length;
    }

    add_flakes(cnv) {
        this.remove_dead_flakes();

        if (this.pause || !this.drop) { return; }
        //add new flakes
        let add = getRandom(this.minFlakesByWave, this.maxFlakesByWave);

        for (let i = 0; i < add; i++) {
            let x = getRandom(0, cnv.width);
            let speed = getRandom(1, 10);
            let size = getRandom(4, 10);
            let flake = new flakeCircle(x, speed, size);
            // flake.draw(ctx);
            this.flakes.push(flake);
        }

        this.remove_dead_flakes();

    }


    draw(ctx, cnv) {
        for (let i = 0; i < this.flakes.length; i++) {
            if (!this.pause) {
                this.flakes[i].drop(cnv);
            }
            this.flakes[i].draw(ctx, cnv);
        }
    }
}






let assetsDir = "assets/"
let ext = ".png";


let imgPaysageName = "paysage";
let spritePaysage = assetsDir + imgPaysageName + ext;


let snow = new snowAnim();
let imgPaysage = new myImg(spritePaysage, cnv.width, cnv.height);

let gui = new dat.gui.GUI();


let snowFolder = gui.addFolder("Snow");
// snowFolder.open()

snowFolder.add(snow, "minFlakesByWave", 1, 100, 1).onChange(val => {
    if (val > snow.maxFlakesByWave) {
        snow.maxFlakesByWave = val;
    }
})
snowFolder.add(snow, "maxFlakesByWave", 1, 100, 1).onChange(val => {
    if (val < snow.minFlakesByWave) {
        snow.minFlakesByWave = val;
    }
})
snowFolder.add(snow, "pause").name("Flakes freeze");
snowFolder.add(snow, "drop").name("Create new flakes");
snowFolder.add(snow, "collision");
snowFolder.add(snow, "clear_flakes");
snowFolder.add(snow, "nb_flakes");









let imgPersoName = "pp-a_pp_walking_";
let spritesPerso = [];
for (let i = 0; i < 8; i++) {
    spritesPerso.push(assetsDir + imgPersoName + (i+1) + ext);
}



let imgAnimatedPerso = new myAnimatedImg(spritesPerso, 100, 100)

let persoFolder = gui.addFolder("Perso");
// persoFolder.open()


persoFolder.add(imgAnimatedPerso, "x", 0, cnv.width - imgAnimatedPerso.w, 1);
persoFolder.add(imgAnimatedPerso, "y", 0, cnv.height - imgAnimatedPerso.h, 1);
persoFolder.add(imgAnimatedPerso, "w", 10, cnv.width, 1);
persoFolder.add(imgAnimatedPerso, "h", 10, cnv.height, 1);
persoFolder.add(imgAnimatedPerso, "speed", 1, 30, 1);
persoFolder.add(imgAnimatedPerso, "ySpeed", -30, 30, 1);
persoFolder.add(imgAnimatedPerso, "change_walk").name("Walk/Stop");
persoFolder.add(imgAnimatedPerso, "reset");




















function updateGui() {
    snowFolder.updateDisplay();
    persoFolder.updateDisplay();
}

function updates() {
    snow.add_flakes(cnv);
    imgAnimatedPerso.next_frame();
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    imgPaysage.draw(ctx);
    snow.draw(ctx, cnv);
    imgAnimatedPerso.draw(ctx);
}



function update() {
    imgAnimatedPerso.move(cnv);
    updates();
    draw();
    updateGui();
}

setInterval(update, 50);
