import { useMemo } from 'react'
import { BladeSDK, HWBridgeConnector, HashConnectSDK, MagicSDK } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'

type ConnectorSDKs = HashConnectSDK | BladeSDK | MagicSDK

export function useWalletSDK<T extends ConnectorSDKs>(connector?: HWBridgeConnector | null) {
  const wallet = useWallet(connector)

  return useMemo(() => {
    try {
      if (!wallet.isConnected) return null

      return wallet.sdk as T
    } catch (e) {
      console.error('Unable lo load the SDK', e)
      return null
    }
  }, [wallet])
}
