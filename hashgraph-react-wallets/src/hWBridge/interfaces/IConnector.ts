import { ConnectionConfig, ConnectorConfig, HNSResult } from '../types'
import { ConnectorType } from '../../constants'
import { Chain } from 'viem'

interface IConnector {
  getConnection(): void

  newConnection(props?: ConnectionConfig): void

  checkExtensionPresence(): Promise<boolean>

  isWalletStateAvailable(): Promise<boolean> | boolean

  wipePairingData(): Promise<boolean>

  resolveHNS(accountId: string): Promise<HNSResult | null>

  get type(): ConnectorType

  get isExtensionRequired(): boolean

  get sdk(): any

  get config(): ConnectorConfig

  get chain(): Chain
}

export default IConnector
