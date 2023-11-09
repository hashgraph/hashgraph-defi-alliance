import { ConnectionConfig } from '../types'

interface IConnector {
  getConnection(): void

  newConnection(props?: ConnectionConfig): void

  checkExtensionPresence(): Promise<boolean>

  isWalletStateAvailable(): Promise<boolean> | boolean

  wipePairingData(): Promise<boolean>

  getSdk(): any
}

export default IConnector
