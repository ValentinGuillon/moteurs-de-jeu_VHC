

export function getRandom(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


export function distance(x1, y1, x2, y2) {
    let X = x1 - x2;
    let Y = y1 - y2;
    return Math.sqrt((X*X) + (Y*Y));
}


export function direction(fromX, fromY, toX, toY) {
    const dist = distance(fromX, fromY, toX, toY);
    const dirX = (toX - fromX) / dist
    const dirY = (toY - fromY) / dist
    return {"x": dirX, "y": dirY};
}


export function normalize(x, y) {
    if (x == 0 && y == 0) { return {"x": 0, "y": 0}; }

    const hypothenuse = Math.sqrt((x*x) + (y*y));

    x /= hypothenuse;
    y /= hypothenuse;

    return {"x": x, "y": y};
}


export function convert(A, B, C) {
    //by ChatGPT
    // Convert each integer to a hexadecimal string and pad with zeros if needed
    const hexA = A.toString(16).padStart(2, '0');
    const hexB = B.toString(16).padStart(2, '0');
    const hexC = C.toString(16).padStart(2, '0');

    // Concatenate the hexadecimal strings
    const result = "#" + hexA + hexB + hexC;

    return result.toUpperCase(); // Convert to uppercase as your example result is in uppercase
}


export function is_in_rect(x, y, x1, y1, x2, y2) {
    let in_x = x > x1 && x <= x2;
    let in_y = y > y1 && y <= y2;
    return in_x && in_y;
}


export function rect_is_in_rect(rect1, rect2) {
    // check if a corner of rect1 is inside rect2
    const positions = [
        {"x": rect1.x1, "y": rect1.y1},
        {"x": rect1.x1, "y": rect1.y2},
        {"x": rect1.x2, "y": rect1.y1},
        {"x": rect1.x2, "y": rect1.y2},
    ]
    for (const pos of positions) {
        if (is_in_rect(pos.x, pos.y, rect2.x1, rect2.y1, rect2.x2, rect2.y2)) {
            return true;
        }
    }

    //check if rectangles overlaps
    let overlapX = rect1.x2 >= rect2.x1 && rect1.x1 < rect2.x2
    let overlapY = rect1.y2 >= rect2.y1 && rect1.y1 < rect2.y2
    let englobeX = rect1.x1 < rect2.x1 && rect1.x2 > rect2.x2
    let englobeY = rect1.y1 < rect2.y1 && rect1.y2 > rect2.y2
    let insideX = rect1.x1 > rect2.x1 && rect1.x2 < rect2.x2
    let insideY = rect1.y1 > rect2.y1 && rect1.y2 < rect2.y2
    if ((overlapX && overlapY) ||
        ((englobeX || insideX || overlapX) && (englobeY || insideY || overlapY))
    ) { return true; }
}



export function min(a, b) {
    if (a < b) { return a; }
    return b;
}

