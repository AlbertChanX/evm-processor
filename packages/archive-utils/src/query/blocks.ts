import axios from 'axios';
import { Block } from '../types';
import endpoint from './endpoint';

const defaultProperties: (keyof Block)[] = [
  'number',
  'hash',
  'parentHash',
  'nonce',
  'sha3Uncles',
  'transactionRoot',
  'stateRoot',
  'miner',
  'extraData',
  'gasLimit',
  'gasUsed',
  'timestamp',
  'size',
  'difficulty',
  'totalDifficulty',
  'uncles',
];

export default async function blocks(
  startBlock: number,
  endBlock: number,
  properties: (keyof Block)[] = defaultProperties
) {
  const response = await axios({
    url: endpoint,
    method: 'post',
    data: {
      variables: {
        startBlock,
        endBlock,
      },
      query: `
        query Blocks($startBlock: Int!, $endBlock: Int!) {
          blocks(
            startBlock: $startBlock,
            endBlock: $endBlock
          ) {
            ${properties.join(',')}
          }
        }
      `,
    },
  });
  return response.data.data.blocks as Block[];
}