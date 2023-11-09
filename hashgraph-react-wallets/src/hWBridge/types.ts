import { HWBConnectorProps, HWBridgeConnector } from './connectors/types'
import { HWBridge } from './index'
import { HWBridgeSession } from './HWBridgeSession'
import { HashpackDAppMetadata, HashConnectWallet } from './connectors/HashpackConnector/types'
import { BladeDAppMetadata, BladeWallet } from './connectors/BladeConnector/types'
import { MagicWallet } from './connectors/MagicConnector/MagicWallet'
import { MagicLoginConfig } from './connectors/MagicConnector/types'

export type HederaNetwork = 'testnet' | 'mainnet'
export type HWBridgeDAppMetadata = HashpackDAppMetadata | BladeDAppMetadata

export type HWBridgeProps = {
  network: HederaNetwork
  metadata: HWBridgeDAppMetadata
  defaultConnector?: HWBridgeConnector
  connectors: HWBridgeConnector[]
  multiSession?: boolean
  debug?: boolean
}

export type ConnectionConfig = MagicLoginConfig

export type HWBridgeSigner = HashConnectWallet | BladeWallet | MagicWallet

export type HWBridgeSessionProps = {
  Connector: any
  onUpdate: (session?: HWBridgeSession | null) => void
} & HWBConnectorProps

export type HWBridgeInstance = InstanceType<typeof HWBridge>

export * from './interfaces/IConnector'
export * from './connectors/types'
