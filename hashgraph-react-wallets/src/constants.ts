import { Chain } from 'viem'
import { HederaMainnet, HederaTestnet } from './hWBridge/chains'
import { HederaNetwork } from './types'

export const DEFAULT_TOKEN_SYMBOL = 'ℏ'
export const DEFAULT_TOKEN_DECIMALS = 8
export const DEFAULT_TOKEN_DECIMALS_ETHEREUM = 18

export const regexPatterns = {
  hederaTransactionId: /\d+\.\d+\.\d+@\d+\.\d+/,
}

export enum ConnectorType {
  HEDERA = 'HEDERA',
  ETHEREUM = 'ETHEREUM',
}

export enum HWBridgeQueryKeys {
  ACCOUNT_ID = 'accountId',
  ACCOUNT_BALANCE = 'accountBalance',
  TOKENS_BALANCE = 'tokensBalance',
  GET_CHAIN_ID = 'getChainId',
  GET_CONTRACT = 'getContract',
  WRITE_CONTRACT = 'writeContract',
  APPROVE_TOKENS_ALLOWANCE = 'approveTokensAllowance',
  APPROVE_TOKENS_NFT_ALLOWANCE = 'approveTokensNftAllowance',
  ASSOCIATE_TOKENS = 'associateTokens',
  GET_HNS = 'getHns',
  SWITCH_CHAIN = 'switchChain',
  WATCH_TRANSACTION_RECEIPT = 'watchTransactionReceipt',
}

export enum HederaChainIds {
  mainnet = 295,
  testnet = 296,
}

export const HederaNetworks: { [key: number]: HederaNetwork } = {
  [HederaChainIds.mainnet]: 'mainnet',
  [HederaChainIds.testnet]: 'testnet',
}

export const CHAINS: Chain[] = [HederaMainnet, HederaTestnet]
