import { Config } from 'wagmi'
import { HWBridgeSession } from '../hWBridge'
import { writeContract as wagmi_writeContract } from 'wagmi/actions'
import { Abi, Client, getContract as viem_getContract } from 'viem'
import { ConnectorType } from '../constants'
import { ContractId, TransactionReceipt } from '@hashgraph/sdk'
import { toEvmAddress } from '../utils'

export const getContract = async <TWallet extends HWBridgeSession>({
  wallet,
  abi,
  address,
}: {
  wallet: TWallet
  abi: Abi
  address: `0x${string}`
}) => {
  return viem_getContract({
    abi,
    address,
    client: wallet as unknown as Client,
  })
}

export const writeContract = async <TWallet extends HWBridgeSession>({
  wallet,
  config,
  parameters,
}: {
  wallet: TWallet
  config: Config
  parameters: {
    contract: any
    functionName: string
    metaArgs?: Object
    args?: any[]
  }
}): Promise<TransactionReceipt | string | null> => {
  if (!wallet.signer) return null
  const { contract, functionName, metaArgs, args } = parameters

  if (wallet.connector.type === ConnectorType.HEDERA) {
    return (await contract[functionName](metaArgs, ...(args || []))) ?? null
  }

  const address: `0x${string}` | null = contract.id instanceof ContractId ? toEvmAddress(contract.id) : contract.address

  if (!address) throw new Error('Invalid contract id')

  return await wagmi_writeContract(config, {
    __mode: 'prepared',
    abi: (contract.abi ?? contract.interface.fragments) as Abi,
    address,
    functionName,
    args,
    ...metaArgs,
  })
}
