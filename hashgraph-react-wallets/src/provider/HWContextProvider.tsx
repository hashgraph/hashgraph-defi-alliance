import * as React from 'react'
import { ReactNode, createContext, useEffect, useMemo, useState } from 'react'
import { useConnectedWallets } from '../hooks'
import { AccountBalance, AccountBalanceJson, AccountId } from '@hashgraph/sdk'
import { HWBridgeSession } from '../hWBridge'

export interface HWContext {
  accountIds: { [sessionId: string]: AccountId }
  balances: { [sessionId: string]: AccountBalance }
  getAccountId: <TSession extends HWBridgeSession>(wallet: TSession | null) => Promise<AccountId | null>
  getAccountBalance: <TSession extends HWBridgeSession>(wallet: TSession | null) => Promise<AccountBalanceJson | null>
}

export const HWContext = createContext<HWContext | null>(null)

const HWContextProvider = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const wallets = useConnectedWallets()
  const connectedSessionIDs = wallets.map(({ sessionId }) => sessionId).join(',')
  const [context, setContext] = useState<HWContext>({
    accountIds: {},
    balances: {},
  } as HWContext)

  const handleGetAccountId = async <TSession extends HWBridgeSession>(
    wallet: TSession | null,
  ): Promise<AccountId | null> => {
    if (!wallet) return null

    if (wallet && wallet.signer) {
      const accountId = await wallet.signer.getAccountId()

      setContext(
        (prevContext) =>
          ({
            ...prevContext,
            accountIds: {
              ...prevContext?.accountIds,
              [wallet.sessionId]: accountId,
            },
          } as HWContext),
      )

      return accountId
    }

    return null
  }

  const handleGetBalance = async <TSession extends HWBridgeSession>(
    wallet: TSession | null,
  ): Promise<AccountBalanceJson | null> => {
    if (!wallet) return null

    if (wallet && wallet.signer) {
      const accountBalance = await wallet.signer.getAccountBalance()

      const balance = accountBalance instanceof AccountBalance ? accountBalance.toJSON() : accountBalance

      setContext(
        (prevContext) =>
          ({
            ...prevContext,
            balances: {
              ...prevContext?.balances,
              [wallet.sessionId]: balance,
            },
          } as HWContext),
      )

      return balance
    }

    return null
  }

  useEffect(() => {
    ;(async () => {
      if (!wallets.length) return

      wallets.map(async (wallet) => {
        const accountId = await handleGetAccountId(wallet)
        const balance = await handleGetBalance(wallet)

        setContext(
          (prevContext) =>
            ({
              ...prevContext,
              accountIds: {
                ...prevContext?.accountIds,
                [wallet.sessionId]: accountId,
              },
              balances: {
                ...prevContext?.balances,
                [wallet.sessionId]: balance,
              },
            } as HWContext),
        )
      })
    })()
  }, [connectedSessionIDs])

  const value =
    useMemo(
      () => ({
        ...context,
        getAccountId: handleGetAccountId,
        getAccountBalance: handleGetBalance,
      }),
      [context],
    ) || ({} as HWContext)

  return <HWContext.Provider value={value}>{children}</HWContext.Provider>
}

export default React.memo(HWContextProvider)
