import { HWBConnectorProps, HWBridgeConnector } from './connectors/types'
import { HWBridge } from './index'
import { HWBridgeSession } from './HWBridgeSession'
import { HashpackDAppMetadata, HashConnectWallet } from './connectors/HashpackConnector/types'
import { BladeDAppMetadata, BladeWallet } from './connectors/BladeConnector/types'

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

export type HWBridgeSigner = HashConnectWallet | BladeWallet

export type HWBridgeSessionProps = {
  Connector: any
  onUpdate: (session?: HWBridgeSession | null) => void
} & HWBConnectorProps

export type HWBridgeInstance = InstanceType<typeof HWBridge>

export * from './interfaces/IConnector';
export * from './connectors/types'
