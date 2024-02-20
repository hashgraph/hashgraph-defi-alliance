import { useConfig } from 'wagmi'
import { HWBridgeConnector } from '../hWBridge/types'
import { useWallet } from './useWallet'
import { writeContract } from '../actions'
import { tanstackQueryClient } from '..'
import { HWBridgeQueryKeys } from '../constants'

interface IUseWriteContractProps<Connector> {
  connector?: Connector | null
}

export function useWriteContract<TConnector extends HWBridgeConnector>(props: IUseWriteContractProps<TConnector>) {
  const { connector } = props || {}
  const wallet = useWallet(connector)
  const config = useConfig()

  const handleWriteContract = async (parameters: {
    contract: any
    functionName: string
    metaArgs?: Object
    args?: any[]
  }) => {
    return tanstackQueryClient.fetchQuery({
      queryKey: [HWBridgeQueryKeys.WRITE_CONTRACT, wallet.lastUpdated],
      queryFn: () =>
        writeContract({
          wallet,
          config,
          parameters,
        }),
    })
  }

  return {
    writeContract: handleWriteContract,
  }
}
