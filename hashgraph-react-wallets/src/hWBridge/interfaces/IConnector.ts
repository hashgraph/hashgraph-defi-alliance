import { Chain } from 'viem'
import { ConnectionConfig, ConnectorConfig, HNSResult } from '../types'
import { ConnectorType } from '../../constants'

interface IConnector {
  getConnection(): void

  newConnection(props?: ConnectionConfig): void

  checkExtensionPresence(): Promise<boolean>

  isWalletStateAvailable(): Promise<boolean> | boolean

  wipePairingData(): Promise<boolean>

  resolveHNS(accountId: string): Promise<HNSResult | null>

  setChain(chainId: number): void

  get type(): ConnectorType

  get isExtensionRequired(): boolean

  get sdk(): any

  get config(): ConnectorConfig

  get chain(): Chain | null
}

export default IConnector
