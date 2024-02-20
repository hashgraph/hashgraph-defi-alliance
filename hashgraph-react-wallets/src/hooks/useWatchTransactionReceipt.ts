import { useCallback } from 'react'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { tanstackQueryClient } from '..'
import { getTransactionReceipt } from '../actions'
import { HWBridgeQueryKeys, regexPatterns } from '../constants'

interface IUseAccountIdProps<Connector> {
  connector?: Connector | null
  retryInterval?: number
  retryMaxAttempts?: number
}

export function useWatchTransactionReceipt<TConnector extends HWBridgeConnector>(
  props?: IUseAccountIdProps<TConnector>,
) {
  const { connector, ...options } = props || {}
  const wallet = useWallet(connector)

  const handleWatchTransactionReceipt = useCallback(
    async (
      transactionIdOrHash: string,
      callbacks: {
        onSuccess: <Transaction extends { transaction_id: string }>(transaction: Transaction) => Transaction
        onError: <Transaction extends { transaction_id: string }>(
          transaction: Transaction,
          message?: string,
        ) => Transaction
      },
    ) => {
      if (new RegExp(regexPatterns.hederaTransactionId).test(transactionIdOrHash)) {
        const [account, consensusTimestamp] = transactionIdOrHash.split('@')
        transactionIdOrHash = `${account}-${consensusTimestamp.replace('.', '-')}`
      }

      return await tanstackQueryClient.fetchQuery({
        queryKey: [HWBridgeQueryKeys.WATCH_TRANSACTION_RECEIPT, wallet.lastUpdated, transactionIdOrHash],
        queryFn: () =>
          getTransactionReceipt(wallet, transactionIdOrHash, wallet.connector.network, callbacks, {
            retryInterval: options?.retryInterval,
            retryMaxAttempts: options?.retryMaxAttempts,
          }),
      })
    },
    [wallet, options?.retryInterval, options?.retryMaxAttempts],
  )

  return {
    watch: handleWatchTransactionReceipt,
  }
}
