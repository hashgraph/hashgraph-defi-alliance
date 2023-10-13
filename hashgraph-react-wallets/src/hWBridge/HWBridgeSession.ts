import { HWBridgeConnectorInstance } from './connectors/types'
import { HWBridgeSessionProps, HWBridgeSigner } from './types'
import short from 'short-uuid'

export class HWBridgeSession {
  readonly #sessionId: string
  readonly #connector: HWBridgeConnectorInstance
  #signer: HWBridgeSigner | null = null
  #onUpdate: (session?: HWBridgeSession | null) => void
  #isConnected: boolean = false
  #isInitialized: boolean = false
  #extensionReady: boolean = false
  #autoPaired: boolean = false

  constructor({ Connector, onUpdate, network, metadata, debug }: HWBridgeSessionProps) {
    this.#sessionId = short.generate()
    this.#connector = new Connector({
      network,
      metadata,
      debug,
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
    this.#autoPaired = true;
    this.#onUpdate(this)
  }

  async connect(): Promise<HWBridgeSession> {
    this.#signer = await this.#connector?.newConnection()
    this.#isConnected = !!this.#signer
    this.#onUpdate(this)

    return this
  }

  async disconnect(): Promise<boolean> {
    this.#isConnected = !(await this.#connector?.wipePairingData())
    this.setSigner(null)
    this.#onUpdate()

    return true
  }

  async #_initSession(): Promise<HWBridgeSession> {
    this.#extensionReady = await this.#checkExtensionPresence()
    this.#signer = await this.#connector?.getConnection()
    this.#isInitialized = true
    this.#isConnected = !!this.#signer
    this.#onUpdate(this.#signer && this)

    return this
  }

  async #checkExtensionPresence(): Promise<boolean> {
    return await this.#connector?.checkExtensionPresence()
  }

  get sessionId(): string {
    return this.#sessionId
  }

  get extensionReady(): boolean {
    return this.#extensionReady
  }

  get isInitialized(): boolean {
    return this.#isInitialized
  }

  get isConnected(): boolean {
    return this.#isConnected
  }

  get connector(): HWBridgeConnectorInstance {
    return this.#connector
  }

  get signer(): HWBridgeSigner | null {
    return this.#signer
  }

  get autoPaired(): boolean {
    return this.#autoPaired
  }
}
