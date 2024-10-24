const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");
const fs = require("fs").promises;

let model;

async function loadModel() {
  if (!model) {
    model = await nsfw.load(); // Load the model once and reuse it
  }
}

async function classifyImage(imagePath) {
  try {
    const pic = await fs.readFile(imagePath);

    const image = await tf.node.decodeImage(new Uint8Array(pic), 3);

    const resizedImage = tf.image.resizeBilinear(image, [224, 224]); // Example: resizing to 224x224

    const predictions = await model.classify(resizedImage);

    image.dispose();
    resizedImage.dispose();

    return predictions;
  } catch (error) {
    console.error("Error classifying image:", error);
  }
}

async function main() {
  await loadModel(); // Ensure the model is loaded
  const predictions = await classifyImage('./image1.png');
  console.log(predictions);
  console.log(isPornOrExplicit(predictions));
}

main();


function isPornOrExplicit(predictions) {
  let pornProbability = 0;
  let sexyProbability = 0;

  predictions.forEach(prediction => {
    if (prediction.className === 'Porn') {
      pornProbability = prediction.probability;
    }
    if (prediction.className === 'Sexy') {
      sexyProbability = prediction.probability;
    }
  });

  // Define thresholds
  const pornThreshold = 0.5;
  const explicitThreshold = 0.6;

  if (pornProbability > pornThreshold) {
    return "Porn";
  } else if ((pornProbability + sexyProbability) > explicitThreshold) {
    return "Explicit";
  } else {
    return "Not Explicit";
  }
}
