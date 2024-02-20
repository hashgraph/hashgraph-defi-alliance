import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { tanstackQueryClient } from '..'
import { associateTokens } from '../actions'
import { useConfig } from 'wagmi'
import { Abi } from 'viem'
import { HWBridgeQueryKeys } from '../constants'

interface IUseBalanceProps<Connector> {
  connector?: Connector | null
  abi?: Abi
}

export function useAssociateTokens<TConnector extends HWBridgeConnector>(props?: IUseBalanceProps<TConnector>) {
  const { connector, abi } = props || {}
  const wallet = useWallet(connector)
  const config = useConfig()

  const handleAssociateTokens = async (tokens: string[]) => {
    const response = await tanstackQueryClient.fetchQuery({
      queryKey: [HWBridgeQueryKeys.ASSOCIATE_TOKENS, wallet.lastUpdated, tokens?.join(',')],
      queryFn: () => associateTokens({ wallet, config, abi, tokens }),
    })

    tanstackQueryClient.invalidateQueries({
      queryKey: [HWBridgeQueryKeys.TOKENS_BALANCE, HWBridgeQueryKeys.ACCOUNT_BALANCE],
    })

    return response
  }

  return {
    associateTokens: handleAssociateTokens,
  }
}
