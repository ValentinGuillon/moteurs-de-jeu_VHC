
import { CNV } from "./script.js";


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


export function is_out_of_screen(x, y) {
    return !is_in_rect(x, y, 0, 0, CNV.width, CNV.height);
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


export function circle_is_in_rect(circle, rect) {
    // Function to check if a point (x, y) is inside the rectangle
    function isPointInRect(x, y, rect) {
        return x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2;
    }

    // Function to calculate the closest point on the rectangle to the circle
    function closestPointInRect(circle, rect) {
        let closestX = Math.max(rect.x1, Math.min(circle.x, rect.x2));
        let closestY = Math.max(rect.y1, Math.min(circle.y, rect.y2));
        return { x: closestX, y: closestY };
    }

    // Check if the center of the circle is inside the rectangle
    if (isPointInRect(circle.x, circle.y, rect)) {
        return true;
    }

    // Calculate the closest point on the rectangle to the circle
    const closestPoint = closestPointInRect(circle, rect);

    // Check if the closest point is inside the circle
    const distance = Math.sqrt((circle.x - closestPoint.x) ** 2 + (circle.y - closestPoint.y) ** 2);
    return distance < circle.radius;
}


export function min(a, b) {
    if (a < b) { return a; }
    return b;
}

