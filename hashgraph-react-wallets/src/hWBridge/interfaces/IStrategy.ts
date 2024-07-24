import { Chain } from 'viem'
import { ConnectionController, ConnectionStrategy, ConnectionStrategyType, HWBridgeConnector } from '../..'

interface IStrategy {
  build(chains: Chain[], connectors?: HWBridgeConnector[]): Promise<ConnectionStrategy>
  setController(controller: ConnectionController): void
  setSupportedChains(chains: Chain[]): void
  setChain(chain: Chain): void
  get type(): ConnectionStrategyType
  get controller(): ConnectionController
  get supportedChains(): Chain[]
  get chain(): Chain
}

export default IStrategy
