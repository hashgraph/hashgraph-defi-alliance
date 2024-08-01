import { useConfig } from 'wagmi'
import { HWBridgeConnector } from '../hWBridge/types'
import { useWallet } from './useWallet'
import { writeContract } from '../actions'
import { tanstackQueryClient } from '..'
import { HWBridgeQueryKeys } from '../constants'
import { AccountId, ContractId, Hbar, TransactionId } from '@hashgraph/sdk'
import { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem'

interface IUseWriteContractProps<Connector> {
  connector?: Connector | null
}

export function useWriteContract<TConnector extends HWBridgeConnector>(props: IUseWriteContractProps<TConnector>) {
  const { connector } = props || {}
  const wallet = useWallet(connector)
  const config = useConfig()

  const handleWriteContract = async <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  >(parameters: {
    contractId: ContractId | string
    abi: abi
    functionName: functionName
    metaArgs?: {
      gas: Hbar | number
      amount: number
      maxTransactionFee: Hbar | number
      nodeAccountIds: AccountId[]
      transactionId: TransactionId
      transactionMemo: string
      transactionValidDuration: number
    }
    args: args
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
