import {
  Client,
  AccountBalanceQuery,
  AccountInfoQuery,
  AccountRecordsQuery,
  TransactionReceiptQuery,
  AccountId,
  TransactionId,
  Executable,
  TransactionResponse,
} from '@hashgraph/sdk'
import { HederaNetwork } from '../../../types'

export class MagicProvider {
  private readonly _client: Client

  constructor(hedera_network: HederaNetwork) {
    if (!hedera_network) {
      throw new Error('LocalProvider requires the `HEDERA_NETWORK` environment variable to be set')
    }

    this._client = Client.forName(hedera_network)
  }

  getLedgerId() {
    return this._client.ledgerId
  }

  getNetwork() {
    return this._client.network
  }

  getMirrorNetwork() {
    return this._client.mirrorNetwork
  }

  getAccountBalance(accountId: AccountId) {
    return new AccountBalanceQuery().setAccountId(accountId).execute(this._client)
  }

  getAccountInfo(accountId: AccountId) {
    return new AccountInfoQuery().setAccountId(accountId).execute(this._client)
  }

  getAccountRecords(accountId: AccountId) {
    return new AccountRecordsQuery().setAccountId(accountId).execute(this._client)
  }

  getTransactionReceipt(transactionId: TransactionId) {
    return new TransactionReceiptQuery().setTransactionId(transactionId).execute(this._client)
  }

  waitForReceipt(response: TransactionResponse) {
    return new TransactionReceiptQuery()
      .setNodeAccountIds([response.nodeId])
      .setTransactionId(response.transactionId)
      .execute(this._client)
  }

  call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>) {
    return request.execute(this._client)
  }
}
