import { IStrategy } from '../interfaces'
import { ConnectionController, HWBridgeConnector } from '../types'
import { ConnectionStrategyType } from '../../constants'
import { Chain } from 'viem'

export abstract class ConnectionStrategy implements IStrategy {
  #type: ConnectionStrategyType
  #controller: ConnectionController
  #supportedChains: Chain[]
  #chain: Chain

  constructor(type: ConnectionStrategyType) {
    this.#type = type
  }

  abstract build(chains: Chain[], connectors?: HWBridgeConnector[]): Promise<ConnectionStrategy>

  setController(controller: ConnectionController) {
    this.#controller = controller
  }

  setSupportedChains(chains: Chain[]) {
    this.#supportedChains = chains
    this.#chain = this.#supportedChains[0]
  }

  setChain(chain: Chain): void {
    this.#chain = chain
  }

  get type(): ConnectionStrategyType {
    return this.#type
  }

  get controller(): ConnectionController {
    return this.#controller
  }

  get supportedChains(): Chain[] {
    return this.#supportedChains
  }

  get chain(): Chain {
    return this.#chain
  }
}
