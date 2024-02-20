import { useConfig } from 'wagmi'
import { getAccountId } from '../actions'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { useQuery } from '@tanstack/react-query'
import { useChain } from './useChain'
import { HWBridgeQueryKeys } from '../constants'

interface IUseAccountIdProps<Connector> {
  connector?: Connector | null
  autoFetch?: boolean
}

export function useAccountId<TConnector extends HWBridgeConnector>(props?: IUseAccountIdProps<TConnector>) {
  const wallet = useWallet(props?.connector)
  const { data: chainData } = useChain()
  const config = useConfig()
  const enabled = Boolean(wallet?.signer && (props?.autoFetch ?? true))

  return useQuery({
    queryKey: [HWBridgeQueryKeys.ACCOUNT_ID, wallet.lastUpdated, chainData?.chain?.id],
    queryFn: () => (chainData?.error ? null : getAccountId({ wallet, config })),
    enabled,
  })
}
