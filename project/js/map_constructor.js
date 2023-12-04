
import { FOREST } from "./map.js"
import { CNV, CTX, ASSETS_DIR, PNG_EXT } from "./script.js"
import { My_Img, My_Img_Animated } from "./imgs.js";
import { HitBox_Circle, HitBox_Mask } from "./hitBox.js";
import { Bonus_Invicibility, My_Object, Obstacle, create_object } from "./objects.js";
import { getRandom } from "./tools.js";



function roadTileName(col, row) {
    const roadTile = {
        1: "road_down", 2: "road_up", 3: "road_right", 4: "road_left",
        5: "road_down-up", 6: "road_right-left",
        7: "road_down-right", 8: "road_down-left", 9: "road_up-right", 10: "road_up-left",
        11: "road_down-up-right-left"
    }


    let adjacents = []; //0, 1, 2, 3 respectively: up, left, right, down
    col -= 1;
    row -= 1;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            //ignore corner (diagonal from center)
            if((i == 0 || i == 2) && (j == 0 || j == 2)) { continue; }
            //ignore center
            if(i == 1 && j == 1) { continue; }

            //row index out of range
            if (FOREST[row+i] == undefined) {
                adjacents.push(0);
            }
            //column index out of range
            else if (FOREST[row+i][col+j] == undefined) {
                adjacents.push(0);
            }

            else {
                adjacents.push(FOREST[row+i][col+j])
            }

        }
    }
    
    //if adjacents are a road tile (1=road, 2=road+bonus)
    const up = adjacents[0] == 1 || adjacents[0] == 2;
    const down = adjacents[3] == 1 || adjacents[3] == 2;
    const left = adjacents[1] == 1 || adjacents[1] == 2;
    const right = adjacents[2] == 1 || adjacents[2] == 2;

    //check pattern to return the corresponding filename
    if (up && down && left && right) {
        return roadTile[11];
    }
    if(up && down && !left && !right) {
        return roadTile[5]
    }
    if (!up && !down && left && right) {
        return roadTile[6];
    }
    if (up && !down && left && !right) {
        return roadTile[10];
    }
    if (up && !down && !left && right) {
        return roadTile[9];
    }
    if (!up && down && left && !right) {
        return roadTile[8];
    }
    if (!up && down && !left && right) {
        return roadTile[7];
    }
    if(up && down) {
        return roadTile[5];
    }
    if(left && right) {
        return roadTile[6];
    }
    if(up) {
        return roadTile[2];
    }
    if(down) {
        return roadTile[1];
    }
    if(right) {
        return roadTile[3];
    }
    if(left) {
        return roadTile[4];
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
            const x = mapSize.x + (tileSize.width * j) - j;
            const y = mapSize.y + (tileSize.height * i) - i;
            let name = "";

            let img = undefined;

            //ground ONLY
            if (tile == -1 || tile == 0) {
                name = ASSETS_DIR + "forest_ground" + PNG_EXT
                img = new My_Img(name, x, y, tileSize.width, tileSize.height, undefined, true);
                My_Img.add_instance(img);
                continue;
            }
            //road
            if (tile == 1 || tile == 2) {
                name = ASSETS_DIR + "forest_" + roadTileName(j, i) + PNG_EXT;
                img = new My_Img(name, x, y, tileSize.width, tileSize.height, undefined, true);
                My_Img.add_instance(img);
            }

            //tree
            if (tile == 0) {
                if (getRandom(0, 4)) { continue; }
                create_object("tree", {"x": x, "y": y, "width": tileSize.width, "height": tileSize.height});
                continue;
            }
            //bonus
            else if (tile == 2) {
                create_object("bonus", {"x": x, "y": y, "width": 50, "height": 50});
                
            }
            //border
            else if (tile == 9) {
                name = ASSETS_DIR + "forest_ground" + PNG_EXT;
                img = new My_Img(name, x, y, tileSize.width, tileSize.height, undefined, true);
                My_Img.add_instance(img);
                create_object("border", {"x": x, "y": y, "width": tileSize.width, "height": tileSize.height});
            }
        }
    }
}




