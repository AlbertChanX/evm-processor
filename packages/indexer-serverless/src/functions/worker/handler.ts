import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import { monitoring } from 'indexer-monitoring';
import mongoose from 'mongoose';

export default async function worker(
  event: SQSEvent,
  handler: (start: number, end: number) => Promise<void>,
): Promise<SQSBatchResponse> {
  await mongoose.connect(process.env.MONGO_URI!);

  let failedMessages: SQSBatchItemFailure[] = [];

  failedMessages = await awsUtils.lambdaHandler(event, handler);

  await monitoring.pushMetrics();

  console.log('Disconnecting from mongo');
  await mongoose.disconnect();

  return {
    batchItemFailures: failedMessages,
  };
}
