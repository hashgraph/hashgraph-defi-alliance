import { useEffect, useMemo, useState } from 'react'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useHWContext } from './useHWContext'
import { AccountBalance } from '@hashgraph/sdk'
import { useWallet } from './useWallet'

interface IBalanceResult {
  loading: boolean
  balance: AccountBalance
  updateBalance: () => void
}

export function useBalance<TConnector extends HWBridgeConnector>(connector?: TConnector | null) {
  const wallet = useWallet(connector)
  const { balances, getAccountBalance } = useHWContext()
  const [state, setState] = useState<{ loading: boolean; shouldUpdate: boolean }>({
    loading: false,
    shouldUpdate: false,
  })

  const handleUpdateBalance = () => {
    setState((prevState) => ({ ...prevState, shouldUpdate: true }))
  }

  useEffect(() => {
    ;(async () => {
      if (wallet.isConnected && state.shouldUpdate) {
        try {
          setState((prevState) => ({ ...prevState, loading: true }))
          await getAccountBalance(wallet)
        } catch (e) {
          console.error('Unable lo load account balance.', e)
        } finally {
          setState((prevState) => ({ ...prevState, loading: false, shouldUpdate: false }))
        }
      }
    })()
  }, [wallet, wallet.isConnected, balances, state.shouldUpdate])

  return useMemo(
    () =>
      ({
        loading: state.loading,
        balance: balances[wallet.sessionId],
        updateBalance: handleUpdateBalance,
      } as IBalanceResult),
    [balances, state.loading],
  )
}
