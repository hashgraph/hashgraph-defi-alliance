import { useConfig } from 'wagmi'
import { getBalance } from '../actions'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { useQuery } from '@tanstack/react-query'
import { useChain } from './useChain'
import { HWBridgeQueryKeys } from '../constants'

interface IUseBalanceProps<Connector> {
  connector?: Connector | null
  autoFetch?: boolean
}

export function useBalance<TConnector extends HWBridgeConnector>(props?: IUseBalanceProps<TConnector>) {
  const wallet = useWallet(props?.connector)
  const { data: chainData } = useChain()
  const config = useConfig()
  const enabled = Boolean(wallet?.signer && (props?.autoFetch ?? true))

  return useQuery({
    queryKey: [HWBridgeQueryKeys.ACCOUNT_BALANCE, wallet.lastUpdated, chainData?.chain?.id],
    queryFn: () => (chainData?.error ? null : getBalance({ wallet, config })),
    enabled,
  })
}
