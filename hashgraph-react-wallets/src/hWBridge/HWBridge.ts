import { HWBridgeProps, HWBridgeSessionProps } from './types'
import { ConnectorConfig, HWBridgeConnector } from './connectors/types'
import { HWBridgeSession } from './HWBridgeSession'
import { EventEmitter } from 'events'
import Subscription, { ON_SESSION_CHANGE_EVENT } from './events'
import { ConnectionStrategy, HWCConnectionStrategy, WagmiConnectionStrategy } from './strategies'
import { ConnectionStrategyType } from '../constants'
import { Chain } from 'viem'
import { SignClientTypes } from '@walletconnect/types'

class HWBridge {
  readonly #events: EventEmitter
  readonly #metadata: SignClientTypes.Metadata
  readonly #defaultConnector?: HWBridgeConnector
  readonly multiSession: boolean
  readonly debug: boolean
  #sessions: HWBridgeSession[]
  #strategies: ConnectionStrategy[]
  #connectors: HWBridgeConnector[]
  #chains: Chain[]
  #projectId: string

  constructor({
    metadata,
    projectId,
    defaultConnector,
    connectors = [],
    chains = [],
    multiSession = false,
    debug = false,
  }: HWBridgeProps) {
    this.#events = new EventEmitter()
    this.#metadata = metadata
    this.#projectId = projectId
    this.#defaultConnector = defaultConnector
    this.#connectors = connectors
    this.#chains = chains
    this.multiSession = multiSession
    this.debug = debug
  }

  async init(strategies: ConnectionStrategy[]) {
    const defaultConnectionStrategies = [
      new HWCConnectionStrategy({ metadata: this.#metadata, projectId: this.#projectId }),
      new WagmiConnectionStrategy(),
      ...strategies,
    ]

    try {
      this.#strategies = await Promise.all(
        defaultConnectionStrategies.map(async (strategy) => {
          return await strategy.build(this.#chains, this.#connectors)
        }),
      )

      this.#sessions = this.#initSessions(this.#connectors) || []
    } catch (error) {
      console.error('Failed to init the connection strategies.', error)
      throw error
    }
  }

  #initSessions(_connectors: (HWBridgeConnector | [HWBridgeConnector, ConnectorConfig])[]) {
    if (Array.isArray(_connectors) && _connectors.length > 0) {
      return _connectors
        .map((ConnectorType: HWBridgeConnector | [HWBridgeConnector, any]) => {
          const [Connector, config] = Array.isArray(ConnectorType) ? ConnectorType : [ConnectorType]

          return new HWBridgeSession({
            Connector: Connector,
            debug: this.debug,
            config,
            onUpdate: this.#updateBridge.bind(this),
            strategy: this.getStrategy(Connector.strategy),
          } as HWBridgeSessionProps)
        })
        .filter(Boolean)
    } else {
      console.warn('[HWBridge] Initialized without connectors')
      return []
    }
  }

  getStrategy(type: ConnectionStrategyType) {
    return this.#strategies.find((strategy) => strategy.type === type)
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
        if (!this.#sessions?.length) return

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

  get isInitialized(): boolean {
    return this.#sessions.every((session) => session.isInitialized)
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
