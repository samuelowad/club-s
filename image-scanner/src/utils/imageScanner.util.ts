import * as tf from '@tensorflow/tfjs-node';
import * as nsfw from 'nsfwjs';
import { createWorker, RecognizeResult } from 'tesseract.js';
import { Tensor3D } from '@tensorflow/tfjs-node';

interface NSFWPrediction {
  className: string;
  probability: number;
}

export interface ScanResult {
  isExplicit: boolean
  text: string
}

let model: nsfw.NSFWJS | null = null;

export const recognizeText = async (imageBuffer: Buffer): Promise<string> => {
  const worker = await createWorker();
  const { data }: RecognizeResult = await worker.recognize(imageBuffer);
  await worker.terminate();
  return data.text;
};


 const loadNSFWModel = async (): Promise<void> => {
  if (!model) {
    model = await nsfw.load();
  }
};

export const classifyImage = async (imageBuffer: Buffer): Promise<boolean> => {
   await loadNSFWModel();
  if (!model) {
    throw new Error('NSFW model not loaded. Call loadNSFWModel() first.');
  }

  try {
    const image = await tf.node.decodeImage(new Uint8Array(imageBuffer), 3);
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]) as Tensor3D;
    const predictions = await model.classify(resizedImage);

    image.dispose();
    resizedImage.dispose();

    return isExplicit(predictions);
  } catch (error) {
    console.error('Error classifying image:', error);
    throw error;
  }
};

const isExplicit = (predictions: NSFWPrediction[]): boolean => {
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

  const pornThreshold = 0.5;
  const explicitThreshold = 0.6;

  const isExplicit = (pornProbability + sexyProbability) > explicitThreshold;

  return (pornProbability > pornThreshold) || isExplicit;

};


