import { Config } from 'wagmi'
import { switchChain as wagmi_switchChain } from 'wagmi/actions'
import { HWBridgeSession } from '../hWBridge'
import { Chain } from 'viem'
import { ConnectorType } from '../constants'

export const getChainId = async <TWallet extends HWBridgeSession>({
  wallet,
  selectedChainId,
}: {
  wallet: TWallet
  selectedChainId?: number
}): Promise<{ chain?: Chain | null; error: string | null } | null> => {
  if (wallet.connector.type === ConnectorType.HEDERA) {
    return {
      chain: wallet.connector.chain,
      error: null,
    }
  }

  const error = wallet.connector.chain?.id !== selectedChainId ? `Wrong connector chainId (${selectedChainId})` : null

  if (error) {
    return {
      chain: null,
      error,
    }
  }

  return {
    chain: wallet.connector.chain,
    error: null,
  }
}

export const switchChain = async <TWallet extends HWBridgeSession>({
  wallet,
  config,
  chainId,
}: {
  wallet: TWallet
  config: Config
  chainId: number
}): Promise<Chain | null> => {
  if (wallet.connector.type === ConnectorType.HEDERA) {
    throw new Error('Unsupported wallet operation')
  }

  return wagmi_switchChain(config, { chainId })
}
