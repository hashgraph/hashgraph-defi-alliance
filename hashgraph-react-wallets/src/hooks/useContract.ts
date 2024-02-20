import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { useQuery } from '@tanstack/react-query'
import { Abi } from 'viem'
import { getContract } from '../actions'
import { HWBridgeQueryKeys } from '../constants'

interface IUseContractProps<Connector> {
  connector?: Connector | null
  abi: Abi
  address: `0x${string}`
  autoFetch?: boolean
}

export function useContract<TConnector extends HWBridgeConnector>({
  connector,
  abi,
  address,
  autoFetch,
}: IUseContractProps<TConnector>) {
  const wallet = useWallet(connector)
  const enabled = Boolean(wallet?.signer && (autoFetch ?? true))

  return useQuery({
    queryKey: [HWBridgeQueryKeys.GET_CONTRACT, wallet.lastUpdated, address],
    queryFn: () => getContract({ wallet, abi, address }),
    enabled,
  })
}
