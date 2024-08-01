import { useMemo } from 'react'
import { HWBridgeConnector, DappConnectorSDK, WagmiSDK, MagicSDK } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'

type ConnectorSDKs = DappConnectorSDK | WagmiSDK | MagicSDK

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
