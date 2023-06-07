import { useEffect, useMemo, useState } from 'react'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { AccountBalance } from '@hashgraph/sdk'

interface IBalanceState {
  balance: AccountBalance | null
  loading: boolean
  shouldUpdate: boolean
}

export function useBalance<TConnector extends HWBridgeConnector>(connector?: TConnector) {
  const wallet = useWallet(connector)
  const [accountBalance, setAccountBalance] = useState<IBalanceState>({
    balance: null,
    loading: false,
    shouldUpdate: true,
  })

  useEffect(() => {
    ;(async () => {
      if (!wallet.isConnected || !accountBalance.shouldUpdate) return
      const sessions = Array.isArray(wallet) ? wallet : [wallet]
      const connectedSession = connector ? sessions.find((session) => session.isSessionFor(connector)) : sessions[0]

      if (connectedSession && connectedSession.signer) {
        const balance = await connectedSession.signer.getAccountBalance()
        setAccountBalance((prevState) => ({ ...prevState, balance, loading: false, shouldUpdate: false }))
        return
      }

      setAccountBalance((prevState) => ({ ...prevState, loading: false }))
    })()
  }, [wallet.isConnected, accountBalance.shouldUpdate])

  return useMemo(
    () => ({
      ...accountBalance,
      updateBalance: () => setAccountBalance((prevState) => ({ ...prevState, shouldUpdate: true, loading: true })),
    }),
    [accountBalance.balance, accountBalance.loading],
  )
}
