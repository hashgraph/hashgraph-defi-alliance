import { HWBConnectorProps, HWBridgeConnector } from './connectors/types'
import { HWBridge } from './index'
import { HWBridgeSession } from './HWBridgeSession'
import { HashpackDAppMetadata, HashConnectWallet } from './connectors/HashpackConnector/types'
import { BladeDAppMetadata, BladeWallet } from './connectors/BladeConnector/types'
import { MagicWallet } from './connectors/MagicConnector/MagicWallet'
import { MagicLoginConfig } from './connectors/MagicConnector/types'
import { Client } from 'viem'
import { Config } from 'wagmi'

export type HWBridgeDAppMetadata = HashpackDAppMetadata | BladeDAppMetadata

export type HWBridgeProps = {
  metadata: HWBridgeDAppMetadata
  defaultConnector?: HWBridgeConnector
  connectors: HWBridgeConnector[]
  multiSession?: boolean
  debug?: boolean
  wagmiConfig: Config
}

export type ConnectionConfig = MagicLoginConfig

export type HederaSignerType = HashConnectWallet | BladeWallet
export type EthereumSignerType = Client
export type OtherSignerType = MagicWallet

export type HWBridgeSigner = HederaSignerType | EthereumSignerType | OtherSignerType

export type HWBridgeSessionProps = {
  Connector: any
  onUpdate: (session?: HWBridgeSession | null) => void
} & HWBConnectorProps

export type HWBridgeInstance = InstanceType<typeof HWBridge>

export * from './interfaces/IConnector'
export * from './connectors/types'
export * from './hnsResolvers/types'
