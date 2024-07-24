import { Config } from 'wagmi'
import { HWBridgeConnectorInstance } from './connectors/types'
import { ConnectionConfig, HWBridgeSessionProps, HWBridgeSigner } from './types'
import short from 'short-uuid'
import { ConnectionStrategy, WagmiConnectionStrategy } from './strategies'

export class HWBridgeSession {
  readonly #sessionId: string
  readonly #connector: HWBridgeConnectorInstance
  #signer: HWBridgeSigner | null = null
  #onUpdate: (session?: HWBridgeSession | null) => void
  #isConnected: boolean = false
  #isInitialized: boolean = false
  #isLoading: boolean = false
  #extensionReady: boolean = false
  #autoPaired: boolean = false
  #lastUpdated: number

  constructor({ Connector, onUpdate, debug, config, strategy }: HWBridgeSessionProps) {
    this.#sessionId = short.generate()

    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)

    this.#connector = new Connector({
      debug,
      config,
      onAutoPairing: this.#onAutoPairing.bind(this),
      onDisconnect: this.disconnect,
      strategy,
    })

    this.#onUpdate = (session: HWBridgeSession | null) => {
      this.#lastUpdated = Math.floor(Date.now() / 1000)
      onUpdate(session)
    }

    this.#initSession(strategy)
  }

  isSessionFor(who: HWBridgeConnectorInstance | any): boolean {
    return this.#connector instanceof who
  }

  setSigner(signer: HWBridgeSigner | null) {
    this.#signer = signer
  }

  #onAutoPairing(signer: HWBridgeSigner | null): void {
    this.#signer = signer
    this.#isConnected = !!signer
    this.#autoPaired = true
    this.#onUpdate(this)
  }

  async connect(props?: Partial<ConnectionConfig>): Promise<HWBridgeSession> {
    this.#signer = await this.#connector?.newConnection(props as ConnectionConfig)
    this.#isConnected = !!this.#signer
    this.#isLoading = false
    this.#onUpdate(this)

    return this
  }

  async disconnect(): Promise<boolean> {
    this.#isConnected = !(await this.#connector?.wipePairingData())
    this.setSigner(null)

    this.#isLoading = false
    this.#onUpdate()

    return true
  }

  async #setConnectionState() {
    this.#isInitialized = true

    this.#signer = await this.#connector?.getConnection()
    this.#isConnected = !!this.#signer
    this.#isLoading = false

    this.#onUpdate(this.#signer && this)

    return this
  }

  async #initSession(strategy: ConnectionStrategy): Promise<HWBridgeSession> {
    this.#isLoading = true
    this.#onUpdate()

    return new Promise(async (resolve) => {
      this.#extensionReady = await this.#connector?.checkExtensionPresence()
      this.#isLoading = false

      this.#onUpdate()

      if (strategy instanceof WagmiConnectionStrategy) {
        const wagmiConfig = strategy.controller as Config

        // If there are no mipds, just try getting the native wallets connection state
        if (!wagmiConfig.state.connections.size) {
          resolve(await this.#setConnectionState())
        }

        // Otherwise, wait for wagmi store to be initialized, and detect the active connections
        return wagmiConfig.subscribe(
          async (state) => {
            if (state.status === 'connected' && !this.#isInitialized) {
              const recognizedConnectedChain = strategy.supportedChains.find(({ id }) => id === state.chainId)

              // If an EVM wallet is connected, set the connected chain to the actual connection strategy
              if (recognizedConnectedChain) {
                strategy.setChain(recognizedConnectedChain)
              }

              resolve(await this.#setConnectionState())
            }
          },
          () => null,
        )
      } else {
        return resolve(await this.#setConnectionState())
      }
    })
  }

  get sessionId(): string {
    return this.#sessionId
  }

  get extensionReady(): boolean {
    return this.#extensionReady
  }

  get isExtensionRequired(): boolean {
    return this.#connector.isExtensionRequired
  }

  get isInitialized(): boolean {
    return this.#isInitialized
  }

  get isLoading(): boolean {
    return this.#isLoading
  }

  get isConnected(): boolean {
    return this.#isConnected
  }

  get connector(): HWBridgeConnectorInstance {
    return this.#connector
  }

  get sdk() {
    return this.#connector.sdk
  }

  get signer(): HWBridgeSigner | null {
    return this.#signer
  }

  get autoPaired(): boolean {
    return this.#autoPaired
  }

  get lastUpdated(): number {
    return this.#lastUpdated
  }
}
