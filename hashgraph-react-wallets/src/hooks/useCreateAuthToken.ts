import { HashpackConnector, MagicConnector } from '../hWBridge/connectors'
import { HashConnectSDK, MagicSDK } from '../hWBridge/types'
import { AuthChallenge, CreateTokenRequestBody } from './types'
import { useAccountId } from './useAccountId'
import { useWallet } from './useWallet'
import { useWalletSDK } from './useWalletSDK'

interface IUseCreateAuthTokenOptions {
  getChallenge: () => Promise<AuthChallenge>
  createToken: (data: CreateTokenRequestBody) => Promise<string>
}

export function useCreateAuthToken(
  authOptions: IUseCreateAuthTokenOptions,
): [() => Promise<string>, () => Promise<CreateTokenRequestBody>] {
  const sdk = useWalletSDK()
  const wallet = useWallet()
  const { accountId } = useAccountId()

  const createAuthTokenRequestBody = async () => {
    if (!accountId) throw new Error('AccountId could not be found. Please connect first.')

    const challenge = await authOptions.getChallenge()
    if (!challenge) throw new Error('Could not get the challenge')

    const hashconnect = sdk as HashConnectSDK

    const authRes = await hashconnect.authenticate(
      hashconnect.hcData.topic,
      accountId.toString(),
      challenge.server.accountId,
      Buffer.from(challenge.server.signature, 'hex'),
      challenge.payload,
    )

    if (!authRes) throw new Error('There has been an error while authenticating with hashconnect')

    const tokenCreateRequestBody: CreateTokenRequestBody = {
      loginType: 'wallet',
      payload: challenge.payload,
      signatures: {
        server: challenge.server.signature,
        wallet: {
          accountId: accountId.toString(),
          value: Buffer.from(authRes.userSignature as Uint8Array).toString('hex'),
        },
      },
    }

    return tokenCreateRequestBody
  }

  const createAuthToken = async () => {
    if (wallet.connector instanceof MagicConnector) {
      const idToken = await (sdk as MagicSDK).user.getIdToken()

      return await authOptions.createToken({
        loginType: 'magic',
        idToken,
      })
    } else if (wallet.connector instanceof HashpackConnector) {
      return await authOptions.createToken(await createAuthTokenRequestBody())
    } else {
      throw new Error(`This method is not supported by your wallet`)
    }
  }

  return [createAuthToken, createAuthTokenRequestBody]
}
