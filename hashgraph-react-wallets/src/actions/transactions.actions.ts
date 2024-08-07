import { sleep } from '../utils'
import { ConnectorType } from '../constants'
import { HWBridgeSession } from '../hWBridge'
import { getContractResults, getTransactionsByTimestamp, getTransactionsById } from './mirror.actions'
import { Abi, DecodeErrorResultReturnType, decodeErrorResult } from 'viem'
import { HederaNetwork } from '../types'

const DEFAULT_RETRY_ATTEMPTS = 10
const DEFAULT_RETRY_DELAY = 2000

export type GetTransactionReceiptCallbacks = {
  onSuccess: <Transaction extends { transaction_id: string }>(transaction: Transaction) => Transaction
  onError: <Transaction extends { transaction_id: string }>(
    transaction: Transaction,
    error: string | DecodeErrorResultReturnType | null,
  ) => Transaction
}

export type GetTransactionQueryOptions = {
  retryMaxAttempts?: number
  retryInterval?: number
}

export const getTransactionReceipt = async <
  TWallet extends HWBridgeSession,
  const abi extends Abi | readonly unknown[],
>(
  wallet: TWallet,
  abi: abi,
  transactionIdOrHash: string,
  network: HederaNetwork,
  { onSuccess, onError }: GetTransactionReceiptCallbacks,
  { retryMaxAttempts = DEFAULT_RETRY_ATTEMPTS, retryInterval = DEFAULT_RETRY_DELAY }: GetTransactionQueryOptions,
): Promise<any> => {
  try {
    let transaction_id = null

    if (wallet.connector.type === ConnectorType.ETHEREUM) {
      const [transaction] =
        (await getContractResults<{ timestamp: string }[]>({
          transactionIdOrHash,
          network,
        })) ?? []

      if (!transaction.timestamp) throw new Error(`Failed retrieve info for: ${transactionIdOrHash}`)

      const transactionsByTimestampResponse = await getTransactionsByTimestamp<
        { transactions: { transaction_id: string }[] }[]
      >({
        timestamp: transaction.timestamp,
        network,
      })

      if (!transactionsByTimestampResponse || !transactionsByTimestampResponse.length)
        throw new Error(`Failed fetch the ethereum transaction for: ${transactionIdOrHash}`)

      const { transactions } = transactionsByTimestampResponse[0]

      if (!transactions.length && !transactions[0].transaction_id)
        throw new Error(`Failed to determine the transaction id for: ${transactionIdOrHash}`)

      transaction_id = transactions[0]?.transaction_id
    } else {
      transaction_id = transactionIdOrHash
    }

    const childTransactionsResponse = await getTransactionsById<
      { transactions: { transaction_id: string; name: string; result: string }[] }[]
    >({
      transactionId: transaction_id,
      network,
    })

    if (!childTransactionsResponse || !childTransactionsResponse[0].transactions)
      throw new Error(`Failed fetch the child transactions for: ${transactionIdOrHash}`)

    const [ethereumTransaction, ...childTransactions] = childTransactionsResponse[0].transactions
    const failedTransaction = [...childTransactions, ethereumTransaction]
      .filter(Boolean)
      .find((transaction) => transaction.result !== 'SUCCESS')

    if (failedTransaction) {
      const errorMessage = abi
        ? await getTransactionErrorMessage(wallet, abi, transactionIdOrHash, network, {
            retryMaxAttempts,
            retryInterval,
          })
        : failedTransaction.result

      onError(failedTransaction, errorMessage)
      return failedTransaction
    }

    onSuccess(ethereumTransaction)
    return ethereumTransaction
  } catch (e) {
    if (retryMaxAttempts >= 1) {
      console.warn(`Failed to retrieve the receipt. Retrying... [remaining attempts: ${retryMaxAttempts}]`)
      await sleep(retryInterval)

      return getTransactionReceipt(
        wallet,
        abi,
        transactionIdOrHash,
        network,
        { onSuccess, onError },
        {
          retryMaxAttempts: retryMaxAttempts - 1,
          retryInterval,
        },
      )
    } else {
      return null
    }
  }
}

export const getTransactionErrorMessage = async <
  TWallet extends HWBridgeSession,
  const abi extends Abi | readonly unknown[],
>(
  wallet: TWallet,
  abi: abi,
  transactionIdOrHash: string,
  network: HederaNetwork,
  { retryMaxAttempts = DEFAULT_RETRY_ATTEMPTS, retryInterval = DEFAULT_RETRY_DELAY }: GetTransactionQueryOptions,
): Promise<string | DecodeErrorResultReturnType | null> => {
  try {
    const [transaction] =
      (await getContractResults<{ timestamp: string; result: string; error_message: `0x${string}` }[]>({
        transactionIdOrHash,
        network,
      })) ?? []

    if (!transaction.timestamp) throw new Error(`Failed retrieve info for: ${transactionIdOrHash}`)
    if (!transaction.error_message) return null

    if (transaction.error_message.startsWith('0x')) {
      try {
        const decodedError = decodeErrorResult({
          abi: abi as Abi,
          data: transaction.error_message,
        })

        return decodedError
      } catch (e) {
        return transaction.result
      }
    }

    return transaction.error_message
  } catch (e) {
    if (retryMaxAttempts >= 1) {
      console.warn(
        `Failed to retrieve the transaction error message. Retrying... [remaining attempts: ${retryMaxAttempts}]`,
      )
      await sleep(retryInterval)

      return getTransactionErrorMessage(wallet, abi, transactionIdOrHash, network, {
        retryMaxAttempts: retryMaxAttempts - 1,
        retryInterval,
      })
    } else {
      return null
    }
  }
}
