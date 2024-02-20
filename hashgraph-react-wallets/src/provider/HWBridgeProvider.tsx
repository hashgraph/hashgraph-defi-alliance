import * as React from 'react'
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react'
import { HWBridge } from '../hWBridge'
import {
  HWBridgeInstance,
  HWBridgeProps,
  HWBridgeDAppMetadata,
  HWBridgeConnector,
  ConnectorConfig,
  WagmiConnectorConfig,
} from '../hWBridge/types'
import { HWBridgeSession } from '../hWBridge/HWBridgeSession'
import { QueryClientProvider } from '@tanstack/react-query'
import { Config, createConfig, CreateConnectorFn, WagmiProvider } from 'wagmi'
import { tanstackQueryClient } from '..'
import { Chain, http, HttpTransport } from 'viem'

interface IProps {
  children: ReactNode | ReactNode[]
  chains: Chain[]
  metadata: HWBridgeDAppMetadata
  defaultConnector?: HWBridgeConnector
  connectors: (HWBridgeConnector | [HWBridgeConnector, ConnectorConfig])[]
  multiSession?: boolean
  debug?: boolean
}

export interface IHWBridgeContext {
  hWBridge?: HWBridgeInstance
  sessions?: HWBridgeSession[] | null
  wagmiConfig: Config
}

export const HWBridgeContext = createContext<IHWBridgeContext | null>(null)

const HWBridgeProvider = ({
  children,
  chains = [],
  metadata,
  defaultConnector,
  connectors = [],
  multiSession = false,
  debug = false,
}: IProps) => {
  if (!chains.length) throw new Error('Please provide chains config')
  if (!connectors.length) throw new Error('Please provide connectors config')

  const wagmiConnectors = connectors
    .map((item) => {
      if (Array.isArray(item)) {
        const [Connector, config] = item
        return 'wagmiConnector' in Connector ? Connector.wagmiConnector(config as WagmiConnectorConfig) : null
      }

      return 'wagmiConnector' in item ? item.wagmiConnector({} as WagmiConnectorConfig) : null
    })
    .filter(Boolean) as CreateConnectorFn[]

  const [context, setContext] = useState<IHWBridgeContext>({
    wagmiConfig: createConfig({
      chains: chains as [Chain, ...Chain[]],
      connectors: wagmiConnectors,
      transports: chains.reduce((acc, chain) => {
        acc[chain.id] = http()
        return acc
      }, {} as { [key: number]: HttpTransport }),
    }),
  })

  useEffect(() => {
    const hWBridge = new HWBridge({
      metadata,
      defaultConnector,
      connectors,
      multiSession,
      debug,
      wagmiConfig: context.wagmiConfig,
    } as HWBridgeProps)

    hWBridge.onUpdate((hWBridge) => {
      setContext((prevState) => ({ ...prevState, hWBridge }))
    })

    setContext((prevState) => ({
      ...prevState,
      hWBridge,
    }))
  }, [connectors])

  const value = useMemo(() => context, [context]) || ({} as IHWBridgeContext)

  return (
    <WagmiProvider config={context?.wagmiConfig}>
      <QueryClientProvider client={tanstackQueryClient}>
        <HWBridgeContext.Provider value={value}>{children}</HWBridgeContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default React.memo(HWBridgeProvider)
