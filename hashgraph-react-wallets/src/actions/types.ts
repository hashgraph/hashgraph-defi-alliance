export type MirrorBalancesTokenType = {
  token_id: string
  balance: number
}

export type MirrorBalancesType = {
  account: string
  balance: number
  tokens: MirrorBalancesTokenType[]
}

export type MirrorBalancesResponse = {
  balances: MirrorBalancesType[]
  links: {
    next: string | null
  }
  timestamp: string
  _status?: {
    messages: { message: string }[]
  }
}
