import mongoose from 'mongoose';

interface LastIndexedBlockDocument extends mongoose.Document {
  lastIndexedBlock: number;
}

const LastIndexedBlockSchema = new mongoose.Schema<LastIndexedBlockDocument>({
  lastIndexedBlock: { type: Number, required: true },
});

export const Model = mongoose.model('LastIndexedBlock', LastIndexedBlockSchema);

export const get = async (): Promise<number | null> => {
  const currentValue = await Model.findOne({}).exec();
  if (!currentValue) {
    return null;
  }
  return currentValue.get('lastIndexedBlock') as number;
};

export const save = async (lastIndexedBlock: number): Promise<void> => {
  const currentValue = await Model.findOne().exec();

  if (!currentValue) {
    await Model.create({ lastIndexedBlock });
    return;
  }

  await currentValue.updateOne({ lastIndexedBlock });
};
