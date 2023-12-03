

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



export function min(a, b) {
    if (a < b) { return a; }
    return b;
}

