import { IConnector } from '../interfaces'
import { ConnectionConfig, HNSResult } from '../types'
import { ConnectorConfig, HWBConnectorProps } from './types'
import { ConnectionStrategyType, ConnectorType } from '../../constants'
import { ConnectionStrategy } from '../strategies'
import { chainToNetworkName } from '../../utils'

export abstract class BaseConnector implements IConnector {
  static strategy = ConnectionStrategyType.UNKNOWN

  protected readonly _debug: boolean
  protected _strategy: ConnectionStrategy
  protected _config: ConnectorConfig
  protected _type: ConnectorType = ConnectorType.HEDERA

  constructor({ strategy, config, debug = false }: HWBConnectorProps) {
    if (!strategy) throw new Error('There is no strategy set for this connector.')

    this._strategy = strategy
    this._config = config as ConnectorConfig
    this._debug = debug
  }

  abstract getConnection(): Promise<any>
  abstract newConnection(props: ConnectionConfig): Promise<any>
  abstract wipePairingData(): Promise<boolean>
  abstract get sdk(): any

  async checkExtensionPresence(): Promise<boolean> {
    return true
  }
  isWalletStateAvailable(): boolean | Promise<boolean> {
    return true
  }
  async resolveHNS(accountId: string): Promise<HNSResult | null> {
    if (this._config.hnsResolver) {
      const resolver = new this._config.hnsResolver({ network: chainToNetworkName(this._strategy.chain) })
      return await resolver.get(accountId)
    }

    return null
  }

  get type(): ConnectorType {
    return this._type
  }

  get isExtensionRequired() {
    return true
  }

  get config(): ConnectorConfig {
    return this._config
  }

  get chain() {
    return this._strategy.chain
  }
}
