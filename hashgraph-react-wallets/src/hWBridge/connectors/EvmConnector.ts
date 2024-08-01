import { HWBConnectorProps } from './types'
import { BaseConnector } from './BaseConnector'
import { ConnectionStrategyType, ConnectorType } from '../../constants'
import { Config, Connector as WagmiConnector } from 'wagmi'

export abstract class EvmConnector extends BaseConnector {
  static strategy = ConnectionStrategyType.WAGMI
  protected _wagmiConfig: Config
  protected _wagmiConnector?: WagmiConnector

  constructor(id: string, props: HWBConnectorProps) {
    super(props)
    this._type = ConnectorType.ETHEREUM

    this._wagmiConnector = (props.strategy.controller as Config).connectors.find((c) => c.id === id)
  }
}
