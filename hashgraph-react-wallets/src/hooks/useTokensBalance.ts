import { queryMirror } from '../actions'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useQuery } from '@tanstack/react-query'
import { useAccountId } from './useAccountId'
import { MirrorBalancesResponse } from '../actions/types'
import { HWBridgeQueryKeys } from '../constants'
import { useWallet } from './useWallet'

interface IUseTokensBalanceProps<Connector> {
  connector?: Connector | null
  accountId?: string
  tokens?: string[]
  autoFetch?: boolean
}

export function useTokensBalance<TConnector extends HWBridgeConnector>({
  connector,
  accountId,
  tokens,
  autoFetch,
}: IUseTokensBalanceProps<TConnector> = {}) {
  const wallet = useWallet()
  let { data: connectedAccountId } = useAccountId({ connector })
  connectedAccountId = accountId ?? connectedAccountId
  const enabled = Boolean(connectedAccountId && (autoFetch ?? true))

  const queryFn = async () => {
    return queryMirror<MirrorBalancesResponse[]>({
      path: `/api/v1/balances?account.id=${connectedAccountId}`,
      queryKey: [HWBridgeQueryKeys.TOKENS_BALANCE],
      options: {
        network: wallet.connector.network,
      },
    })
  }

  return useQuery({
    queryKey: [HWBridgeQueryKeys.TOKENS_BALANCE, connectedAccountId],
    queryFn,
    enabled,
    select: (data) => {
      if (!data || data[0]._status?.messages.length) return null

      const accountBalances = data.map(({ balances }) => balances).flat()
      const tokenBalances = accountBalances.map(({ tokens }) => tokens).flat()

      if (tokens?.length) {
        return tokenBalances.filter(({ token_id }) => tokens.indexOf(token_id) > -1)
      }

      return tokenBalances
    },
  })
}
