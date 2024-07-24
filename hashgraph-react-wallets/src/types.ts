declare global {
  interface Window {
    ethereum?: any
  }
}

export type HederaNetwork = 'testnet' | 'mainnet' | 'previewnet' | 'devnet'

export type UserBalanceResult = {
  decimals: number
  formatted: string
  symbol: string
  value: BigInt | number
}
