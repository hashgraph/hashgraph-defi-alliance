import * as React from 'react'
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react'
import { ConnectionStrategy, HWBridge } from '../hWBridge'
import { HWBridgeInstance, HWBridgeProps, HWBridgeConnector, ConnectorConfig } from '../hWBridge/types'
import { QueryClientProvider } from '@tanstack/react-query'
import { Config, WagmiProvider } from 'wagmi'
import { ConnectionStrategyType, tanstackQueryClient } from '..'
import { Chain } from 'viem'
import { SignClientTypes } from '@walletconnect/types'

interface IProps {
  children: ReactNode | ReactNode[]
  LoadingFallback?: () => JSX.Element
  metadata: SignClientTypes.Metadata
  projectId?: string
  defaultConnector?: HWBridgeConnector
  strategies: ConnectionStrategy[]
  connectors: (HWBridgeConnector | [HWBridgeConnector, ConnectorConfig])[]
  chains: Chain[]
  multiSession?: boolean
  debug?: boolean
}

export interface IHWBridgeContext {
  hWBridge: HWBridgeInstance | null
}

export const HWBridgeContext = createContext<IHWBridgeContext | null>(null)

const DefaultLoadingFallback = () => <div>Loading...</div>

const HWBridgeProvider = ({
  children,
  LoadingFallback = DefaultLoadingFallback,
  metadata,
  projectId,
  defaultConnector,
  strategies = [],
  connectors = [],
  chains = [],
  multiSession = false,
  debug = false,
}: IProps) => {
  if (!chains.length) throw new Error('Please provide chains config')
  if (!connectors.length) throw new Error('Please provide connectors config')
  if (!projectId) throw new Error('WalletConnect project id is required')

  const [context, setContext] = useState<IHWBridgeContext>({ hWBridge: null })

  useEffect(() => {
    ;(async () => {
      const hWBridge = new HWBridge({
        metadata,
        defaultConnector,
        connectors,
        chains,
        projectId,
        multiSession,
        debug,
      } as HWBridgeProps)

      await hWBridge.init(strategies)

      hWBridge.onUpdate((hWBridge) => {
        setContext((prevState) => ({ ...prevState, hWBridge }))
      })

      setContext((prevState) => ({
        ...prevState,
        hWBridge,
      }))
    })()
  }, [connectors])

  const value = useMemo(() => context, [context]) || ({} as IHWBridgeContext)

  const bridgeJSX = (
    <QueryClientProvider client={tanstackQueryClient}>
      <HWBridgeContext.Provider value={value}>
        {context.hWBridge?.isInitialized ? children : <LoadingFallback />}
      </HWBridgeContext.Provider>
    </QueryClientProvider>
  )

  const wagmiConfig = context.hWBridge?.getStrategy(ConnectionStrategyType.WAGMI)?.controller as Config

  return wagmiConfig ? <WagmiProvider config={wagmiConfig}>{bridgeJSX}</WagmiProvider> : bridgeJSX
}

export default React.memo(HWBridgeProvider)
