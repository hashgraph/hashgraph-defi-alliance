import { useMemo, useState, useEffect } from 'react'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useHWContext } from './useHWContext'
import { AccountId } from '@hashgraph/sdk'
import { useWallet } from './useWallet'

interface AccountIdResult {
  accountId?: AccountId
  loading: boolean
}

export function useAccountId<TConnector extends HWBridgeConnector>(connector?: TConnector | null) {
  const wallet = useWallet(connector)
  const { accountIds, getAccountId } = useHWContext()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (wallet.isConnected && !accountIds[wallet.sessionId]) {
        try {
          setLoading(true)
          await getAccountId(wallet)
        } catch (e) {
          console.error('Unable lo load account id.', e)
        } finally {
          setLoading(false)
        }
      }
    })()
  }, [wallet, wallet.isConnected, accountIds])

  return useMemo(
    () =>
      ({
        accountId: accountIds[wallet.sessionId],
        loading,
      } as AccountIdResult),
    [accountIds, loading],
  )
}
