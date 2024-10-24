import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { upDateUploadedFile } from '../services/upload.service';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/image.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const imageProto = grpc.loadPackageDefinition(packageDefinition);

export const triggerImageScanner = (imageId: number, filePath: string) => {
  const client = new (imageProto as any).ImageService(
      'localhost:50051',
      grpc.credentials.createInsecure()
  );

  client.processImage({ id: imageId, path: filePath }, (error: any, response: any) => {
    if (error) {
      console.error('gRPC error:', error);
    } else {
      console.log('gRPC response:', response);

      const { explicit, imageText, id } = response;
      console.log(`Explicit: ${explicit}, Image Text: ${imageText}`);
      return upDateUploadedFile(id, explicit, imageText);

    }
  });
};
