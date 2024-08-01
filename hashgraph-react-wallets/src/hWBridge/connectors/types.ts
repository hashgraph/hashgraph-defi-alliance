import { HNSResolver, HWBridgeSigner, MagicConfig } from '../types'
import { MagicConnector } from './MagicConnector'
import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider'
import { HederaExtension } from '@magic-ext/hedera'
import { MetamaskConnectorConfig } from './MetamaskConnector/types'
import { MetamaskConnector } from './MetamaskConnector'
import { ConnectionStrategy } from '../strategies'
import { Chain } from 'viem'
import { HWCConnector } from './HWCConnector'

export type HWBridgeConnector = typeof HWCConnector | typeof MagicConnector | typeof MetamaskConnector

export type HWBridgeConnectorInstance = InstanceType<
  typeof HWCConnector | typeof MagicConnector | typeof MetamaskConnector
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
  debug: boolean
  config?: ConnectorConfig
  extensionId?: string
  onAutoPairing: (signer: HWBridgeSigner | null) => void
  onDisconnect: () => Promise<boolean>
  chain: Chain
  strategy: ConnectionStrategy
}

export type MagicSDK = InstanceWithExtensions<SDKBase, HederaExtension[]>
export type { DAppConnector as DappConnectorSDK } from '@hashgraph/hedera-wallet-connect'
export type { Config as WagmiSDK } from 'wagmi'

export * from './MagicConnector/types'
