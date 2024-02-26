import { useCallback } from 'react'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { tanstackQueryClient } from '..'
import { getTransactionReceipt } from '../actions'
import { HWBridgeQueryKeys, regexPatterns } from '../constants'

interface IUseWatchTransactionReceiptProps<Connector> {
  connector?: Connector | null
  contract?: any
  retryInterval?: number
  retryMaxAttempts?: number
}

export function useWatchTransactionReceipt<TConnector extends HWBridgeConnector>(
  props?: IUseWatchTransactionReceiptProps<TConnector>,
) {
  const { connector, contract, ...options } = props || {}
  const wallet = useWallet(connector)

  const handleWatchTransactionReceipt = useCallback(
    async (
      transactionIdOrHash: string,
      callbacks: {
        onSuccess: <Transaction extends { transaction_id: string }>(transaction: Transaction) => Transaction
        onError: <Transaction extends { transaction_id: string }>(
          transaction: Transaction,
          error: string | string[] | null,
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
          getTransactionReceipt(wallet, contract, transactionIdOrHash, wallet.connector.network, callbacks, {
            retryInterval: options?.retryInterval,
            retryMaxAttempts: options?.retryMaxAttempts,
          }),
      })
    },
    [wallet, contract, options?.retryInterval, options?.retryMaxAttempts],
  )

  return {
    watch: handleWatchTransactionReceipt,
  }
}
