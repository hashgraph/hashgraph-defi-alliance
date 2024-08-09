import { HWBConnectorProps } from '../types'
import WalletConnectIconWhite from '../../../assets/wc-icon.png'
import WalletConnectIconDark from '../../../assets/wc-icon-dark.png'
import { DAppConnector, DAppSigner } from '@hashgraph/hedera-wallet-connect'
import { HederaConnector } from '../HederaConnector'
import { HWC_DEFAULT_SESSION_STORAGE_KEY, WALLETCONNECT_DEEPLINK_CHOICE } from './constants'
import { SessionTypes } from '@walletconnect/types'
import SignClient from '@walletconnect/sign-client'

class HWCConnector extends HederaConnector {
  private readonly _onAutoPairing: (signer: DAppSigner) => void
  private readonly _onDisconnect: () => Promise<boolean>
  private readonly _localStorageKey: string
  private readonly _walletConnectClient?: SignClient
  protected _extensionId: string | null = null

  constructor(props: HWBConnectorProps) {
    super(props)

    this._config = {
      icons: {
        white: WalletConnectIconWhite,
        dark: WalletConnectIconDark,
        ...props.config?.icons,
      },
      ...props.config,
    }

    this._extensionId = props.extensionId || null
    this._walletConnectClient = (this._strategy.controller as DAppConnector).walletConnectClient
    this._localStorageKey = this._extensionId ? `HWC:${this._extensionId}` : HWC_DEFAULT_SESSION_STORAGE_KEY
    this._onAutoPairing = props.onAutoPairing
    this._onDisconnect = props.onDisconnect
  }

  async _bindEvents() {
    ;(this._strategy.controller as DAppConnector).onSessionIframeCreated = ({ topic }) => {
      this._onAutoPairing(this.getSignerForSession(topic) as DAppSigner)
    }
    this._walletConnectClient?.on('session_delete', this.onSessionDelete.bind(this))
  }

  async _unbindEvents() {
    this._walletConnectClient?.off('session_delete', this.onSessionDelete.bind(this))
  }

  onSessionDelete({ topic }: SessionTypes.Struct) {
    const _cachedTopic = localStorage.getItem(this._localStorageKey)

    if (topic === _cachedTopic) {
      this._onDisconnect()
    }
  }

  getSignerForSession(topic: string): DAppSigner | null {
    return (
      ((this._strategy.controller as DAppConnector).signers.find((signer) => signer.topic === topic) as DAppSigner) ||
      null
    )
  }

  async getConnection(): Promise<DAppSigner | null> {
    if (!this.isWalletStateAvailable()) return null

    this._bindEvents()
    return this.getSignerForSession(localStorage.getItem(this._localStorageKey) as string)
  }

  async newConnection(): Promise<DAppSigner | null> {
    return new Promise(async (resolve, reject) => {
      let connection: SessionTypes.Struct

      try {
        if (this._extensionId) {
          connection = await (this._strategy.controller as DAppConnector).connectExtension(this._extensionId)
        } else {
          connection = await (this._strategy.controller as DAppConnector).openModal()
        }

        localStorage.setItem(this._localStorageKey, connection.topic)
      } catch (e) {
        console.error(e)
        reject(null)
      } finally {
        if (connection!) {
          this._bindEvents()
          resolve(this.getSignerForSession(connection!.topic))
        }
      }
    })
  }

  async checkExtensionPresence(): Promise<boolean> {
    if (!this._extensionId) return true

    return (this._strategy.controller as DAppConnector).extensions.some(({ id }) => id === this._extensionId)
  }

  isWalletStateAvailable(): boolean {
    const _sessions = this._walletConnectClient?.session.getAll()

    if (_sessions && _sessions.length > 0) {
      const _cachedTopic = localStorage.getItem(this._localStorageKey)
      const _activeSession = _sessions.find((session) => session.topic === _cachedTopic)

      if (!_activeSession) return false
      if (!this._extensionId) return !_activeSession.sessionProperties?.extensionId

      return _activeSession.sessionProperties?.extensionId === this._extensionId
    }

    return false
  }

  async wipePairingData(): Promise<boolean> {
    try {
      if (!this._walletConnectClient?.session.length) return true

      const _cachedTopic = localStorage.getItem(this._localStorageKey)
      if (!_cachedTopic) return true

      await (this._strategy.controller as DAppConnector).disconnect(_cachedTopic)

      if (!this._extensionId) {
        localStorage.removeItem(WALLETCONNECT_DEEPLINK_CHOICE)
      }

      this._unbindEvents()
      return true
    } catch (e) {
      return false
    } finally {
      localStorage.removeItem(this._localStorageKey)
    }
  }

  get isExtensionRequired() {
    return false
  }

  get sdk(): DAppConnector | null {
    return this._strategy.controller as DAppConnector
  }
}

export default HWCConnector
