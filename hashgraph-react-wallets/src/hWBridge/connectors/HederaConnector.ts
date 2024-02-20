import { HWBConnectorProps } from './types'
import { BaseConnector } from './BaseConnector'
import { ConnectorType } from '../../constants'

export abstract class HederaConnector extends BaseConnector {
  constructor(props: HWBConnectorProps) {
    super(props)
    this._type = ConnectorType.HEDERA
    this.setChain(this._wagmiConfig.chains[0].id)
  }
}
