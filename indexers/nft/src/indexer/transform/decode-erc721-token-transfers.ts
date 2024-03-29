import { ethers, BigNumber } from 'ethers';
import ERC721 from '@openzeppelin/contracts/build/contracts/ERC721.json';
import { Types } from 'indexer-utils';

export default function decodeErc721TokenTransfers(
  logs: Types.Archive.Log[],
  contracts: Types.Contract.ERC721Contract[],
): Types.Nft.ERC721TokenTransfer[] {
  return logs.map((log) => {
    const decoded = new ethers.utils.Interface(ERC721.abi).decodeEventLog(
      'Transfer(address,address,uint256)',
      log.data,
      [log.topic0, log.topic1!, log.topic2!, log.topic3!],
    );
    const transfer: Types.Nft.ERC721TokenTransfer = {
      _id: log._id,
      contract: log.address,
      from: (decoded[0] as string).toLowerCase(),
      to: (decoded[1] as string).toLowerCase(),
      tokenId: (decoded[2] as BigNumber).toString(),
      transactionHash: log.transactionHash,
      transactionId: log.transactionId,
      blockNumber: log.blockNumber,
      blockTimestamp: log.blockTimestamp,
      collectionName: contracts.find((contract) => contract._id === log.address)
        ?.name,
    };
    return transfer;
  });
}
