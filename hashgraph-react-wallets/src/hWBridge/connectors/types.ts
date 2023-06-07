import { HashpackConnector } from './HashpackConnector'
import { BladeConnector } from './BladeConnector'
import { HWBridgeDAppMetadata, HWBridgeSigner, HederaNetwork } from '../types'

export type HWBridgeConnector = typeof HashpackConnector | typeof BladeConnector
export type HWBridgeConnectorInstance = InstanceType<typeof HashpackConnector | typeof BladeConnector>

export type HWBConnectorProps = {
  network: HederaNetwork
  metadata: HWBridgeDAppMetadata
  debug: boolean
  onAutoPairing?: (signer: HWBridgeSigner) => void
}

export * from './HashpackConnector/types'
export * from './BladeConnector/types'
