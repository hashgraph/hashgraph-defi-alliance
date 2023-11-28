import { HWBridgeConnectorInstance } from './connectors/types'
import { ConnectionConfig, HWBridgeSessionProps, HWBridgeSigner } from './types'
import short from 'short-uuid'

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

  constructor({ Connector, onUpdate, network, metadata, debug, config }: HWBridgeSessionProps) {
    this.#sessionId = short.generate()
    this.#connector = new Connector({
      network,
      metadata,
      debug,
      config,
      onAutoPairing: this.#_onAutoPairing.bind(this),
    })

    this.#onUpdate = onUpdate
    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.#_initSession()
  }

  isSessionFor(who: HWBridgeConnectorInstance | any): boolean {
    return this.#connector instanceof who
  }

  setSigner(signer: HWBridgeSigner | null) {
    this.#signer = signer
  }

  #_onAutoPairing(signer: HWBridgeSigner): void {
    this.#signer = signer
    this.#isConnected = !!signer
    this.#autoPaired = true
    this.#onUpdate(this)
  }

  async connect(props?: Partial<ConnectionConfig>): Promise<HWBridgeSession> {
    this.#isLoading = true
    this.#onUpdate(this)

    this.#signer = await this.#connector?.newConnection(props as ConnectionConfig)
    this.#isConnected = !!this.#signer

    this.#isLoading = false
    this.#onUpdate(this)

    return this
  }

  async disconnect(): Promise<boolean> {
    this.#isLoading = true
    this.#onUpdate()

    this.#isConnected = !(await this.#connector?.wipePairingData())
    this.setSigner(null)

    this.#isLoading = false
    this.#onUpdate()

    return true
  }

  async #_initSession(): Promise<HWBridgeSession> {
    this.#isLoading = true
    this.#onUpdate()

    this.#extensionReady = await this.#connector?.checkExtensionPresence()
    this.#signer = await this.#connector?.getConnection()
    this.#isInitialized = true
    this.#isConnected = !!this.#signer
    this.#isLoading = false

    this.#onUpdate(this.#signer && this)

    return this
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
}
