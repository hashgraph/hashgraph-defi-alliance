import { Config } from 'wagmi'
import { getAccount as wagmi_getAccount, getBalance as wagmi_getBalance } from 'wagmi/actions'
import { HWBridgeSession } from '../hWBridge'
import { UserBalanceResult } from '../types'
import {
  ConnectorType,
  DEFAULT_TOKEN_DECIMALS,
  DEFAULT_TOKEN_DECIMALS_ETHEREUM,
  DEFAULT_TOKEN_SYMBOL,
} from '../constants'
import { queryMirror } from './mirror.actions'
import { MirrorBalancesResponse } from './types'
import { HederaSignerType } from '../hWBridge/types'

export const getAccountId = async <TWallet extends HWBridgeSession>({
  wallet,
  config,
}: {
  wallet: TWallet
  config: Config
}): Promise<string | null> => {
  if (!wallet.signer) return null
  if (wallet.connector.type === ConnectorType.HEDERA)
    return (wallet.signer as HederaSignerType).getAccountId().toString()

  try {
    const wagmiAddress = wagmi_getAccount(config).address || null

    if (!wagmiAddress) return null

    const accountMirrorResponse = await queryMirror<{ account: string }[]>({
      path: `/api/v1/accounts/${wagmiAddress}`,
      queryKey: ['getHederaAccountId'],
      options: { network: wallet.connector.network, firstOnly: true },
    })

    if (!accountMirrorResponse?.[0].account) {
      return wagmiAddress
    }

    return accountMirrorResponse[0].account
  } catch (e) {
    console.error(e)
    return null
  }
}

export const getBalance = async <TWallet extends HWBridgeSession>({
  wallet,
  config,
}: {
  wallet: TWallet
  config: Config
}): Promise<UserBalanceResult | null> => {
  if (!wallet.signer) return null

  if (wallet.connector.type === ConnectorType.HEDERA) {
    try {
      const accountId = await getAccountId({ wallet, config })

      const balancesMirrorResponse = await queryMirror<MirrorBalancesResponse[]>({
        path: `/api/v1/balances?account.id=${accountId}`,
        queryKey: ['getBalance'],
        options: { network: wallet.connector.network },
      })

      const balance = (balancesMirrorResponse?.[0].balances?.[0]?.balance || 0) / Math.pow(10, DEFAULT_TOKEN_DECIMALS)

      return {
        decimals: DEFAULT_TOKEN_DECIMALS,
        formatted: `${balance} ${DEFAULT_TOKEN_SYMBOL}`,
        symbol: DEFAULT_TOKEN_SYMBOL,
        value: balance,
      } as UserBalanceResult
    } catch (e) {
      console.error('Unable to fetch your balance', e)
      return null
    }
  }

  const { address } = wagmi_getAccount(config)

  if (!address) throw new Error('Could not determine your wallet address')

  const wagmiBalance = await wagmi_getBalance(config, { address })
  const value = Number(wagmiBalance.value / BigInt(Math.pow(10, DEFAULT_TOKEN_DECIMALS_ETHEREUM)))

  const balance: UserBalanceResult = {
    ...wagmiBalance,
    formatted: value + ' ' + DEFAULT_TOKEN_SYMBOL,
    value,
  }

  return balance
}
