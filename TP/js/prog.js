
let cnv = document.getElementById("myCanvas");
let ctx = cnv.getContext("2d");

ctx.imageSmoothingEnabled = false;

let gui = new dat.gui.GUI();

let assetsDir = "assets/"
let pngExt = ".png";


class myImg {
    constructor(imgSrc, w = 25, h = 25) {
        this.imgSrc = imgSrc;

        //size
        // this.defaultW = w; //used for dat.GUI
        // this.defaultH = h; //used for dat.GUI
        this.w = w;
        this.h = h;

        //position (relative to cnv)
        this.x = (cnv.width / 2) - (this.w / 2);
        this.y = (cnv.height / 2) - (this.h / 2);

        //predefined Image class
        this.img = new Image();
        this.img.src = this.imgSrc;

        //test
        this.visible = true;
    }


    draw(ctx) {
        if (this.visible) {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }


    // reset() {
    //     this.w = this.defaultW;
    //     this.h = this.defaultH;
    //     this.x = (cnv.width / 2) - (this.w / 2);
    //     this.y = (cnv.height / 2) - (this.h / 2);
    //     this.img.src = this.img;
    // }
}


//animated sprite with a SINGLE animation
class myAnimatedImg extends myImg {
    constructor(sprites = [], w = 25, h = 25) {
        super(sprites[0], w, h);
        this.sprites = sprites;

        this.animated = true;

        // this.xSpeed = 10;
        // this.ySpeed = 0;
    }


    next_frame() {
        if (!this.animated) {
            this.img.src = this.imgSrc;
        }
        else {
            let next = this.sprites.shift(); //remove the first list's element
            this.sprites.push(next);         //push it at the end
            this.img.src = next;             //update current Img source
        }
    }


    // //comment faire hériter de myImg.reset() ???
    // reset() {
    //     this.img.src = this.img;
    //     this.w = this.defaultW; //defaultW comes from myImg class
    //     this.h = this.defaultH; //defaultH comes from myImg class
    //     this.x = (cnv.width / 2) - (this.w / 2);
    //     this.y = (cnv.height / 2) - (this.h / 2);
    //     this.xSpeed = 10;
    //     this.ySpeed = 0;
    //     this.walk = true;
    // }
}












//PAYSAGE (IMAGE FIXE)
// image
let imgPaysageName = "paysage";
let spritePaysage = assetsDir + imgPaysageName + pngExt;
let imgPaysage = new myImg(spritePaysage, cnv.width, cnv.height);

// dat.GUI Folder
let paysageFolder = gui.addFolder("Paysage");
// paysageFolder.open()

paysageFolder.add(imgPaysage, "visible")




//ANIMATED CHARACTER (ANIMATED IMAGE FIX)
// image
let imgPersoName = "pp-a_pp_walking_";
let spritesPerso = [];
for (let i = 0; i < 8; i++) {
    spritesPerso.push(assetsDir + imgPersoName + (i+1) + pngExt);
}
let imgAnimatedPerso = new myAnimatedImg(spritesPerso, 100, 100)

// dat.GUI folder
let persoFolder = gui.addFolder("Perso");
persoFolder.open()

persoFolder.add(imgAnimatedPerso, "x", 0, cnv.width - imgAnimatedPerso.w, 1);
persoFolder.add(imgAnimatedPerso, "y", 0, cnv.height - imgAnimatedPerso.h, 1);
persoFolder.add(imgAnimatedPerso, "w", 10, cnv.width, 1);
persoFolder.add(imgAnimatedPerso, "h", 10, cnv.height, 1);
persoFolder.add(imgAnimatedPerso, "animated");
persoFolder.add(imgAnimatedPerso, "visible");
// persoFolder.add(imgAnimatedPerso, "reset");



















function updateGui() {
    paysageFolder.updateDisplay();
    persoFolder.updateDisplay();
}

function animations() {
    imgAnimatedPerso.next_frame();
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    imgPaysage.draw(ctx);
    imgAnimatedPerso.draw(ctx);
}



function update() {
    animations();
    draw();
    updateGui();
}

setInterval(update, 50);
