import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, '../protos/service.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const raffleService = protoDescriptor.service;

class GrpcServer {
  private server: grpc.Server;

  constructor() {
    this.server = new grpc.Server();
  }

  start() {
    this.server.addService((raffleService as any).RaffleService.service, {
      getRaffleStatus: (call: any, callback: any) => {
        const raffleId = call.request.raffle_id;
        console.log(' gRPC request received for raffle:', raffleId);
        
        // Mock response for testing
        const response = {
          status: 'active',
          message: `Raffle ${raffleId} is active - Response from Node.js gRPC Server`
        };
        
        console.log(' Sending gRPC response:', response);
        callback(null, response);
      }
    });

    this.server.bindAsync(
      '0.0.0.0:50051',
      grpc.ServerCredentials.createInsecure(),
      (err: Error | null, port: number) => {
        if (err) {
          console.error(' Failed to start gRPC server:', err);
          return;
        }
        this.server.start();
        console.log(` gRPC server running on port ${port}`);
      }
    );
  }

  stop() {
    return new Promise<void>((resolve, reject) => {
      this.server.tryShutdown((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

export default GrpcServer;