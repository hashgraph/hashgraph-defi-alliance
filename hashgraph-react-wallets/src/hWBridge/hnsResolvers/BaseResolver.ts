import { AccountId } from '@hashgraph/sdk'
import { HNSResult, HederaNetwork } from '../types'

export abstract class BaseResolver {
  protected readonly _network: HederaNetwork

  constructor({ network }: { network: HederaNetwork }) {
    this._network = network
  }

  abstract get(accountId: AccountId): Promise<HNSResult>
}

export default BaseResolver
