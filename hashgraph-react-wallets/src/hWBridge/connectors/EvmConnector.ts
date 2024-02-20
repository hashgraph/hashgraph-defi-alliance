import { HWBConnectorProps } from './types'
import { BaseConnector } from './BaseConnector'
import { ConnectorType } from '../../constants'
import { Connector } from 'wagmi'

export abstract class EvmConnector extends BaseConnector {
  protected _wagmiConnector?: Connector

  constructor(id: string, props: HWBConnectorProps) {
    super(props)
    this._type = ConnectorType.ETHEREUM
    this._wagmiConnector = props.wagmiConfig.connectors.find((c) => c.id === id)
    this.setChain(this._wagmiConfig.state.chainId)
  }
}
