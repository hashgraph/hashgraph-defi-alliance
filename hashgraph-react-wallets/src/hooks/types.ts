export type AuthChallengePayload = {
  url: string
  data: {
    ts: number
  }
}

export type AuthChallenge = {
  payload: AuthChallengePayload
  server: {
    accountId: string
    signature: string
  }
}

export type CreateTokenRequestBody = Partial<{
  loginType: string
  idToken: string
  payload: AuthChallengePayload
  signatures: {
    server: string
    wallet: {
      accountId: string
      value: string
    }
  }
}>
