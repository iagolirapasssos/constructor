function animateObject(obj) {
    if (!obj.animation) return;

    if (obj.animation.type === "bounce") {
        obj.animation.offset += 5;
        if (obj.animation.offset > 50 || obj.animation.offset < -50) {
            obj.animation.offset *= -1;
        }
        obj.y += obj.animation.offset;
    } else if (obj.animation.type === "rotate") {
        obj.animation.angle += 5;
        if (obj.animation.angle >= 360) {
            obj.animation.angle = 0;
        }
        obj.shape.set({ angle: obj.animation.angle });
    }
    drawObjects();
    requestAnimationFrame(() => animateObject(obj));
}
