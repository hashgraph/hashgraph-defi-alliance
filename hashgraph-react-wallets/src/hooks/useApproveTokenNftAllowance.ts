import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { tanstackQueryClient } from '..'
import { approveTokensNFTAllowance } from '../actions'
import { useConfig } from 'wagmi'
import { Abi } from 'viem'
import { AccountId, ContractId, TokenId } from '@hashgraph/sdk'
import { HWBridgeQueryKeys } from '../constants'

interface IUseBalanceProps<Connector> {
  connector?: Connector | null
  abi?: Abi
}

export function useApproveTokenNftAllowance<TConnector extends HWBridgeConnector>(
  props?: IUseBalanceProps<TConnector>,
) {
  const { connector, abi } = props || {}
  const wallet = useWallet(connector)
  const config = useConfig()

  const handleApproveTokenNftAllowance = async (
    tokens: {
      tokenId: TokenId | string
      serial: number
    }[],
    spender: AccountId | ContractId | string,
  ) => {
    return tanstackQueryClient.fetchQuery({
      queryKey: [
        HWBridgeQueryKeys.APPROVE_TOKENS_NFT_ALLOWANCE,
        wallet.lastUpdated,
        tokens.map(({ tokenId, serial }) => `${tokenId}-${serial}`).join(','),
      ],
      queryFn: () => approveTokensNFTAllowance({ wallet, config, abi, tokens, spender }),
    })
  }

  return {
    approve: handleApproveTokenNftAllowance,
  }
}
