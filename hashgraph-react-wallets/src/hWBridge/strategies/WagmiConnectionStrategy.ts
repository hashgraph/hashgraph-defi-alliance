import { Config, CreateConnectorFn, createConfig } from 'wagmi'
import { ConnectionStrategy } from './ConnectionStrategy'
import { Chain, HttpTransport, http } from 'viem'
import { ConnectionStrategyType, HWBridgeConnector, WagmiConnectorConfig } from '../..'

export type WagmiConnectionInitOpts = Omit<Config, 'chains' | 'connectors'>

export class WagmiConnectionStrategy extends ConnectionStrategy {
  constructor(public options?: WagmiConnectionInitOpts) {
    super(ConnectionStrategyType.WAGMI)
  }

  async build(chains: Chain[], connectors: HWBridgeConnector[] | undefined): Promise<ConnectionStrategy> {
    const transports = chains.reduce((acc, chain) => {
      acc[chain.id] = http()
      return acc
    }, {} as { [key: number]: HttpTransport })

    const controller = createConfig({
      chains: chains as [Chain, ...Chain[]],
      connectors: connectors?.flatMap((item) => {
        if (Array.isArray(item)) {
          const [Connector, config] = item
          return 'wagmiConnector' in Connector ? Connector.wagmiConnector(config as WagmiConnectorConfig) : []
        }
        return 'wagmiConnector' in item ? item.wagmiConnector({} as WagmiConnectorConfig) : []
      }) as CreateConnectorFn[],
      transports,
      ...(this.options ?? {}),
    })

    this.setController(controller)
    this.setSupportedChains(chains)

    return this
  }
}
