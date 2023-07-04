import { HWBridgeDAppMetadata, HederaNetwork } from '../../types'
import IConnector from '../../interfaces/IConnector'
import { BladeSigner, BladeWalletError, SessionParams } from '@bladelabs/blade-web3.js'
import { DAppMetadata } from '@hashgraph/hedera-wallet-connect'
import { BLADE_EXTENSION_POLLING_ATTEMPTS, BLADE_EXTENSION_POLLING_INTERVAL, BLADE_STORAGE_KEY } from './constants'
import { BladeWallet } from './types'
import { HWBConnectorProps } from '../types'

export class BladeConnector implements IConnector {
  private readonly _network: HederaNetwork
  private readonly _metadata: HWBridgeDAppMetadata
  private readonly _debug: boolean
  private _bladeSigner!: BladeWallet | null

  constructor({ network, metadata, debug = false }: HWBConnectorProps) {
    this._network = network
    this._metadata = metadata
    this._debug = debug || false
  }

  private async _tryConnectBlade() {
    if (this._debug) console.log('[Blade Connector]: Trying to connect blade wallet')

    try {
      const bladeMetadata = Object.keys(this._metadata || {}).length > 0 ? (this._metadata as DAppMetadata) : undefined
      this._bladeSigner = new BladeSigner(bladeMetadata) as BladeWallet

      if (this._debug)
        console.log(
          `[Blade Connector]: Create/Get blade session for ${this._network}. Blade popup should appear if there is no active session`,
        )

      const connectedAccounts = await this._bladeSigner.createSession({ network: this._network } as SessionParams)
      if (this._debug && Array.isArray(connectedAccounts) && connectedAccounts.length) {
        console.log('[Blade Connector]: Connected with accounts', connectedAccounts)
      }

      const localSession = {
        connectedAccounts,
        connected: true,
        networkName: this._network,
      }

      if (this._debug) console.log('[Blade Connector]: Saving local session')
      localStorage.setItem(BLADE_STORAGE_KEY, JSON.stringify(localSession))

      return this._bladeSigner
    } catch (err) {
      this._bladeSigner = null

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
    const isExtensionPresent = await this.checkExtensionPresence()

    if (isExtensionPresent) {
      const isWalletStateAvailable = this.isWalletStateAvailable()

      if (this._debug) {
        if (isWalletStateAvailable) {
          console.log('[Blade Connector]: Found wallet local state')
        } else {
          console.log('[Blade Connector]: Could not find any local state. Waiting for a new connection')
        }
      }

      return isExtensionPresent && isWalletStateAvailable ? ((await this._tryConnectBlade()) as BladeWallet) : null
    }

    return null
  }

  async newConnection(): Promise<BladeWallet | null> {
    if (this._debug) console.log('[Blade Connector]: Trying to create a new connection')
    return new Promise<BladeWallet | null>((resolve) => {
      this.checkExtensionPresence().then((isExtensionPresent) => {
        if (!isExtensionPresent) {
          if (this._debug && !isExtensionPresent)
            console.log('[Blade Connector]: Could not find blade wallet extension')
          return resolve(null)
        }

        this._tryConnectBlade().then((signer) => resolve(signer as BladeWallet))
      })
    })
  }

  async checkExtensionPresence(maxAttempts = BLADE_EXTENSION_POLLING_ATTEMPTS): Promise<boolean> {
    let pollingInterval: ReturnType<typeof setInterval>
    let attempts = maxAttempts - 1

    return new Promise((resolve) => {
      pollingInterval = setInterval(() => {
        const isExtensionPresent = !!window.bladeConnect
        if (this._debug)
          console.log('[Blade Connector]: Polling blade wallet extension. Remaining attempts:', attempts + 1)

        if (isExtensionPresent) {
          if (this._debug) console.log('[Blade Connector]: Blade wallet extension found')
          clearInterval(pollingInterval)
          resolve(true)
        }

        if (attempts === 0 && !isExtensionPresent) {
          if (this._debug) console.log('[Blade Connector]: Could not find blade wallet extension')
          clearInterval(pollingInterval)
          resolve(false)
        }

        attempts--
      }, BLADE_EXTENSION_POLLING_INTERVAL)
    })
  }

  isWalletStateAvailable(): boolean {
    const bladeDataString = localStorage.getItem(BLADE_STORAGE_KEY)
    const bladeData = JSON.parse(bladeDataString || '{}')

    return (
      !!bladeDataString &&
      bladeData.connected &&
      Array.isArray(bladeData.connectedAccounts) &&
      bladeData.connectedAccounts.length > 0 &&
      bladeData.networkName === this._network
    )
  }

  async wipePairingData(): Promise<boolean> {
    try {
      if (this._debug) console.log('[Blade Connector]: Kill blade wallet session and wipe local data')
      localStorage.removeItem(BLADE_STORAGE_KEY)

      await this._bladeSigner?.killSession()
      this._bladeSigner = null
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
