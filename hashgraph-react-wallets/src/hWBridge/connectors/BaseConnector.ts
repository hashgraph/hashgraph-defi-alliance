import { AccountId } from '@hashgraph/sdk'
import { IConnector } from '../interfaces'
import { ConnectionConfig, HNSResult, HWBridgeDAppMetadata, HederaNetwork } from '../types'
import { ConnectorConfig, HWBConnectorProps } from './types'

abstract class BaseConnector implements IConnector {
  protected readonly _network: HederaNetwork
  protected readonly _metadata: HWBridgeDAppMetadata
  protected _config: ConnectorConfig
  protected readonly _debug: boolean

  constructor({ network, metadata, config, debug = false }: HWBConnectorProps) {
    this._network = network
    this._metadata = metadata
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
  async resolveHNS(accountId: AccountId): Promise<HNSResult | null> {
    if (this._config.hnsResolver) {
      const resolver = new this._config.hnsResolver({ network: this._network })
      return await resolver.get(accountId)
    }

    return null
  }

  get config(): ConnectorConfig {
    return this._config
  }
}

export default BaseConnector
