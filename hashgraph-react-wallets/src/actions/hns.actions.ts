import { Config } from 'wagmi'
import { HWBridgeSession } from '../hWBridge'
import { HNSResult } from '../hWBridge/types'
import { getAccountId } from './account.actions'
import { ConnectorType } from '../constants'

export const getHNSName = async <TWallet extends HWBridgeSession>({
  wallet,
  config,
}: {
  wallet: TWallet
  config: Config
}): Promise<HNSResult | null> => {
  if (!wallet.signer) return null

  const accountId = await getAccountId({ wallet, config })
  if (!accountId) return null
  if (wallet.connector.type === ConnectorType.HEDERA) return await wallet.connector.resolveHNS(accountId)

  const hederaAccountId = await getAccountId({ wallet, config })

  if (hederaAccountId) {
    return await wallet.connector.resolveHNS(hederaAccountId.toString())
  }

  return null
}
