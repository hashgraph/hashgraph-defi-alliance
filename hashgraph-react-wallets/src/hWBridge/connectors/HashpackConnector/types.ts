import { Provider } from '@hashgraph/sdk/lib/Provider'
import { PublicKey } from '@hashgraph/sdk'
import { HashConnectSigner } from 'hashconnect/dist/esm/provider/signer'
import { HashConnectTypes } from 'hashconnect'

export type HashConnectWallet = HashConnectSigner & {
  getProvider: () => Provider
  getAccountKey: () => PublicKey
  authenticate: () => Promise<Response>
  logout: () => Promise<Response>
}

export type HashpackDAppMetadata = HashConnectTypes.AppMetadata
