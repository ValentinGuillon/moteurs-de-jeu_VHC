
import { FOREST } from "./map.js"
import { CNV, CTX, ASSETS_DIR, PNG_EXT } from "./script.js"
import { My_Img, My_Img_Animated } from "./imgs.js";
import { HitBox_Circle, HitBox_Mask } from "./hitBox.js";
import { Bonus_Invicibility, My_Object, Obstacle } from "./objects.js";
import { getRandom } from "./tools.js";



function roadTileName(col, row) {
    const roadTile = {
        1: "down", 2: "up", 3: "right", 4: "left",
        5: "down-up", 6: "right-left",
        7: "down-right", 8: "down-left", 9: "up-right", 10: "up-left",
        11: "down-up-right-left"
    }


    let square_3x3 = [];
    col -= 1;
    row -= 1;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if((i == 0 || i == 2) && (j == 0 || j == 2)) { continue; }
            if(i == 1 && j == 1) { continue; }
            if (FOREST[row+i] == undefined) {
                square_3x3.push(0);
            }
            else if (FOREST[row+i][col+j] == undefined) {
                square_3x3.push(0);
            }
            else {
                square_3x3.push(FOREST[row+i][col+j])
            }
        }
    }
    
    const up = square_3x3[0] == 1 || square_3x3[0] == 2;
    const down = square_3x3[3] == 1 || square_3x3[3] == 2;
    const left = square_3x3[1] == 1 || square_3x3[1] == 2;
    const right = square_3x3[2] == 1 || square_3x3[2] == 2;

    if (up && down && left && right) {
        return "road_" + roadTile[11];
    }
    if(up && down && !left && !right) {
        return "road_" + roadTile[5]
    }
    if (!up && !down && left && right) {
        return "road_" + roadTile[6];
    }
    if (up && !down && left && !right) {
        return "road_" + roadTile[10];
    }
    if (up && !down && !left && right) {
        return "road_" + roadTile[9];
    }
    if (!up && down && left && !right) {
        return "road_" + roadTile[8];
    }
    if (!up && down && !left && right) {
        return "road_" + roadTile[7];
    }
    if(up && down) {
        return "road_" + roadTile[5];
    }
    if(left && right) {
        return "road_" + roadTile[6];
    }
    if(up) {
        return "road_" + roadTile[2];
    }
    if(down) {
        return "road_" + roadTile[1];
    }
    if(right) {
        return "road_" + roadTile[3];
    }
    if(left) {
        return "road_" + roadTile[4];
    }
    return "tree_thin"

}



export function construct_map() {
    const tileSize = {"width": 100, "height": Math.floor(100*0.8)};
    const cnvMid = {"x": CNV.width/2, "y": CNV.height/2};
    const rows = FOREST.length;
    const cols = FOREST[0].length;
    let mapSize = {"x": cnvMid.x, "y": cnvMid.y, "width": tileSize.width * cols, "height": tileSize.height * rows}
    mapSize.x -= mapSize.width/2 - tileSize.width
    mapSize.y -= mapSize.height/2 - tileSize.height

    //create corresponding tile(s)
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const tile = FOREST[i][j];
            // const x = Math.floor(tileSize.width*j - 1*j - mapSize.width/2 - tileSize.width/2 + cnvMid.x);
            // const y = Math.floor(tileSize.height*i - 1*i - mapSize.height/2 - tileSize.height/2 + cnvMid.y);
            const x = mapSize.x + (tileSize.width * j) - j
            const y = mapSize.y + (tileSize.height * i) - i
            let name = ASSETS_DIR + "forest_ground" + PNG_EXT

            let img = undefined;

            //ground
            if (tile == -1 || tile == 0) {
                img = new My_Img(name, x, y, tileSize.width, tileSize.height, undefined, true);
                My_Img.add_instance(img);
                continue;
            }

            //road
            else if (tile == 1 || tile == 2) {
                name = ASSETS_DIR + "forest_" + roadTileName(j, i) + PNG_EXT;
                img = new My_Img(name, x, y, tileSize.width, tileSize.height, undefined, true);
                My_Img.add_instance(img);
            }

            //tree
            if (tile == 0) {
                if (getRandom(0, 4)) { continue; }
                create_tree(x, y, tileSize.width, tileSize.height);
                continue;
            }
            //bonus
            if (tile == 2) {
                create_bonus(x, y);
                // name = ASSETS_DIR + "forest_" + roadTileName(j, i) + PNG_EXT
                // img = new My_Img(name, x, y, tileSize, tileSize, undefined, true);
                // My_Img.add_instance(img);
            }

            //border
            if (tile == 9) {
                name = ASSETS_DIR + "forest_ground" + PNG_EXT;
                img = new My_Img(name, x, y, tileSize.width, tileSize.height, undefined, true);
                My_Img.add_instance(img);
                create_border(x, y, tileSize.width, tileSize.height)
            }

        }
    }


}




function create_bonus(x, y) {
    let imgName = "stars_";
    let nb = [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 2, 2];
    let spritesDefault = [];
    for (let i = 0; i < nb.length; i++) {
        spritesDefault.push(ASSETS_DIR + imgName + nb[i] + PNG_EXT);
    }

    let imgObj = new My_Img_Animated(spritesDefault, x, y, 50, 50, 3, [], spritesDefault[0]);
    // let hitBoxObj = new HitBox_Circle(X, Y, 20)
    let hitBoxObj = new HitBox_Mask(x, y, ASSETS_DIR+imgName+"mask_v2"+PNG_EXT, 50, 50)
    new Bonus_Invicibility(x, y, imgObj, hitBoxObj)
}


function create_tree(x, y, width, height) {
    // console.log("tree")
    // return;
    let imgName = "forest_";
    if (getRandom(0, 1)) {
        imgName += "tree_large"
    }
    else {
        imgName += "tree_thin"
    }

    let imgObj = new My_Img(ASSETS_DIR+imgName+PNG_EXT, x, y, width, height)
    let hitBox = new HitBox_Circle(x, y, (width+height)/4)
    new Obstacle(x, y, imgObj, hitBox)
}


function create_border(x, y, width, height) {
    // console.log("tree")
    // return;
    let imgName = "forest_";
    if (1) {
        imgName += "tree_large"
    }
    else {
        imgName += "tree_thin"
    }

    let imgObj = new My_Img(ASSETS_DIR+imgName+PNG_EXT, x, y, width, height)
    let hitBox = new HitBox_Circle(x, y, (width+height)/4)
    new Obstacle(x, y, imgObj, hitBox)
}
