

console.log("--- Draw ---");

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d');


let lastPoint = null;


canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log(x, " ", y);

    ctx.beginPath();
    if (lastPoint) {
        ctx.moveTo(lastPoint.x, lastPoint.y)
        ctx.lineTo(x, y)
        lastPoint = {x, y}
    } else {
        lastPoint = {x, y}
    }

    ctx.stroke()
})

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    lastPoint = null;
})