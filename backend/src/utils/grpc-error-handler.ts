import { status } from "@grpc/grpc-js";
import { Logger } from "./logger";

export class GrpcError extends Error {
  constructor(
    public readonly code: status,
    public readonly details: string,
    public readonly metadata?: Record<string, any>
  ) {
    super(details);
    this.name = "GrpcError";
  }

  static fromError(error: any): GrpcError {
    const code = error.code || status.UNKNOWN;
    const details = error.details || error.message || "Unknown error";
    const metadata = error.metadata?.getMap() || {};

    return new GrpcError(code, details, metadata);
  }
}

export class GrpcErrorHandler {
  constructor(private readonly logger: Logger) {}

  handle(error: any, context: string): GrpcError {
    const grpcError = GrpcError.fromError(error);

    this.logger.error("gRPC Error occurred", {
      context,
      code: grpcError.code,
      details: grpcError.details,
      metadata: grpcError.metadata,
      stack: error.stack,
    });

    return grpcError;
  }

  mapToHttpStatus(grpcError: GrpcError): number {
    const statusMap: Record<status, number> = {
      [status.OK]: 200,
      [status.CANCELLED]: 499,
      [status.UNKNOWN]: 500,
      [status.INVALID_ARGUMENT]: 400,
      [status.DEADLINE_EXCEEDED]: 504,
      [status.NOT_FOUND]: 404,
      [status.ALREADY_EXISTS]: 409,
      [status.PERMISSION_DENIED]: 403,
      [status.UNAUTHENTICATED]: 401,
      [status.RESOURCE_EXHAUSTED]: 429,
      [status.FAILED_PRECONDITION]: 400,
      [status.ABORTED]: 409,
      [status.OUT_OF_RANGE]: 400,
      [status.UNIMPLEMENTED]: 501,
      [status.INTERNAL]: 500,
      [status.UNAVAILABLE]: 503,
      [status.DATA_LOSS]: 500,
    };

    return statusMap[grpcError.code] || 500;
  }
}
