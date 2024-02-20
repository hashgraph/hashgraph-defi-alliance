import { HashpackConnector } from './HashpackConnector'
import { BladeConnector } from './BladeConnector'
import { HNSResolver, HWBridgeDAppMetadata, HWBridgeSigner, MagicConfig } from '../types'
import { MagicConnector } from './MagicConnector'
import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider'
import { HederaExtension } from '@magic-ext/hedera'
import { Config } from 'wagmi'
import { MetamaskConnectorConfig } from './MetamaskConnector/types'
import { MetamaskConnector } from './MetamaskConnector'

export type HWBridgeConnector =
  | typeof HashpackConnector
  | typeof BladeConnector
  | typeof MagicConnector
  | typeof MetamaskConnector

export type HWBridgeConnectorInstance = InstanceType<
  typeof HashpackConnector | typeof BladeConnector | typeof MagicConnector | typeof MetamaskConnector
>

export type WagmiConnectorConfig = MetamaskConnectorConfig

export type ConnectorConfig = {
  icons?: {
    white?: string
    dark?: string
  }
  hnsResolver?: HNSResolver
} & MagicConfig &
  Partial<WagmiConnectorConfig>

export type HWBConnectorProps = {
  metadata: HWBridgeDAppMetadata
  debug: boolean
  config?: ConnectorConfig
  onAutoPairing: (signer: HWBridgeSigner | null) => void
  wagmiConfig: Config
}

export type MagicSDK = InstanceWithExtensions<SDKBase, HederaExtension[]>
export type { HashConnect as HashConnectSDK } from 'hashconnect'
export type { BladeConnector as BladeSDK } from '@bladelabs/blade-web3.js'

export * from './HashpackConnector/types'
export * from './BladeConnector/types'
export * from './MagicConnector/types'
