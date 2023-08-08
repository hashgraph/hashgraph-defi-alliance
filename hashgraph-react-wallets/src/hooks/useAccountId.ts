import { useEffect, useMemo, useState } from 'react'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { AccountId } from '@hashgraph/sdk'

interface IAccountIdResult {
  accountId: AccountId | null
  loading: boolean
}

export function useAccountId<TConnector extends HWBridgeConnector>(connector?: TConnector) {
  const wallet = useWallet(connector)
  const [accountIdResult, setAccountIdResult] = useState<IAccountIdResult>({
    accountId: null,
    loading: false,
  })

  useEffect(() => {
    ;(async () => {
      if (!wallet.isConnected) return
      const sessions = Array.isArray(wallet) ? wallet : [wallet]
      const connectedSession = connector ? sessions.find((session) => session.isSessionFor(connector)) : sessions[0]

      if (connectedSession && connectedSession.signer) {
        const accountId = connectedSession.signer.getAccountId()
        setAccountIdResult((prevState) => ({ ...prevState, accountId, loading: false }))
        return
      }

      setAccountIdResult((prevState) => ({ ...prevState, loading: false }))
    })()
  }, [wallet.isConnected])

  return useMemo(() => accountIdResult, [accountIdResult.accountId, accountIdResult.loading])
}
