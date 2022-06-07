import { Types } from 'indexer-utils';

export default function transform(data: {
  events721: Types.Contract.DecodedContractEvent[];
  eventsSingle1155: Types.Contract.DecodedContractEvent[];
  eventsBatch1155: Types.Contract.DecodedContractEvent[];
}): {
  nfts: Types.Nft.ERC721Token[];
  sfts: Types.Nft.ERC1155Token[];
} {
  return {
    nfts: map721(data.events721),
    sfts: [
      ...map1155Single(data.eventsSingle1155),
      ...map1155Batch(data.eventsBatch1155),
    ],
  };
}

function map721(
  events: Types.Contract.DecodedContractEvent[],
): Types.Nft.ERC721Token[] {
  return events.map((event) => ({
    contract: event.contract,
    lastTransferedBlockNumber: event.blockNumber,
    lastTransferedBlockTimestamp: event.blockTimestamp,
    tokenId: event.value3!,
    owner: event.value2!,
  }));
}

function map1155Single(
  events: Types.Contract.DecodedContractEvent[],
): Types.Nft.ERC1155Token[] {
  return events.flatMap((event) => [
    {
      contract: event.contract,
      lastTransferedBlockNumber: event.blockNumber,
      lastTransferedBlockTimestamp: event.blockTimestamp,
      tokenId: event.value4!,
      owner: event.value2!,
      quantity: -parseInt(event.value5!),
    },
    {
      contract: event.contract,
      lastTransferedBlockNumber: event.blockNumber,
      lastTransferedBlockTimestamp: event.blockTimestamp,
      tokenId: event.value4!,
      owner: event.value3!,
      quantity: parseInt(event.value5!),
    },
  ]);
}

function map1155Batch(
  events: Types.Contract.DecodedContractEvent[],
): Types.Nft.ERC1155Token[] {
  return events.flatMap((event) =>
    event.value4!.split(',').flatMap((tokenId, index) => [
      {
        contract: event.contract,
        lastTransferedBlockNumber: event.blockNumber,
        lastTransferedBlockTimestamp: event.blockTimestamp,
        tokenId,
        owner: event.value2!,
        quantity: -parseInt(event.value5!.split(',')[index]),
      },
      {
        contract: event.contract,
        lastTransferedBlockNumber: event.blockNumber,
        lastTransferedBlockTimestamp: event.blockTimestamp,
        tokenId,
        owner: event.value3!,
        quantity: parseInt(event.value5!.split(',')[index]),
      },
    ]),
  );
}
