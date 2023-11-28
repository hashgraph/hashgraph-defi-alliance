import { AccountId } from '@hashgraph/sdk'
import { ConnectionConfig, ConnectorConfig, HNSResult } from '../types'

interface IConnector {
  getConnection(): void

  newConnection(props?: ConnectionConfig): void

  checkExtensionPresence(): Promise<boolean>

  isWalletStateAvailable(): Promise<boolean> | boolean

  wipePairingData(): Promise<boolean>

  resolveHNS(accountId: AccountId): Promise<HNSResult | null>

  get isExtensionRequired(): boolean

  get sdk(): any

  get config(): ConnectorConfig
}

export default IConnector
