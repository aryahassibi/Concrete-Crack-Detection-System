let testImage;
let testImagePath = 'test images/wall 4.jpg';
// let testImagePath = 'Concrete Crack Images for Classification/Positive/00024.jpg';

let classifier;
let modelIsReady = false;

let imageSegments = {};
let imageSegmentsClassification = {};

const gridSize = 5; // n by n
const modelImageSize = 50;
const gridOffset = 10;
const canvasSize = gridSize * modelImageSize + (gridSize - 1) * gridOffset;

let loadingIcon;
const loadingIconGifPath = 'test images/loading.gif';
const loadingIconSize = 50;
const loadingIconPosition = (canvasSize - loadingIconSize) / 2

function modelReady() {
    console.log('Model is ready.');
    classifier.load('model.json', customModelReady);
}

function customModelReady() {
    console.log('Costum Model is ready.');
    modelIsReady = true;
    loadingIcon.remove();
    classifyImageSegments();
}

function classifyImageSegments() {
    let segmentIndex = 1;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            let segment = createGraphics(modelImageSize, modelImageSize)
            segment.background(0);
            segment.image(testImage, 0, 0, modelImageSize, modelImageSize, modelImageSize * i, modelImageSize * j, modelImageSize, modelImageSize)
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
    drawImageSegments();
}

function drawImageSegments() {
    let segmentIndex = 1;
    if (modelIsReady && Object.keys(imageSegmentsClassification).length == gridSize * gridSize && Object.keys(imageSegments).length == gridSize * gridSize) {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {

                image(imageSegments[segmentIndex], (modelImageSize + gridOffset) * i, (modelImageSize + gridOffset) * j);

                if (imageSegmentsClassification[segmentIndex] == 'Positive') {
                    fill('green');
                } else {
                    fill('red');
                }
                noStroke();
                circle((modelImageSize + gridOffset) * i + modelImageSize / 2, (modelImageSize + gridOffset) * j + modelImageSize / 2, 10);

                segmentIndex++;
            }
        }
    }
}

function preload() {
    loadingIcon = createImg(loadingIconGifPath, 'Loading Icon').size(loadingIconSize, loadingIconSize).position(loadingIconPosition, loadingIconPosition);
    testImage = loadImage(testImagePath, img => {
        img.resize(gridSize * modelImageSize, gridSize * modelImageSize);
        img.filter(GRAY);
    });
}

function setup() {
    createCanvas(canvasSize, canvasSize);
    mobilenet = ml5.featureExtractor('MobileNet', modelReady);
    classifier = mobilenet.classification();
}

function draw() {
    background(100);
    drawImageSegments();
}