declare global {
  interface Window {
    ethereum?: any
  }
}

export type HederaNetwork = 'testnet' | 'mainnet' | 'previewnet'

export type UserBalanceResult = {
  decimals: number
  formatted: string
  symbol: string
  value: BigInt | number
}
