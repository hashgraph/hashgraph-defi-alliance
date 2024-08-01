import { useCallback } from 'react'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { tanstackQueryClient } from '..'
import { getTransactionReceipt } from '../actions'
import { HWBridgeQueryKeys, regexPatterns } from '../constants'
import { Abi, DecodeErrorResultReturnType } from 'viem'
import { chainToNetworkName } from '../utils'

interface IUseWatchTransactionReceiptProps<Connector, abi extends Abi | readonly unknown[]> {
  connector?: Connector | null
  abi?: abi
  retryInterval?: number
  retryMaxAttempts?: number
}

export function useWatchTransactionReceipt<TConnector extends HWBridgeConnector, abi extends Abi | readonly unknown[]>(
  props?: IUseWatchTransactionReceiptProps<TConnector, abi>,
) {
  const { connector, abi, ...options } = props || {}
  const wallet = useWallet(connector)

  const handleWatchTransactionReceipt = useCallback(
    async (
      transactionIdOrHash: string,
      callbacks: {
        onSuccess: <Transaction extends { transaction_id: string }>(transaction: Transaction) => Transaction
        onError: <Transaction extends { transaction_id: string }>(
          transaction: Transaction,
          error: string | DecodeErrorResultReturnType | null,
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
          getTransactionReceipt(
            wallet,
            abi ?? [],
            transactionIdOrHash,
            chainToNetworkName(wallet.connector.chain),
            callbacks,
            {
              retryInterval: options?.retryInterval,
              retryMaxAttempts: options?.retryMaxAttempts,
            },
          ),
      })
    },
    [wallet, abi, options?.retryInterval, options?.retryMaxAttempts],
  )

  return {
    watch: handleWatchTransactionReceipt,
  }
}
