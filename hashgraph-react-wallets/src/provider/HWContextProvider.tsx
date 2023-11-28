import * as React from 'react'
import { ReactNode, createContext, useEffect, useMemo, useState } from 'react'
import { useConnectedWallets } from '../hooks'
import { AccountBalance, AccountBalanceJson, AccountId } from '@hashgraph/sdk'
import { HWBridgeSession } from '../hWBridge'
import { HNSResult } from '../hWBridge/types'

export interface HWContext {
  ready: boolean
  accountIds: { [sessionId: string]: AccountId }
  hns: { [sessionId: string]: HNSResult }
  balances: { [sessionId: string]: AccountBalanceJson }
  getAccountId: <TSession extends HWBridgeSession>(wallet: TSession | null) => Promise<AccountId | null>
  getHNSName: <TSession extends HWBridgeSession>(wallet: TSession | null) => Promise<HNSResult | null>
  getAccountBalance: <TSession extends HWBridgeSession>(wallet: TSession | null) => Promise<AccountBalanceJson | null>
}

export const HWContext = createContext<HWContext | null>(null)

const HWContextProvider = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const wallets = useConnectedWallets()
  const connectedSessionIDs = wallets.map(({ sessionId }) => sessionId).join(',')
  const [context, setContext] = useState<HWContext>({
    ready: false,
    accountIds: {},
    hns: {},
    balances: {},
  } as HWContext)

  const handleGetAccountId = async <TSession extends HWBridgeSession>(
    wallet: TSession | null,
    force: boolean = false,
  ): Promise<AccountId | null> => {
    if (wallet && wallet.signer && (context.ready || force)) {
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

  const handleGetHNSName = async <TSession extends HWBridgeSession>(
    wallet: TSession | null,
    force: boolean = false,
  ): Promise<HNSResult | null> => {
    if (wallet && wallet.signer && (context.ready || force)) {
      const accountId = context.accountIds[wallet.sessionId] || (await wallet.signer.getAccountId())
      const hnsResult = await wallet.connector.resolveHNS(accountId)

      setContext(
        (prevContext) =>
          ({
            ...prevContext,
            hns: {
              ...prevContext?.hns,
              [wallet.sessionId]: hnsResult,
            },
          } as HWContext),
      )

      return hnsResult
    }

    return null
  }

  const handleGetBalance = async <TSession extends HWBridgeSession>(
    wallet: TSession | null,
    force: boolean = false,
  ): Promise<AccountBalanceJson | null> => {
    if (wallet && wallet.signer && (context.ready || force)) {
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
      if (!wallets.length) {
        setContext((prevContext) => ({
          ...prevContext,
          accountIds: {},
          hns: {},
          balances: {},
        }))

        return
      }

      wallets.map(async (wallet) => {
        try {
          const accountId = await handleGetAccountId(wallet, true)
          const hnsResult = await handleGetHNSName(wallet, true)
          const balance = await handleGetBalance(wallet, true)

          setContext(
            (prevContext) =>
              ({
                ...prevContext,
                accountIds: {
                  ...prevContext?.accountIds,
                  [wallet.sessionId]: accountId,
                },
                hns: {
                  ...prevContext?.hns,
                  [wallet.sessionId]: hnsResult,
                },
                balances: {
                  ...prevContext?.balances,
                  [wallet.sessionId]: balance,
                },
                ready: true,
              } as HWContext),
          )
        } catch (e) {
          console.error('Failed to load the initial context', e)

          setContext(
            (prevContext) =>
              ({
                ...prevContext,
                ready: true,
              } as HWContext),
          )
        }
      })
    })()
  }, [connectedSessionIDs])

  const value =
    useMemo(
      () => ({
        ...context,
        getAccountId: handleGetAccountId,
        getHNSName: handleGetHNSName,
        getAccountBalance: handleGetBalance,
      }),
      [context],
    ) || ({} as HWContext)

  return <HWContext.Provider value={value}>{children}</HWContext.Provider>
}

export default React.memo(HWContextProvider)
