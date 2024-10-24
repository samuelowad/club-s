import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { processImage } from './services/imageProcessor';

const PROTO_PATH = path.join(__dirname, '../../proto/image.proto');

// Load the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const imageProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService((imageProto as any).ImageService.service, {
  processImage
});

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error('Failed to start gRPC server:', error);
  } else {
    console.log(`Image scanner gRPC server running at http://localhost:${port}`);
    server.start();
  }
});
