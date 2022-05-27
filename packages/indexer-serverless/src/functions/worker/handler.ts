import { SQSEvent } from 'aws-lambda';
import { awsUtils } from 'aws-utils';
import { monitoring } from 'indexer-monitoring';
import mongoose from 'mongoose';

export default async function worker(
  event: SQSEvent,
  handler: (start: number, end: number) => Promise<void>,
) {
  console.log('Connecting to mongo');
  await mongoose.connect(process.env.MONGO_URI!);

  try {
    await awsUtils.lambdaHandler(
      event,
      { queueUrl: process.env.QUEUE_URL! },
      handler,
    );

    await monitoring.pushMetrics();
    console.log('Finish Push Metrics');
  } catch (e) {
    console.error('Outer handler error');
    await mongoose.disconnect();
    throw e;
  }
  console.log('Disconnecting from mongo');
  await mongoose.disconnect();
}
