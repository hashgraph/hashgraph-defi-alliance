import { HashpackConnector } from './HashpackConnector'
import { BladeConnector } from './BladeConnector'
import { HNSResolver, HWBridgeDAppMetadata, HWBridgeSigner, HederaNetwork, MagicConfig } from '../types'
import { MagicConnector } from './MagicConnector'
import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider'
import { HederaExtension } from '@magic-ext/hedera'

export type HWBridgeConnector = typeof HashpackConnector | typeof BladeConnector | typeof MagicConnector

export type HWBridgeConnectorInstance = InstanceType<
  typeof HashpackConnector | typeof BladeConnector | typeof MagicConnector
>

export type ConnectorConfig = {
  icons?: {
    white?: string
    dark?: string
  }
  hnsResolver?: HNSResolver
} & MagicConfig

export type HWBConnectorProps = {
  network: HederaNetwork
  metadata: HWBridgeDAppMetadata
  debug: boolean
  config?: ConnectorConfig
  onAutoPairing?: (signer: HWBridgeSigner) => void
}

export type MagicSDK = InstanceWithExtensions<SDKBase, HederaExtension[]>
export type { HashConnect as HashConnectSDK } from 'hashconnect'
export type { BladeConnector as BladeSDK } from '@bladelabs/blade-web3.js'

export * from './HashpackConnector/types'
export * from './BladeConnector/types'
export * from './MagicConnector/types'
