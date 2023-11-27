

export function getRandom(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


export function distance(x1, y1, x2, y2) {
    let X = x1 - x2;
    let Y = y1 - y2;
    return Math.sqrt((X*X) + (Y*Y));
}


export function draw_rect(ctx, x, y, width, height, color) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = color
    ctx.fill();
    ctx.closePath();
}


export function draw_point(ctx, x, y, color) {
    draw_rect(ctx, x, y, 1, 1, color);
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


