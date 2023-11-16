import { BladeConnector, ConnectorStrategy, BladeWalletError, SessionParams } from '@bladelabs/blade-web3.js'
import { DAppMetadata } from '@hashgraph/hedera-wallet-connect'
import { BLADE_STORAGE_KEY } from './constants'
import { BladeWallet } from './types'
import { HWBConnectorProps } from '../types'
import { TransactionReceiptQuery } from '@hashgraph/sdk'
import BladeLogoWhite from '../../../assets/blade-icon.png'
import BladeLogoDark from '../../../assets/blade-icon-dark.png'
import BaseConnector from '../BaseConnector'

class BladeWalletConnector extends BaseConnector {
  private _blade: BladeConnector | null = null

  constructor({ network, metadata, config, debug }: HWBConnectorProps) {
    super({ network, metadata, config, debug })
    this._config = {
      icons: {
        white: BladeLogoWhite,
        dark: BladeLogoDark,
        ...config?.icons,
      },
      ...config,
    }
  }

  private async _tryConnectBlade() {
    if (this._debug) console.log('[Blade Connector]: Trying to connect blade wallet')

    try {
      const bladeMetadata = Object.keys(this._metadata || {}).length > 0 ? (this._metadata as DAppMetadata) : undefined
      this._blade = await BladeConnector.init(ConnectorStrategy.AUTO, bladeMetadata)

      if (this._debug)
        console.log(
          `[Blade Connector]: Create/Get blade session for ${this._network}. Blade popup should appear if there is no active session`,
        )

      const pairedAccountIds = await this._blade.createSession({ network: this._network } as SessionParams)
      const bladeSigner = this._blade.getSigner() as BladeWallet

      if (this._debug && Array.isArray(pairedAccountIds) && pairedAccountIds.length) {
        console.log('[Blade Connector]: Connected with accounts', pairedAccountIds)
      }

      const localSession = {
        pairedAccountIds,
        connected: true,
        networkName: this._network,
      }

      if (this._debug) console.log('[Blade Connector]: Saving local session')
      localStorage.setItem(BLADE_STORAGE_KEY, JSON.stringify(localSession))

      this._blade.onSessionDisconnect(this.wipePairingData.bind(this))
      this._blade.onSessionExpire(this.wipePairingData.bind(this))

      bladeSigner.getProvider = () => ({
        getTransactionReceipt: (transactionId: string) => {
          return new TransactionReceiptQuery().setTransactionId(transactionId).executeWithSigner(bladeSigner!)
        },
      })

      return bladeSigner
    } catch (err) {
      this._blade = null

      if (err instanceof Error) {
        if (err.name === BladeWalletError.ExtensionNotFound) {
          console.warn('[Blade Connector]: No extension found')
        } else if (err.name === BladeWalletError.NoSession) {
          console.warn(`[Blade Connector]: No active blade session.`)
        } else if (err.message === `The user's wallet is locked.`) {
          console.warn(`[Blade Connector]: User wallet is locked.`)
        } else {
          console.error(`[Blade Connector]: Uncaught: ${err.message}`)
        }
      }

      return null
    }
  }

  async getConnection(): Promise<BladeWallet | null> {
    if (this._debug) console.log('[Blade Connector]: Looking for an existing session')
    return this.isWalletStateAvailable() ? ((await this._tryConnectBlade()) as BladeWallet) : null
  }

  async newConnection(): Promise<BladeWallet | null> {
    if (this._debug) console.log('[Blade Connector]: Trying to create a new connection')
    return new Promise<BladeWallet | null>(async (resolve) => {
      this._tryConnectBlade().then((signer) => resolve(signer as BladeWallet))
    })
  }

  isWalletStateAvailable(): boolean {
    const bladeDataString = localStorage.getItem(BLADE_STORAGE_KEY)
    const bladeData = JSON.parse(bladeDataString || '{}')

    return (
      !!bladeDataString &&
      bladeData.connected &&
      Array.isArray(bladeData.pairedAccountIds) &&
      bladeData.pairedAccountIds.length > 0 &&
      bladeData.networkName === this._network
    )
  }

  async wipePairingData(): Promise<boolean> {
    try {
      if (this._debug) console.log('[Blade Connector]: Kill blade wallet session and wipe local data')
      localStorage.removeItem(BLADE_STORAGE_KEY)

      await this._blade?.killSession()
      this._blade = null
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  get sdk(): BladeConnector | null {
    return this._blade as BladeConnector | null
  }
}

export default BladeWalletConnector
