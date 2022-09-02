let testImage;
let testImagePath = 'test images/wall 5.jpg';
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
const loadingIconGifPath = 'test images/loading.gif';
const loadingIconSize = 50;
const loadingIconPosition = (canvasSize - loadingIconSize) / 2

let imageAverageLevel;
let threshold;
let dots = []

function highlight(canvas, threshold) {
    for (let i = 0; i < canvas.pixels.length; i += 4) {
        if ((canvas.pixels[i] + canvas.pixels[i + 1] + canvas.pixels[i + 2]) / 3 < threshold) {
            canvas.pixels[i] = 255;
            canvas.pixels[i + 1] = 120;
            canvas.pixels[i + 2] = 70;
            fill(255, 2, 2)
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

    classifyImageSegments();
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
    loadingIcon.remove();
    drawImageSegments();
}

let finishedDrawing = false

function drawImageSegments() {
    let segmentIndex = 1;
    if (modelIsReady && Object.keys(imageSegmentsClassification).length == gridSize * gridSize && Object.keys(imageSegments).length == gridSize * gridSize) {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (imageSegmentsClassification[segmentIndex] == 'Positive') {
                    highlight(imageSegments[segmentIndex], threshold)
                }
                image(imageSegments[segmentIndex], (segmentDiplaySize + gridOffset) * i, (segmentDiplaySize + gridOffset) * j, segmentDiplaySize, segmentDiplaySize);

                if (imageSegmentsClassification[segmentIndex] == 'Positive') {
                    fill(255, 64, 0, 50);
                    noStroke();
                    // rect((segmentDiplaySize + gridOffset) * (i - 1) + segmentDiplaySize, (segmentDiplaySize + gridOffset) * (j - 1) + segmentDiplaySize, (segmentDiplaySize + gridOffset) * i + segmentDiplaySize, (segmentDiplaySize + gridOffset) * j + segmentDiplaySize)
                    circle((segmentDiplaySize + gridOffset) * i + segmentDiplaySize / 2, (segmentDiplaySize + gridOffset) * j + segmentDiplaySize / 2, segmentDiplaySize)
                    // circle((segmentDiplaySize + gridOffset) * i + segmentDiplaySize / 2, (segmentDiplaySize + gridOffset) * j + segmentDiplaySize / 2, 10);
                }
                segmentIndex++;
            }
        }
    }
    if (segmentIndex == gridSize * gridSize + 1) {
        finishedDrawing = true
    }
}

function preload() {
    loadingIcon = createImg(loadingIconGifPath, 'Loading Icon').size(loadingIconSize, loadingIconSize).position(loadingIconPosition, loadingIconPosition);
    testImage = loadImage(testImagePath, img => {
        img.resize(testImageSize, testImageSize);
        img.filter(GRAY);
        img.loadPixels();
    });
}

function setup() {
    createCanvas(canvasSize, canvasSize);
    background(200);
    imageAverageLevel = (testImage.pixels.reduce((a, b) => a + b, 0) / testImage.pixels.length * 4 - 255) / 3;
    threshold = imageAverageLevel * 0.65;

    var constraints = {
        audio: false,
        // video: {
        //     facingMode: {
        //         exact: "environment"
        //     }
        // }
        video: {
            facingMode: "user"
        }
    };

    capture = createCapture(constraints);
    snapButton = createButton('snap');
    snapButton.mousePressed(takesnap);
    refreshButton = createButton('refresh');
    refreshButton.mousePressed(() => { snapped = false })
    capture.hide();

    mobilenet = ml5.featureExtractor('MobileNet', modelReady);
    classifier = mobilenet.classification();
}

let snapped = false
function takesnap() {
    loadingIcon = createImg(loadingIconGifPath, 'Loading Icon').size(loadingIconSize, loadingIconSize).position(loadingIconPosition, loadingIconPosition);
    finishedDrawing = false
    snapped = true

    testImage = capture.get((capture.width - capture.height) / 2, 0, capture.height, capture.height)
    testImage.resize(testImageSize, testImageSize);
    testImage.filter(GRAY);
    testImage.loadPixels();

    classifyImageSegments()
}

function draw() {
    if (!finishedDrawing) {
        drawImageSegments();
    }
    if (!snapped) {
        image(capture.get((capture.width - capture.height) / 2, 0, capture.height, capture.height), 0, 0, canvasSize, canvasSize);
    }

}
