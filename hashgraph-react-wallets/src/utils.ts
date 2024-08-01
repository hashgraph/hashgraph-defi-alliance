import { AccountId, ContractId, TokenId } from '@hashgraph/sdk'
import { Chain } from 'viem'
import { HederaNetwork } from './types'
import { HederaNetworks } from './constants'

export function getChainById(chains: Chain[], chainId: number): Chain | null {
  return chains.find((chain) => chain.id === chainId) ?? null
}

export function chainToNetworkName(chain: Chain): HederaNetwork {
  return HederaNetworks[chain.id]
}

export function toEvmAddress(value: AccountId | TokenId | ContractId): `0x${string}` {
  return `0x${value.toSolidityAddress()}`
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
