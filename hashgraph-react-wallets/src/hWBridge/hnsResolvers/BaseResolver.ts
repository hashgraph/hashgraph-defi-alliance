import { HederaNetwork } from '../../types'
import { HNSResult } from '../types'

export abstract class BaseResolver {
  protected readonly _network: HederaNetwork

  constructor({ network }: { network: HederaNetwork }) {
    this._network = network
  }

  abstract get(accountId: string): Promise<HNSResult>
}

export default BaseResolver
