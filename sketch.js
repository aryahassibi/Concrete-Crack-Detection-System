let img;
let val;
function preload() {
    img = loadImage('wall 2.png');
}

function setup() {
    createCanvas(img.width, img.height);
    slider = createSlider(0, 255, 100);
    slider.position(10, img.height + 50);
    slider.style('width', String(img.width) + 'px');
    val = 256

}
function draw() {
    //background(220);

    // image(img, 0, 0);
    if (slider.value() != val) {
        console.log(slider.value())
        val = slider.value()
        for (let i = 0; i < img.width; i++) {
            for (let j = 0; j < img.height; j++) {
                let pix = img.get(i, j);
                let c = rgb_to_bw(pix[0], pix[1], pix[2], slider.value())
                set(i, j, c)
            }
        }

        updatePixels();
    }
}

function rgb_to_bw(r, g, b, threshold) {
    let avg = (r + b + g) / 3
    if (avg < threshold) {
        return color(255, 100, 100)
    } else {
        return color(r, g, b, 75)
    }
}