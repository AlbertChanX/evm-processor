import axios from 'axios';
import { ContractTransaction } from '../types/archive';
import endpoint from './endpoint';

const defaultProperties: (keyof ContractTransaction)[] = [
  'hash',
  'nonce',
  'blockHash',
  'blockNumber',
  'blockTimestamp',
  'transactionIndex',
  'from',
  'value',
  'gasPrice',
  'gas',
  'receiptStatus',
  'receiptCumulativeGasUsed',
  'receiptGasUsed',
  'input',
  'methodId',
  'to',
];

export default async function contractTransactions(
  startBlock: number,
  endBlock: number,
  contractAddress?: string,
  methodId?: string,
  properties: (keyof ContractTransaction)[] = defaultProperties
) {
  try {
    const response = await axios({
      url: endpoint,
      method: 'post',
      data: {
        variables: {
          startBlock,
          endBlock,
          contractAddress,
          methodId,
        },
        query: `
        query ContractTransactions(
          $startBlock: Float!,
          $endBlock: Float!,
          $contractAddress: String,
          $methodId: String
        ) {
          contractTransactions(
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
              }
              to: $contractAddress
              methodId: $methodId
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.contractTransactions as ContractTransaction[];
  } catch (e: any) {
    throw new Error(e.message);
  }
}
