export type MirrorResponseStatus = {
  messages: { message: string }[]
}

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
  _status?: MirrorResponseStatus
}

export type MirrorTokensResponse = {
  tokens: {
    automatic_association: boolean
    balance: number
    created_timestamp: string
    freeze_status: string
    kyc_status: string
    token_id: string
  }[]
  links: {
    next: string | null
  }
  _status?: MirrorResponseStatus
}
