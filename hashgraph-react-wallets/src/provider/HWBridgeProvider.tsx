import * as React from 'react'
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react'
import { HWBridge } from '../hWBridge'
import {
  HederaNetwork,
  HWBridgeInstance,
  HWBridgeProps,
  HWBridgeDAppMetadata,
  HWBridgeConnector,
  ConnectorConfig,
} from '../hWBridge/types'
import { HWBridgeSession } from '../hWBridge/HWBridgeSession'
import HWContextProvider from './HWContextProvider'

interface IProps {
  children: ReactNode | ReactNode[]
  network: HederaNetwork
  metadata: HWBridgeDAppMetadata
  defaultConnector?: HWBridgeConnector
  connectors: (HWBridgeConnector | [HWBridgeConnector, ConnectorConfig])[]
  multiSession?: boolean
  debug?: boolean
}

export interface IHWBridgeContext {
  hWBridge?: HWBridgeInstance
  sessions?: HWBridgeSession[] | null
}

export const HWBridgeContext = createContext<IHWBridgeContext | null>(null)

const HWBridgeProvider = ({
  children,
  network,
  metadata,
  defaultConnector,
  connectors = [],
  multiSession = false,
  debug = false,
}: IProps) => {
  const [context, setContext] = useState<IHWBridgeContext>()

  useEffect(() => {
    const hWBridge = new HWBridge({
      network,
      metadata,
      defaultConnector,
      connectors,
      multiSession,
      debug,
    } as HWBridgeProps)

    hWBridge.onUpdate((hWBridge) => {
      setContext((prevState) => ({ ...prevState, hWBridge }))
    })

    setContext((prevState) => ({ ...prevState, hWBridge }))
  }, [connectors])

  const value = useMemo(() => context, [context]) || ({} as IHWBridgeContext)

  return (
    <HWBridgeContext.Provider value={value}>
      <HWContextProvider>{children}</HWContextProvider>
    </HWBridgeContext.Provider>
  )
}

export default React.memo(HWBridgeProvider)
