let testImage;
// let testImagePath = 'images/crack.jpg';
// let testImagePath = 'Concrete Crack Images for Classification/Positive/00024.jpg';

let classifier;
let modelIsReady = false;

let imageSegments = {};
let imageSegmentsClassification = {};

const gridSize = 10; // n by n
const modelImageSize = 50;
const imageDiplaySize = 300;
const segmentDiplaySize = imageDiplaySize / gridSize;
const gridOffset = 0;
const canvasSize = imageDiplaySize + (gridSize - 1) * gridOffset;
const testImageSize = modelImageSize * gridSize;

let loadingIcon;
const loadingIconGifPath = 'images/loading.gif';
const loadingIconSize = 30;
const loadingIconWidth = () => { windowWidth / 2 }
const loadingIconHeight = () => { windowHeight / 2 }

let refreshButtonIcon;
const refreshIconPath = 'images/refreshIcon.png';
const refreshButtonSize = 30;

let imageAverageLevel;
let threshold;

const panelBorder = 10;
const panelWidth = canvasSize + panelBorder * 2;
const panelHeight = (canvasSize + panelBorder) * 2;

function highlight(canvas, threshold) {
    for (let i = 0; i < canvas.pixels.length; i += 4) {
        if ((canvas.pixels[i] + canvas.pixels[i + 1] + canvas.pixels[i + 2]) / 3 < threshold) {
            canvas.pixels[i] = 255;
            canvas.pixels[i + 1] = 120;
            canvas.pixels[i + 2] = 70;
            canvas.fill(255, 2, 2)
            canvas.circle(5, 5, 5)
            //dots.push([i / 4 % canvas.width, i / 4 / canvas.width])
        }
        // if (i % (canvas.width * 4) == 0) {
        //     i += canvas.width * 4;
        // }
    }
    canvas.updatePixels();

}

function modelReady() {
    console.log('Model is ready.');
    classifier.load('model.json', customModelReady);
}

function customModelReady() {
    console.log('Costum Model is ready.');
    modelIsReady = true;
    loadingIcon.hide();
    // classifyImageSegments();
}

function classifyImageSegments() {
    imageSegments = {}
    imageSegmentsClassification = {}
    let segmentIndex = 1;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            let segment = createGraphics(modelImageSize, modelImageSize)
            segment.background(0);
            segment.image(testImage, 0, 0, modelImageSize, modelImageSize, modelImageSize * i, modelImageSize * j, modelImageSize, modelImageSize)
            segment.loadPixels();
            classifier.classify(segment, (error, result) => {
                if (error) {
                    console.log(error);
                } else {
                    imageSegments[segmentIndex] = segment;
                    imageSegmentsClassification[segmentIndex] = result[0].label;
                    segmentIndex++;
                }
            });
        }
    }
}

let finishedDrawing = false

function drawImageSegments() {
    let canvas = createGraphics(canvasSize, canvasSize);
    let segmentIndex = 1;
    if (modelIsReady && Object.keys(imageSegmentsClassification).length == gridSize * gridSize && Object.keys(imageSegments).length == gridSize * gridSize) {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (imageSegmentsClassification[segmentIndex] == 'Positive') {
                    highlight(imageSegments[segmentIndex], threshold)
                }
                canvas.image(imageSegments[segmentIndex], (segmentDiplaySize + gridOffset) * i, (segmentDiplaySize + gridOffset) * j, segmentDiplaySize, segmentDiplaySize);

                if (imageSegmentsClassification[segmentIndex] == 'Positive') {
                    canvas.fill(255, 64, 0, 50);
                    canvas.noStroke();
                    // rect((segmentDiplaySize + gridOffset) * (i - 1) + segmentDiplaySize, (segmentDiplaySize + gridOffset) * (j - 1) + segmentDiplaySize, (segmentDiplaySize + gridOffset) * i + segmentDiplaySize, (segmentDiplaySize + gridOffset) * j + segmentDiplaySize)
                    canvas.circle((segmentDiplaySize + gridOffset) * i + segmentDiplaySize / 2, (segmentDiplaySize + gridOffset) * j + segmentDiplaySize / 2, segmentDiplaySize)
                    // circle((segmentDiplaySize + gridOffset) * i + segmentDiplaySize / 2, (segmentDiplaySize + gridOffset) * j + segmentDiplaySize / 2, 10);
                }
                segmentIndex++;
            }
        }
    }
    if (segmentIndex == gridSize * gridSize + 1) {
        finishedDrawing = true
        loadingIcon.hide();
    }
    return canvas
}

function preload() {
    loadingIcon = createImg(loadingIconGifPath, 'Loading Icon').size(loadingIconSize, loadingIconSize).hide();
    refreshButtonIcon = loadImage(refreshIconPath)
    // testImage = loadImage(testImagePath, img => {
    //     img.resize(testImageSize, testImageSize);
    //     img.filter(GRAY);
    //     img.loadPixels();
    // });
}
let picture;
let cameraButon;
function setup() {
    createCanvas(windowWidth, windowHeight);
    loadingIcon.position((width - loadingIconSize) / 2, (height - loadingIconSize) * 50).show();
    picture = createGraphics(canvasSize, canvasSize);
    panel = createGraphics(panelWidth, panelHeight);
    background(30);


    var constraints = {
        audio: false,
        video: {
            facingMode: {
                exact: "environment"
            }
        }
        // video: {
        //     facingMode: "user"
        // }
    };

    capture = createCapture(constraints);
    snapButton = createButton('snap');
    snapButton.mousePressed(takeSnap);
    refreshButton = createButton('refresh');
    refreshButton.mousePressed(() => { snapped = false })
    capture.hide();

    mobilenet = ml5.featureExtractor('MobileNet', modelReady);
    classifier = mobilenet.classification();
    cameraButton = circleButton();
    // cameraButon.mousePressed(takeSnap);
}

function circleButton(color = 255) {
    const buttonSize = 60
    button = createGraphics(buttonSize, buttonSize);
    button.mousePressed(takeSnap)

    button.fill(color);
    button.noStroke();
    button.circle(buttonSize / 2, buttonSize / 2, buttonSize * 0.8);

    button.noFill()
    button.stroke(color);
    button.strokeWeight(buttonSize * 0.05);
    button.circle(buttonSize / 2, buttonSize / 2, buttonSize * 0.9);

    return button;
}

let snapped = false
function takeSnap() {
    loadingIcon.show();
    finishedDrawing = false
    snapped = true

    testImage = capture.get((capture.width - capture.height) / 2, 0, capture.height, capture.height,)
    testImage.resize(testImageSize, testImageSize);
    testImage.filter(GRAY);
    testImage.loadPixels();
    imageAverageLevel = (testImage.pixels.reduce((a, b) => a + b, 0) / testImage.pixels.length * 4 - 255) / 3;
    threshold = imageAverageLevel * 0.65;

    classifyImageSegments();
}


function draw() {
    panel.imageMode(CENTER)
    panel.background(0)
    panel.image(picture, panel.width / 2, panel.height * 0.35)
    panel.image(cameraButton, panel.width / 2, panel.height * 0.85)
    panel.image(refreshButtonIcon, (panelWidth) * 0.8, panel.height * 0.85, refreshButtonSize, refreshButtonSize)

    if (height / width < panelHeight / panelWidth) {
        background(30);
        image(panel, (width - panelWidth * (height / panelHeight)) / 2, 0, panelWidth * (height / panelHeight), height)
    } else {
        background(0);
        image(panel, 0, (height - panelHeight * (width / panelWidth)) / 2, width, panelHeight * (width / panelWidth))
    }
    if (!finishedDrawing) {
        picture.image(drawImageSegments(), 0, 0);
    }
    if (!snapped) {
        picture.image(capture.get((capture.width - capture.height) / 2, 0, capture.height, capture.height), 0, 0, canvasSize, canvasSize);
    }

    fill(255, 0, 0, 50)


    // rect((width - cameraButton.width * (height / panelHeight)) / 2,
    //     (panel.height * 0.85 - cameraButton.height / 2) * (height / panelHeight),
    //     cameraButton.height * (height / panelHeight),
    //     cameraButton.height * (height / panelHeight)
    // )

    // rect((width - cameraButton.width * (width / panelWidth)) / 2,
    //     (panel.height * 0.85 - cameraButton.height / 2) * (width / panelWidth) + (height - panel.height * (width / panelWidth)) / 2,
    //     cameraButton.height * (width / panelWidth),
    //     cameraButton.height * (width / panelWidth)
    // )

    // rect((width - panelWidth * (height / panelHeight)) / 2 + ((panelWidth) * 0.8 - refreshButtonSize / 2) * (height / panelHeight),
    //     (panel.height * 0.85 - refreshButtonSize / 2) * (height / panelHeight),
    //     refreshButtonSize * (height / panelHeight),
    //     refreshButtonSize * (height / panelHeight)
    // )

    // rect(((panelWidth) * 0.8 - refreshButtonSize / 2) * (width / panelWidth),
    //     (height - panelHeight * (width / panelWidth)) / 2 + (panel.height * 0.85 - refreshButtonSize / 2) * (width / panelWidth),
    //     refreshButtonSize * (width / panelWidth),
    //     refreshButtonSize * (width / panelWidth)
    // )


}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    loadingIcon.position((width - loadingIconSize) / 2, (height - loadingIconSize) / 2);
}


function mousePressed() {
    if (height / width < panelHeight / panelWidth) {
        if (mouseX > (width - cameraButton.width * (height / panelHeight)) / 2 &&
            mouseX < (width + cameraButton.width * (height / panelHeight)) / 2 &&
            mouseY > (panel.height * 0.85 - cameraButton.height / 2) * (height / panelHeight) &&
            mouseY < (panel.height * 0.85 + cameraButton.height / 2) * (height / panelHeight)) {
            cameraButton = circleButton(150);
            takeSnap();
        }
    } else {
        if (mouseX > (width - cameraButton.width * (width / panelWidth)) / 2 &&
            mouseX < (width + cameraButton.width * (width / panelWidth)) / 2 &&
            mouseY > (panel.height * 0.85 - cameraButton.height / 2) * (width / panelWidth) + (height - panel.height * (width / panelWidth)) / 2 &&
            mouseY < (panel.height * 0.85 + cameraButton.height / 2) * (width / panelWidth) + (height - panel.height * (width / panelWidth)) / 2) {
            cameraButton = circleButton(150);
            takeSnap();
        }
    }

    if (height / width < panelHeight / panelWidth) {
        if (mouseX > (width - panelWidth * (height / panelHeight)) / 2 + ((panelWidth) * 0.8 - refreshButtonSize / 2) * (height / panelHeight) &&
            mouseX < (width - panelWidth * (height / panelHeight)) / 2 + ((panelWidth) * 0.8 + refreshButtonSize / 2) * (height / panelHeight) &&
            mouseY > (panel.height * 0.85 - refreshButtonSize / 2) * (height / panelHeight) &&
            mouseY < (panel.height * 0.85 + refreshButtonSize / 2) * (height / panelHeight)) {
            snapped = false
        }
    } else {
        if (mouseX > ((panelWidth) * 0.8 - refreshButtonSize / 2) * (width / panelWidth) &&
            mouseX < ((panelWidth) * 0.8 + refreshButtonSize / 2) * (width / panelWidth) &&
            mouseY > (height - panelHeight * (width / panelWidth)) / 2 + (panel.height * 0.85 - refreshButtonSize / 2) * (width / panelWidth) &&
            mouseY < (height - panelHeight * (width / panelWidth)) / 2 + (panel.height * 0.85 + refreshButtonSize / 2) * (width / panelWidth)) {
            snapped = false
        }
    }
}

function mouseReleased() {
    cameraButton = circleButton();
}