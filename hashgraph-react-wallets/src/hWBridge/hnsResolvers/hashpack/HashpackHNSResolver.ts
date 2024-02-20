import { HP_HNS_RESOLVER_URL } from './constants'
import { HNSResult } from '../../types'
import BaseResolver from '../BaseResolver'
import { HederaNetwork } from '../../../types'

export class HashpackHNSResolver extends BaseResolver {
  constructor({ network }: { network: HederaNetwork }) {
    super({ network })
  }

  async get(accountId: string) {
    const response = await fetch(HP_HNS_RESOLVER_URL, {
      method: 'POST',
      body: JSON.stringify({
        accountId: accountId,
        network: this._network,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const jResponse = await response.json()

    if (jResponse) {
      return {
        hnsName: jResponse.username.name,
        avatar: jResponse.profilePicture.thumbUrl,
        tokenId: jResponse.username.tokenId,
        serial: jResponse.username.serial,
      } as HNSResult
    }

    return {} as HNSResult
  }
}

export default HashpackHNSResolver
