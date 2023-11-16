import { useMemo, useState, useEffect } from 'react'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useHWContext } from './useHWContext'
import { useWallet } from './useWallet'
import { HNSResult } from '../hWBridge/types'

interface IHNSNameResult extends HNSResult {
  loading: boolean
}

export function useHNS<TConnector extends HWBridgeConnector>(connector?: TConnector | null) {
  const wallet = useWallet(connector)
  const { hns, getHNSName } = useHWContext()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (wallet.isConnected && !hns.hasOwnProperty(wallet.sessionId)) {
        try {
          setLoading(true)
          await getHNSName(wallet)
        } catch (e) {
          console.error('Unable lo load your HNS name.', e)
        } finally {
          setLoading(false)
        }
      }
    })()
  }, [wallet, wallet.isConnected, hns])

  return useMemo(
    () =>
      ({
        ...hns[wallet.sessionId],
        loading,
      } as IHNSNameResult),
    [hns, loading],
  )
}
