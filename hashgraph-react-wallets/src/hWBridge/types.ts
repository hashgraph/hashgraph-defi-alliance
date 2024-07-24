import { HWBConnectorProps, HWBridgeConnector } from './connectors/types'
import { HWBridge } from './index'
import { HWBridgeSession } from './HWBridgeSession'
import { MagicWallet } from './connectors/MagicConnector/MagicWallet'
import { MagicLoginConfig } from './connectors/MagicConnector/types'
import { Chain, Client } from 'viem'
import { Config as WagmiConfig } from 'wagmi'
import { DAppConnector, DAppSigner } from '@hashgraph/hedera-wallet-connect'
import { SignClientTypes } from '@walletconnect/types'

export type HWBridgeProps = {
  metadata: SignClientTypes.Metadata
  projectId: string
  defaultConnector?: HWBridgeConnector
  connectors: HWBridgeConnector[]
  chains: Chain[]
  multiSession?: boolean
  debug?: boolean
}

export type ConnectionController = WagmiConfig | DAppConnector
export type ConnectionConfig = MagicLoginConfig

export type HederaSignerType = DAppSigner
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
