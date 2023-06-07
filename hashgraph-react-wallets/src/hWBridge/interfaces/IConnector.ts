interface IConnector {
  getConnection(): void

  newConnection(): void

  checkExtensionPresence(): Promise<boolean>

  isWalletStateAvailable(): Promise<boolean> | boolean

  wipePairingData(): Promise<boolean>
}

export default IConnector
