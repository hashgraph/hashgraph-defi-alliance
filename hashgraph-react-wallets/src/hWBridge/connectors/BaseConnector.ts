import { Chain } from 'viem'
import { IConnector } from '../interfaces'
import { ConnectionConfig, HNSResult, HWBridgeDAppMetadata } from '../types'
import { ConnectorConfig, HWBConnectorProps } from './types'
import { ConnectorType, HederaNetworks } from '../../constants'
import { Config } from 'wagmi'
import { getChainById } from '../../utils'
import { HederaNetwork } from '../../types'

export abstract class BaseConnector implements IConnector {
  protected readonly _metadata: HWBridgeDAppMetadata
  protected readonly _debug: boolean
  protected _network: HederaNetwork
  protected _wagmiConfig: Config
  protected _config: ConnectorConfig
  protected _type: ConnectorType = ConnectorType.HEDERA
  protected _chain: Chain | null

  constructor({ metadata, wagmiConfig, config, debug = false }: HWBConnectorProps) {
    this._metadata = metadata
    this._wagmiConfig = wagmiConfig
    this._config = config as ConnectorConfig
    this._debug = debug
  }

  abstract getConnection(): Promise<any>
  abstract newConnection(props: ConnectionConfig): Promise<any>
  abstract wipePairingData(): Promise<boolean>
  abstract get sdk(): any

  setChain(chainId: number): Chain | null {
    this._chain = getChainById(this._wagmiConfig.chains, chainId)
    if (this._chain) this._network = HederaNetworks[this._chain.id]

    return this.chain
  }

  async checkExtensionPresence(): Promise<boolean> {
    return true
  }
  isWalletStateAvailable(): boolean | Promise<boolean> {
    return true
  }
  async resolveHNS(accountId: string): Promise<HNSResult | null> {
    if (this._config.hnsResolver) {
      const resolver = new this._config.hnsResolver({ network: this._network })
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

  get network(): HederaNetwork {
    return this._network
  }

  get chain() {
    return this._chain
  }
}
