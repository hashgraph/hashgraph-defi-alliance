import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { tanstackQueryClient } from '..'
import { approveTokensAllowance } from '../actions'
import { useConfig } from 'wagmi'
import { Abi } from 'viem'
import { AccountId, ContractId, Hbar, TokenId } from '@hashgraph/sdk'
import { HWBridgeQueryKeys } from '../constants'

interface IUseBalanceProps<Connector> {
  connector?: Connector | null
  abi?: Abi
}

export function useApproveTokenAllowance<TConnector extends HWBridgeConnector>(props?: IUseBalanceProps<TConnector>) {
  const { connector, abi } = props || {}
  const wallet = useWallet(connector)
  const config = useConfig()

  const handleApproveTokenAllowance = async (
    tokens: {
      tokenId: TokenId | string
      amount: Hbar | number
    }[],
    spender: AccountId | ContractId | string,
  ) => {
    return tanstackQueryClient.fetchQuery({
      queryKey: [
        HWBridgeQueryKeys.APPROVE_TOKENS_ALLOWANCE,
        wallet.lastUpdated,
        tokens.map(({ tokenId, amount }) => `${tokenId}-${amount}`).join(','),
      ],
      queryFn: () => approveTokensAllowance({ wallet, config, abi, tokens, spender }),
    })
  }

  return {
    approve: handleApproveTokenAllowance,
  }
}
