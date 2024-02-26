import { MM_APP_METADATA_STORAGE_KEY } from './constants'
import { EvmConnector } from '../EvmConnector'
import { HWBConnectorProps } from '../types'
import { Client, createClient, custom } from 'viem'
import {
  connect,
  watchChainId,
  watchAccount,
  WatchChainIdReturnType,
  WatchAccountReturnType,
  disconnect,
} from 'wagmi/actions'
import { metaMask } from 'wagmi/connectors'
import MetamaskIconWhite from '../../../assets/metamask-icon.png'
import MetamaskIconDark from '../../../assets/metamask-icon-dark.png'

class MetamaskConnector extends EvmConnector {
  private readonly _onAutoPairing: (signer: Client | null) => void
  private _unwatchChainId: WatchChainIdReturnType
  private _unwatchAccount: WatchAccountReturnType

  static wagmiConnector = metaMask

  constructor(props: HWBConnectorProps) {
    super('metaMaskSDK', props)

    this._config = {
      icons: {
        white: MetamaskIconWhite,
        dark: MetamaskIconDark,
        ...props.config?.icons,
      },
      ...props.config,
    }

    this._onAutoPairing = props.onAutoPairing
    this.getConnection = this.getConnection.bind(this)
  }

  _bindWatchEvents() {
    this._unwatchChainId = watchChainId(this._wagmiConfig, {
      onChange: async (chainId, prevChainId) => {
        if (chainId !== prevChainId) {
          const client = await this.getConnection()

          if (client) {
            this.setChain(chainId)
            return this._onAutoPairing(client)
          }

          return null
        }
      },
    })

    this._unwatchAccount = watchAccount(this._wagmiConfig, {
      onChange: async (account, prevAccount) => {
        if (account.isDisconnected || !account.address || !account.chainId) {
          if (this._debug) console.log('[Metamask Connector]: Account changed and disconnected ', account)
          this.wipePairingData()
          return this._onAutoPairing(null)
        }

        if (account.address !== prevAccount.address) {
          const client = await this.getConnection()

          if (client) {
            if (this._debug) console.log('[Metamask Connector]: Account changed: ', account)
            return this._onAutoPairing(client)
          }

          return null
        }
      },
    })
  }

  _unbindWatchEvents() {
    this._unwatchChainId()
    this._unwatchAccount()
  }

  async _getClient(account: `0x${string}`) {
    if (this._debug) console.log('[Metamask Connector]: Trying to build the signer for: ', account)
    this._bindWatchEvents()

    if (!this._chain) throw new Error('Unsupported chain')

    const provider = await this._wagmiConnector?.getProvider()
    const client = createClient({
      account,
      chain: this._chain,
      transport: custom(provider as any),
    })

    return client
  }

  async getConnection(): Promise<Client | null> {
    if (this._debug) console.log('[Metamask Connector]: Getting connection')

    if (!this.isWalletStateAvailable()) {
      if (this._debug) console.log('[Metamask Connector]: Wallet connection state not available')
      return null
    }

    const isAuthorized = await this._wagmiConnector?.isAuthorized()

    if (!isAuthorized) {
      if (this._debug) console.log('[Metamask Connector]: Not authorized')
      return null
    }

    const connections = Array.from(this._wagmiConfig.state.connections.entries())
      .map(([key, { accounts, chainId }]) => (key === this._wagmiConnector?.uid ? { accounts, chainId } : null))
      .filter(Boolean)

    if (connections.length && connections[0]) {
      if (this._debug) console.log('[Metamask Connector]: Found connections:', connections)
      const { accounts } = connections[0]

      return await this._getClient(accounts[0])
    }

    return null
  }

  async newConnection(): Promise<Client | null> {
    try {
      if (this._debug) console.log('[Metamask Connector]: Initializing a new connection')
      if (!this._wagmiConnector) return null

      const isAuthorized = await this._wagmiConnector.isAuthorized()

      if (isAuthorized) {
        const connectedAccounts = await this._wagmiConnector.getAccounts()
        if (!connectedAccounts?.length) return null

        if (this._debug) console.log('[Metamask Connector]: Connected accounts found:', connectedAccounts)
        this.setChain(this._wagmiConfig.chains[0].id)
        localStorage.setItem(MM_APP_METADATA_STORAGE_KEY, JSON.stringify(this._metadata))
        return await this._getClient(connectedAccounts[0])
      }

      const { accounts, chainId } = await connect(this._wagmiConfig, {
        connector: this._wagmiConnector,
        chainId: this._wagmiConfig.chains[0].id,
      })

      this.setChain(chainId)
      localStorage.setItem(MM_APP_METADATA_STORAGE_KEY, JSON.stringify(this._metadata))
      return await this._getClient(accounts[0])
    } catch (e) {
      // wagmi metamask connector is not waiting enough before getting the new chainId,
      // so, in order to have a smooth ux, we catch this error and then remake the connection flow
      if (e.details === 'User rejected switch after adding network.') {
        return await this.newConnection()
      }

      return null
    }
  }

  async checkExtensionPresence(maxAttempts = 3): Promise<boolean> {
    let pollingInterval: ReturnType<typeof setInterval>
    let attempts = maxAttempts - 1

    return new Promise((resolve) => {
      pollingInterval = setInterval(async () => {
        try {
          const ethereum = window.ethereum ?? {}
          const metamaskProvider =
            ethereum.providers?.length > 0 ? ethereum.providers.find((p: any) => p.isMetaMask) : ethereum

          if (this._debug)
            console.log('[Metamask Connector]: Polling metamask wallet extension. Remaining attempts:', attempts + 1)

          if (metamaskProvider) {
            if (this._debug) console.log('[Metamask Connector]: Metamask wallet extension found')
            clearInterval(pollingInterval)
            resolve(true)
          }

          if (attempts === 0 && !metamaskProvider) {
            if (this._debug) console.log('[Metamask Connector]: Could not find metamask wallet extension')
            clearInterval(pollingInterval)
            resolve(false)
          }

          attempts--
        } catch (e) {
          console.error(e)
          clearInterval(pollingInterval)
          resolve(false)
        }
      }, 1000)
    })
  }

  isWalletStateAvailable() {
    return !!localStorage.getItem(MM_APP_METADATA_STORAGE_KEY)
  }

  async wipePairingData() {
    try {
      localStorage.removeItem(MM_APP_METADATA_STORAGE_KEY)
      this._unbindWatchEvents()
      disconnect(this._wagmiConfig, {
        connector: this._wagmiConnector,
      })
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  get isExtensionRequired(): boolean {
    return false
  }

  get sdk(): any {
    return null
  }
}

export default MetamaskConnector
