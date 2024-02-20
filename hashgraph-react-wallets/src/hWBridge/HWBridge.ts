import { HWBridgeDAppMetadata, HWBridgeProps, HWBridgeSessionProps } from './types'
import { ConnectorConfig, HWBridgeConnector } from './connectors/types'
import { HWBridgeSession } from './HWBridgeSession'
import { EventEmitter } from 'events'
import Subscription, { ON_SESSION_CHANGE_EVENT } from './events'
import { Config } from 'wagmi'

class HWBridge {
  readonly #events: EventEmitter
  readonly #metadata?: HWBridgeDAppMetadata
  readonly #defaultConnector?: HWBridgeConnector
  readonly multiSession: boolean
  readonly debug: boolean
  #sessions: HWBridgeSession[]

  constructor({
    metadata,
    defaultConnector,
    connectors = [],
    multiSession = false,
    debug = false,
    wagmiConfig = {} as Config,
  }: HWBridgeProps) {
    this.#events = new EventEmitter()
    this.#metadata = metadata
    this.#defaultConnector = defaultConnector
    this.multiSession = multiSession
    this.debug = debug
    this.#sessions = this.#initSessions(connectors, wagmiConfig) || []
  }

  #initSessions(_connectors: (HWBridgeConnector | [HWBridgeConnector, ConnectorConfig])[], wagmiConfig: Config) {
    if (Array.isArray(_connectors) && _connectors.length > 0) {
      return _connectors
        .map((ConectorType: HWBridgeConnector | [HWBridgeConnector, any]) => {
          const [Connector, config] = Array.isArray(ConectorType) ? ConectorType : [ConectorType]

          return new HWBridgeSession({
            Connector: Connector,
            metadata: this.#metadata,
            debug: this.debug,
            config,
            onUpdate: this.#updateBridge.bind(this),
            wagmiConfig,
          } as HWBridgeSessionProps)
        })
        .filter(Boolean)
    } else {
      console.warn('[HWBridge] Initialized without connectors')
      return []
    }
  }

  getSessionFor<T extends HWBridgeConnector>(who: T): HWBridgeSession {
    return this.#sessions.find((session) => session.isSessionFor(who)) as HWBridgeSession
  }

  onUpdate(callback: (hWBridge: HWBridge) => void): Subscription<HWBridge, void> {
    return new Subscription(this.#events, ON_SESSION_CHANGE_EVENT, callback)
  }

  async #updateBridge(newConnection?: HWBridgeSession | null) {
    if (newConnection) {
      if (!this.multiSession) {
        this.#sessions = await Promise.all(
          this.#sessions.map(async (session) => {
            if (session.sessionId === newConnection.sessionId) return session
            if (session.isConnected) await session.disconnect()

            return session
          }),
        )
      }
    }

    this.#events.emit(ON_SESSION_CHANGE_EVENT, this)
  }

  get isMultiSession(): boolean {
    return this.multiSession
  }

  get connectedSessions(): HWBridgeSession[] {
    if (!this.multiSession) {
      return [this.#sessions.find(({ isConnected }) => isConnected)].filter(Boolean) as HWBridgeSession[]
    }

    return this.#sessions.filter(({ isConnected }) => isConnected)
  }

  get defaultConnector(): HWBridgeConnector | undefined {
    return this.#defaultConnector
  }
}

export default HWBridge
