import { HWBConnectorProps } from './types'
import { BaseConnector } from './BaseConnector'
import { ConnectionStrategyType, ConnectorType } from '../../constants'

export abstract class HederaConnector extends BaseConnector {
  static strategy = ConnectionStrategyType.HWC

  constructor(props: HWBConnectorProps) {
    super(props)
    this._type = ConnectorType.HEDERA
  }
}
