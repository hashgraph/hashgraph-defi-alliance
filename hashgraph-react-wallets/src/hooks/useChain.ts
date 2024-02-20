import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { useQuery } from '@tanstack/react-query'
import { getChainId } from '../actions'
import { HWBridgeQueryKeys } from '../constants'
import { useAccount } from 'wagmi'

interface IUseChainIdProps<Connector> {
  connector?: Connector | null
  autoFetch?: boolean
}

export function useChain<TConnector extends HWBridgeConnector>(props?: IUseChainIdProps<TConnector>) {
  const wallet = useWallet(props?.connector)
  const enabled = Boolean(wallet?.signer && (props?.autoFetch ?? true))
  const { chainId: selectedChainId } = useAccount()

  return useQuery({
    queryKey: [HWBridgeQueryKeys.GET_CHAIN_ID, wallet.lastUpdated, selectedChainId],
    queryFn: () => getChainId({ wallet, selectedChainId }),
    enabled,
  })
}
