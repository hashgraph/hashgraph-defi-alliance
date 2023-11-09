import { Client, Executable, PublicKey, Transaction } from '@hashgraph/sdk'
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect'
import { getBytesOf } from '../../Utils'
import { HashConnectWallet } from './types'
import { HWBridgeDAppMetadata, HederaNetwork } from '../../types'
import { IConnector } from '../../interfaces'
import { HashConnectProvider } from 'hashconnect/dist/esm/provider/provider'
import { HWBConnectorProps } from '../types'
import { HP_APP_METADATA_STORAGE_KEY, HP_INNER_STORAGE_KEY, HP_WAIT_FOR_EXTENSION_RESPONSE_TIMEOUT } from './constants'

class HashpackWalletConnector implements IConnector {
  private readonly _network: HederaNetwork
  private readonly _metadata: HWBridgeDAppMetadata
  private readonly _debug: boolean
  private readonly _onAutoPairing?: (signer: HashConnectWallet) => void
  private _hashconnect: HashConnect | null = null

  constructor({ network, metadata, debug = false, onAutoPairing }: HWBConnectorProps) {
    this._network = network
    this._metadata = metadata
    this._debug = debug
    this._onAutoPairing = onAutoPairing
    this._initHashConnect(true)
  }

  async _initHashConnect(listenToPairingEvent: boolean) {
    if (this._hashconnect) {
      this._hashconnect.pairingEvent.offAll()
      await this._hashconnect.disconnect(this._hashconnect.hcData.topic)
      this._hashconnect = null
    }

    this._hashconnect = new HashConnect(this._debug)
    const isHPConnectionStateAvailable = this.isWalletStateAvailable()

    if (isHPConnectionStateAvailable) {
      const appMetadata = JSON.parse(localStorage.getItem(HP_APP_METADATA_STORAGE_KEY)!)
      this._hashconnect.loadLocalData()
      const connectedNetwork = this._hashconnect.hcData.pairingData[0].network as HederaNetwork

      await this._hashconnect.init(appMetadata, connectedNetwork, true)
      if (this._debug) console.log('[Hashpack Connector]: Hashconnect initialized with local data')
    } else {
      await this._hashconnect.init(this._metadata as HashConnectTypes.AppMetadata, this._network, false)
      if (this._debug) console.log('[Hashpack Connector]: Hashconnect initialized with new session')
    }

    if (listenToPairingEvent) {
      this._hashconnect.pairingEvent.once(this.onPairingEvent.bind(this))
    }

    return this._hashconnect
  }

  async onPairingEvent(pairingData: MessageTypes.ApprovePairing) {
    const connectedAccountId = pairingData.accountIds[0]
    const connectedNetwork = pairingData.network as HederaNetwork
    const hpTopic = pairingData.topic

    if (this._hashconnect) {
      const hpProvider = this._hashconnect.getProvider(connectedNetwork, hpTopic, connectedAccountId)
      localStorage.setItem(HP_APP_METADATA_STORAGE_KEY, JSON.stringify(this._metadata))

      this._onAutoPairing?.(await this.getBridgedWallet(this._hashconnect, hpProvider))
    }
  }

  async getBridgedWallet(hc: HashConnect, provider: HashConnectProvider): Promise<HashConnectWallet> {
    try {
      const hcData = hc.hcData.pairingData[0]
      const hcNetworkName = hcData.network
      const accountToSign = hcData.accountIds[0]
      const topic = hcData.topic
      const sdkClient = Client.forName(hcNetworkName)
      const hcSigner = hc.getSigner(provider) as HashConnectWallet
      const mirrorSubdomain = hcNetworkName === 'mainnet' ? 'mainnet-public' : 'testnet'
      const accountInfoFetchUrl = `https://${mirrorSubdomain}.mirrornode.hedera.com/api/v1/accounts/${accountToSign}`
      const accountInfoResponse = await fetch(accountInfoFetchUrl)
      const jAccountInfo = await accountInfoResponse.json()
      const accountPublicKey = PublicKey.fromString(jAccountInfo.key.key)

      // This region adapts the original HashConnectSigner received from HashConnect to the expected interface by Venin
      // We need to export the provider so that Venin's underlying Wallet can make use of it when query-ing for the receipts
      // This was present in the original HIP-338 Wallet specs
      hcSigner.getProvider = () => {
        return provider
      }

      hcSigner.getAccountKey = () => {
        return accountPublicKey
      }

      // Overwriting the underlying call method so that
      //   1. returnTransaction is set to 'true'
      //   2. we guard against trying to sign queries (which hashpack does not know how to do)
      hcSigner.call = async <RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>) => {
        const transaction = {
          byteArray: getBytesOf(request),
          metadata: {
            accountToSign,
            returnTransaction: true,
          },
          topic,
        }
        const { error, signedTransaction } = await hc.sendTransaction(topic, transaction)

        if (error) {
          throw new Error(`There was an issue while signing the request: ${error}`)
        }

        const sdkSignedTransaction = Transaction.fromBytes(signedTransaction as Uint8Array)

        return sdkSignedTransaction.execute(sdkClient) as unknown as Promise<OutputT>
      }
      return hcSigner
    } catch (e) {
      this.wipePairingData()
      throw new Error(
        "The signer could not be retrieved. It's possible that the cached account doesn't exist. Please attempt to establish a new connection.",
      )
    }
  }

  async getConnection(): Promise<HashConnectWallet | null> {
    if (!this._hashconnect) {
      return null
    }

    const isHPConnectionStateAvailable = this.isWalletStateAvailable()

    if (isHPConnectionStateAvailable) {
      this._hashconnect.loadLocalData()
      const hpTopic = this._hashconnect.hcData.topic
      const connectedAccountId = this._hashconnect.hcData.pairingData[0].accountIds[0]
      const connectedNetwork = this._hashconnect.hcData.pairingData[0].network as HederaNetwork

      const hpProvider = this._hashconnect.getProvider(connectedNetwork, hpTopic, connectedAccountId)

      return await this.getBridgedWallet(this._hashconnect, hpProvider)
    }

    return null
  }

  async newConnection(): Promise<HashConnectWallet | null> {
    if (!this._metadata) {
      throw new Error('HashConnect require a set of app metadata in order to be initialized')
    }

    return new Promise<HashConnectWallet>((resolve) => {
      this._initHashConnect(false).then((hashconnect) => {
        hashconnect.pairingEvent.once((data) => {
          const connectedAccountId = data.accountIds[0]
          const hpProvider = hashconnect.getProvider(this._network, data.topic, connectedAccountId)
          localStorage.setItem(HP_APP_METADATA_STORAGE_KEY, JSON.stringify(this._metadata))

          this.getBridgedWallet(hashconnect, hpProvider).then((signer) => {
            resolve(signer)
          })
        })

        hashconnect.connectToLocalWallet()
      })
    })
  }

  async checkExtensionPresence(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._hashconnect?.foundExtensionEvent.once(() => resolve(true))
      setTimeout(() => {
        resolve(false)
      }, HP_WAIT_FOR_EXTENSION_RESPONSE_TIMEOUT)
    })
  }

  isWalletStateAvailable(): boolean {
    const hcDataString = localStorage.getItem(HP_INNER_STORAGE_KEY)
    const hcMetadataString = localStorage.getItem(HP_APP_METADATA_STORAGE_KEY)
    const hcData = JSON.parse(hcDataString || '{}')

    return !!hcDataString && !!hcMetadataString && Array.isArray(hcData.pairingData) && hcData.pairingData.length > 0
  }

  async wipePairingData(): Promise<boolean> {
    try {
      localStorage.removeItem(HP_APP_METADATA_STORAGE_KEY)
      localStorage.removeItem(HP_INNER_STORAGE_KEY)

      await this._hashconnect?.clearConnectionsAndData()
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  getSdk(): HashConnect | null {
    return this._hashconnect as HashConnect | null
  }
}

export default HashpackWalletConnector
