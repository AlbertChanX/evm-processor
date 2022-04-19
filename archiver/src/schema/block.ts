import mongoose from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { Types, filter } from 'archive-utils';

interface BlockDocument extends Types.Archive.Block, mongoose.Document {}

const BlockSchema = new mongoose.Schema<BlockDocument>({
  number: { type: Number, required: true, unique: true, index: true },
  hash: { type: String, required: true, unique: true },
  parentHash: { type: String, required: true },
  nonce: String,
  sha3Uncles: { type: String, required: true },
  transactionRoot: String,
  stateRoot: { type: String, required: true },
  miner: { type: String, required: true },
  extraData: { type: String, required: true },
  gasLimit: { type: Number, required: true },
  gasUsed: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  size: { type: Number, required: true },
  difficulty: { type: String, required: true },
  totalDifficulty: { type: String, required: true },
  uncles: String,
});

export const BlockModel = mongoose.model('Block', BlockSchema);

const BlockTC = composeMongoose(BlockModel);

BlockTC.addResolver({
  kind: 'query',
  name: 'latestBlock',
  type: 'Int',
  resolve: async () => {
    const results = await BlockModel.find({})
      .select({ number: 1 })
      .sort('-number')
      .limit(1);

    return results[0]?.number;
  },
});

export const blockQuery = {
  blocks: BlockTC.mongooseResolvers.findMany(filter),
  latestBlock: BlockTC.getResolver('latestBlock'),
};
