import { Config } from 'wagmi'
import { HWBridgeSession } from '../hWBridge'
import { writeContract as wagmi_writeContract } from 'wagmi/actions'
import {
  Abi,
  Client,
  ContractFunctionArgs,
  ContractFunctionName,
  encodeFunctionData,
  fromHex,
  getContract as viem_getContract,
} from 'viem'
import { ConnectorType } from '../constants'
import {
  AccountId,
  ContractExecuteTransaction,
  ContractId,
  Hbar,
  TransactionId,
  TransactionReceipt,
} from '@hashgraph/sdk'
import { toEvmAddress } from '../utils'
import { DAppSigner } from '@hashgraph/hedera-wallet-connect'

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

export const writeContract = async <
  TWallet extends HWBridgeSession,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
>({
  wallet,
  config,
  parameters,
}: {
  wallet: TWallet
  config: Config
  parameters: {
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
  }
}): Promise<TransactionReceipt | string | null> => {
  if (!wallet.signer) return null
  const { contractId, abi, functionName, metaArgs, args } = parameters

  if (wallet.connector.type === ConnectorType.HEDERA) {
    const signer = wallet.signer as DAppSigner

    const constructorArgs: any = {
      contractId,
      gas: 100_000, // DEFAULT VALUE
    }

    if (metaArgs && Object.keys(metaArgs).length > 0) {
      if (metaArgs.gas instanceof Hbar) {
        constructorArgs.gas = metaArgs.gas.toTinybars()
      }
      if (Number.isInteger(metaArgs.gas)) {
        constructorArgs.gas = metaArgs.gas
      }
    }

    const transaction = new ContractExecuteTransaction(constructorArgs)

    if (metaArgs && Object.keys(metaArgs).length > 0) {
      if (metaArgs.amount) {
        transaction.setPayableAmount(metaArgs.amount)
      }
      if (metaArgs.maxTransactionFee) {
        transaction.setMaxTransactionFee(metaArgs.maxTransactionFee)
      }
      if (Array.isArray(metaArgs.nodeAccountIds)) {
        transaction.setNodeAccountIds(metaArgs.nodeAccountIds)
      }
      if (metaArgs.transactionId instanceof TransactionId) {
        transaction.setTransactionId(metaArgs.transactionId)
      }
      if (metaArgs.transactionMemo) {
        transaction.setTransactionMemo(metaArgs.transactionMemo)
      }
      if (Number.isInteger(metaArgs.transactionValidDuration)) {
        transaction.setTransactionValidDuration(metaArgs.transactionValidDuration)
      }
    }

    transaction.setFunctionParameters(
      fromHex(
        encodeFunctionData({
          abi,
          functionName,
          args,
        } as any),
        'bytes',
      ),
    )

    const signTx = await transaction.freezeWithSigner(signer)
    const txResponse = await signTx.executeWithSigner(signer)

    return txResponse.transactionId?.toString() ?? null
  }

  const address: `0x${string}` | null =
    contractId instanceof ContractId ? toEvmAddress(contractId) : (contractId as `0x${string}`)

  if (!address) throw new Error('Invalid contract id')

  return await wagmi_writeContract(config, {
    __mode: 'prepared',
    abi,
    address,
    functionName,
    args,
    ...(metaArgs as any),
  })
}
