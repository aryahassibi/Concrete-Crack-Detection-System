let imgPath = 'test images/wall 4.jpg';
let img;
let imageAverageLevel;
let threshold;
let dots = []

function highlight(canvas, threshold) {
    for (let i = 0; i < canvas.pixels.length; i += 4) {
        if (canvas.pixels[i] < threshold) {
            // canvas.pixels[i] = 255;
            // canvas.pixels[i + 1] = 64;
            // canvas.pixels[i + 2] = 0;
            dots.push([i / 4 % canvas.width, i / 4 / canvas.width])
        }
        // if (i % (canvas.width * 4) == 0) {
        //     i += canvas.width * 4;
        // }
    }
    canvas.updatePixels();

}

function preload() {
    img = loadImage(imgPath, img => {
        img.resize(500, 500)
        img.filter(GRAY)
        img.loadPixels();
    });
}

function setup() {
    createCanvas(img.width, img.height);
    imageAverageLevel = (img.pixels.reduce((a, b) => a + b, 0) / img.pixels.length * 4 - 255) / 3;
    threshold = imageAverageLevel * 0.65;
    console.log(threshold)

    highlight(img, threshold)
    image(img, 0, 0)

    noStroke();
    fill(255, 0, 0, 20)

    for (let i = 0; i < dots.length; i += 1) {
        circle(dots[i][0], dots[i][1], 10)
    }
}