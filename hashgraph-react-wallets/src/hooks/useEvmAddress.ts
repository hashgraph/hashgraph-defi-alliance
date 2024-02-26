import { useConfig } from 'wagmi'
import { getEvmAddress } from '../actions'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { useQuery } from '@tanstack/react-query'
import { useChain } from './useChain'
import { HWBridgeQueryKeys } from '../constants'

interface IUseEvmAddressProps<Connector> {
  connector?: Connector | null
  autoFetch?: boolean
}

export function useEvmAddress<TConnector extends HWBridgeConnector>(props?: IUseEvmAddressProps<TConnector>) {
  const wallet = useWallet(props?.connector)
  const { data: chainData } = useChain()
  const config = useConfig()
  const enabled = Boolean(wallet?.signer && (props?.autoFetch ?? true))

  return useQuery({
    queryKey: [HWBridgeQueryKeys.EVM_ADDRESS, wallet.lastUpdated, chainData?.chain?.id],
    queryFn: () => (chainData?.error ? null : getEvmAddress({ wallet, config })),
    enabled,
  })
}
