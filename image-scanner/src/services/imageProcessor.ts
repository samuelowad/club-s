
import { ImageResponse } from '../proto/image';
import { promises as fs } from 'fs';
import { classifyImage, recognizeText, ScanResult } from '../utils/imageScanner.util';

export const processImage = async (call: any, callback: any) => {
  const { id, path } = call.request;

  const { isExplicit, text } = await scanImage(path);

  const response: ImageResponse = {
    explicit: isExplicit,
    imageText: text,
    id
  };

  console.log('Image processed:', response);
  callback(null, response);
};

const scanImage = async (imagePath: string): Promise<ScanResult> => {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const isExplicit = await classifyImage(imageBuffer);
    const text = await recognizeText(imageBuffer);
    return { isExplicit, text };
  } catch (error) {
    console.error('Error scanning image:', error);
    throw error;
  }

}
