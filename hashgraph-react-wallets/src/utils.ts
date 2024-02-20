import { AccountId, ContractId, Executable, TokenId, Transaction } from '@hashgraph/sdk'
import { Chain } from 'viem'

export function getBytesOf<RequestT, ResponseT, OutputT>(
  request: Executable<RequestT, ResponseT, OutputT>,
): Uint8Array {
  if (request instanceof Transaction) {
    return request.toBytes()
  } else {
    throw new Error('Only Transactions can be serialized to be sent for signing through the HashPack wallet.')
  }
}

export function getChainById(chains: readonly [Chain, ...Chain[]], chainId: number): Chain | null {
  return chains.find((chain) => chain.id === chainId) ?? null
}

export function toEvmAddress(value: AccountId | TokenId | ContractId): `0x${string}` {
  return `0x${value.toSolidityAddress()}`
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
