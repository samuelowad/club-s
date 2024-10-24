
import { ImageResponse } from '../proto/image';

export const processImage = (call: any, callback: any) => {
  const { id, path } = call.request;

  console.log(`Processing image with ID: ${id}, at path: ${path}`);

  const response: ImageResponse = {
    explicit: Math.random() < 0.5,
    imageText: "Sample text extracted from the image",
    id: 1
  };

  // Return the response to the main service
  callback(null, response);
};
