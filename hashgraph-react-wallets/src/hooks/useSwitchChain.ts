import { useAccount, useConfig } from 'wagmi'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useWallet } from './useWallet'
import { switchChain } from '../actions'
import { tanstackQueryClient } from '..'
import { HWBridgeQueryKeys } from '../constants'

interface IUseSwitchChainProps<Connector> {
  connector?: Connector | null
}

export function useSwitchChain<TConnector extends HWBridgeConnector>(props?: IUseSwitchChainProps<TConnector>) {
  const wallet = useWallet(props?.connector)
  const config = useConfig()
  const { chainId: selectedChainId } = useAccount()

  const handleSwitchChain = (chainId: number) => {
    if (chainId === selectedChainId) return

    return tanstackQueryClient.fetchQuery({
      queryKey: [HWBridgeQueryKeys.SWITCH_CHAIN, wallet.lastUpdated, selectedChainId],
      queryFn: () => switchChain({ wallet, config, chainId }),
    })
  }

  return {
    chains: config.chains,
    switchChain: handleSwitchChain,
  }
}
