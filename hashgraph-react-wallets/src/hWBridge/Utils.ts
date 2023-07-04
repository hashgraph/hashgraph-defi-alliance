import { Executable, Transaction } from '@hashgraph/sdk'

export function getBytesOf<RequestT, ResponseT, OutputT>(
  request: Executable<RequestT, ResponseT, OutputT>,
): Uint8Array {
  if (request instanceof Transaction) {
    return request.toBytes()
  } else {
    throw new Error('Only Transactions can be serialized to be sent for signing through the HashPack wallet.')
  }
}
