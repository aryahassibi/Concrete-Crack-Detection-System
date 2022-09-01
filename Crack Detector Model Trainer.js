let testImage;
let testImagePath = 'test images/wall 4.jpg';
// let testImagePath = 'Concrete Crack Images for Classification/Positive/00024.jpg';

let classifier;
let loadedImageCount = 0;
let modelIsReady = false;
const numberOfTrainingSetImages = 500;
const gridSize = 5; // n by n
const modelImageSize = 50;
const gridOffset = 10;
const canvasSize = gridSize * modelImageSize + (gridSize - 1) * gridOffset;

const loadingIconGifPath = 'test images/loading.gif';
const loadingIconSize = 50;
const loadingIconPosition = (canvasSize - loadingIconSize) / 2

// To preload all of the images and add them to an array for later usage
// e.g. the preloaded images can be used to traint or the test the model

// let imageArray = [];
// function preload() {
//     for (let imageIndex = 1; imageIndex <= numberOfTrainingSetImages; imageIndex++) {
//         let positiveImagePath = pathFor(imageIndex, true);
//         let negativeImagePath = pathFor(imageIndex, false);

//         let positiveImage = createImg(positiveImagePath, 'Positive').size(modelImageSize, modelImageSize);
//         let negativeImage = createImg(negativeImagePath, 'Negative').size(modelImageSize, modelImageSize);

//         imageArray.push([positiveImage, 'Positive']);
//         imageArray.push([negativeImage, 'Negative']);

//         negativeImage.remove();
//         positiveImage.remove();
//     }
//     console.log(imageArray);
// }

function pathFor(imageIndex, isPositive) {
    if (imageIndex < 1 || imageIndex > 20000) {
        console.error('Image Index ${imageIndex} is out of range (0 - 20000).');
        return null;
    } else {
        let imagePath = 'Concrete Crack Images for Classification/' + (isPositive ? 'Positive/' : 'Negative/') + String(imageIndex).padStart(5, "0") + '.jpg';
        return imagePath;
    }
}

function modelReady() {
    console.log('Model is ready to be trained.');
}

function modelSaved() {
    console.log('Model is saved. (in Downloads Directory)')
}

let indexOfTheCurrentImageSet = 1

function imageReady() {
    loadedImageCount += 1;
    if (loadedImageCount == numberOfTrainingSetImages * 2) {
        console.log('Data is Loaded.');
        classifier.train(whileTraining);
    }
}

function whileTraining(loss) {
    if (loss == null) {
        console.log('Model is trained with the data.');
        modelIsReady = true;
        classifier.save(modelSaved)
        classifyImageSegments();
    }
}

function addImagesToModel(numberOfImages, IndexOfTheImageSet) {
    if (IndexOfTheImageSet > 0 && IndexOfTheImageSet < Math.floor(20000 / numberOfImages)) {
        for (let imageIndex = IndexOfTheImageSet; imageIndex < 20000; imageIndex += Math.floor(20000 / numberOfImages)) {
            let positiveImagePath = pathFor(imageIndex, true);
            let negativeImagePath = pathFor(imageIndex, false);

            let positiveImage = createImg(positiveImagePath, 'Positive', '', () => { mobilenet.addImage(positiveImage.size(modelImageSize, modelImageSize), 'Positive', imageReady) });
            let negativeImage = createImg(negativeImagePath, 'Negative', '', () => { mobilenet.addImage(negativeImage.size(modelImageSize, modelImageSize), 'Negative', imageReady) });

            positiveImage.remove();
            negativeImage.remove();
        }
    } else {
        throw new Error('Index of the image set is out of range (' + IndexOfTheImageSet + ').\nThere a total of ' + (Math.floor(20000 / numberOfImages) - 1) + ' image-sets with the size of ' + numberOfImages + " images.");
    }
}

function classifyImageSegments() {
    let segmentIndex = 1
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
}

function preload() {
    loadingIcon = createImg(loadingIconGifPath, 'Loading Icon').size(loadingIconSize, loadingIconSize);
    testImage = loadImage(testImagePath, img => {
        img.resize(gridSize * modelImageSize, gridSize * modelImageSize);
        img.filter(GRAY);
    });
}

function setup() {
    createCanvas(canvasSize, canvasSize);
    mobilenet = ml5.featureExtractor('MobileNet', modelReady);
    classifier = mobilenet.classification();
    addImagesToModel(numberOfTrainingSetImages, indexOfTheCurrentImageSet)
}

let imageSegments = {};
let imageSegmentsClassification = {};

function draw() {
    background(100);
    if (!modelIsReady) {
        loadingIcon.position(loadingIconPosition, loadingIconPosition);
    } else {
        loadingIcon.remove();
    }
    let segmentIndex = 1
    if (Object.keys(imageSegmentsClassification).length == gridSize * gridSize && Object.keys(imageSegments).length == gridSize * gridSize) {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {

                image(imageSegments[segmentIndex], (modelImageSize + gridOffset) * i, (modelImageSize + gridOffset) * j);

                if (imageSegmentsClassification[segmentIndex] == 'Positive') {
                    fill('green');
                } else {
                    fill('red');
                };
                noStroke();
                circle((modelImageSize + gridOffset) * i + modelImageSize / 2, (modelImageSize + gridOffset) * j + modelImageSize / 2, 10);

                segmentIndex++;
            }
        }
    }
    // fill(0);
    // textSize(64);
    // text(label, 10, height - 100);
}