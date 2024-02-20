import {
  AccountAllowanceApproveTransaction,
  AccountId,
  ContractId,
  Hbar,
  NftId,
  TokenAssociateTransaction,
  TokenId,
} from '@hashgraph/sdk'
import { HWBridgeSession } from '../hWBridge'
import { HederaSignerType } from '../hWBridge/types'
import { Abi } from 'viem'
import { Config } from 'wagmi'
import { writeContract } from 'wagmi/actions'
import { ConnectorType } from '../constants'
import { toEvmAddress } from '../utils'

export const associateTokens = async <TWallet extends HWBridgeSession>({
  wallet,
  config,
  abi = [
    {
      inputs: [],
      name: 'associate',
      outputs: [
        {
          internalType: 'uint256',
          name: 'responseCode',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as Abi,
  tokens = [],
}: {
  wallet: TWallet
  config: Config
  abi?: Abi
  tokens: string[]
}): Promise<string | string[] | null> => {
  if (!wallet.signer) return null

  if (wallet.connector.type === ConnectorType.HEDERA) {
    const signer = wallet.signer as HederaSignerType

    const transaction = await new TokenAssociateTransaction()
      .setAccountId(signer.getAccountId())
      .setTokenIds(tokens)
      .freezeWithSigner(signer)

    const signTx = await transaction.signWithSigner(signer)
    const txResponse = await signTx.executeWithSigner(signer)

    return txResponse.transactionId?.toString() ?? null
  }

  return Promise.all(
    tokens.map(async (tokenId) => {
      const address: `0x${string}` = toEvmAddress(ContractId.fromString(tokenId))
      return await writeContract(config, { address, abi, functionName: 'associate' })
    }),
  )
}

export const approveTokensAllowance = async <TWallet extends HWBridgeSession>({
  wallet,
  config,
  abi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          internalType: 'bool',
          name: 'response',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as Abi,
  tokens = [],
  spender,
}: {
  wallet: TWallet
  config: Config
  abi?: Abi
  tokens: {
    tokenId: TokenId | string
    amount: Hbar | number
  }[]
  spender: AccountId | ContractId | string
}): Promise<string | string[] | null> => {
  if (!wallet.signer) return null

  if (wallet.connector.type === ConnectorType.HEDERA) {
    const signer = wallet.signer as HederaSignerType
    const accountId = signer.getAccountId()
    const spenderId = typeof spender === 'string' ? ContractId.fromString(spender) : spender

    const allowanceApproveTransaction = new AccountAllowanceApproveTransaction()

    for (let { tokenId, amount } of tokens) {
      tokenId = typeof tokenId === 'string' ? TokenId.fromString(tokenId) : tokenId
      allowanceApproveTransaction.approveTokenAllowance(tokenId, accountId, spenderId.toString(), amount)
    }

    const frozenTx = await allowanceApproveTransaction.freezeWithSigner(signer)
    const signTx = await frozenTx.signWithSigner(signer)
    const txResponse = await signTx.executeWithSigner(signer)

    return txResponse.transactionId?.toString() ?? null
  }

  return Promise.all(
    tokens.map(async ({ tokenId, amount }) => {
      tokenId = typeof tokenId === 'string' ? TokenId.fromString(tokenId) : tokenId
      const contractAddress = toEvmAddress(tokenId)
      const spenderId =
        typeof spender === 'string' ? toEvmAddress(ContractId.fromString(spender)) : toEvmAddress(spender)

      return await writeContract(config, {
        address: contractAddress,
        abi,
        functionName: 'approve',
        args: [spenderId, amount],
      })
    }),
  )
}

export const approveTokensNFTAllowance = async <TWallet extends HWBridgeSession>({
  wallet,
  config,
  abi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: '_approved',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: '_tokenId',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          internalType: 'bool',
          name: 'response',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as Abi,
  tokens = [],
  spender,
}: {
  wallet: TWallet
  config: Config
  abi?: Abi
  tokens: {
    tokenId: TokenId | string
    serial: number
  }[]
  spender: AccountId | ContractId | string
}): Promise<string | string[] | null> => {
  if (!wallet.signer) return null

  if (wallet.connector.type === ConnectorType.HEDERA) {
    const signer = wallet.signer as HederaSignerType
    const accountId = signer.getAccountId()
    const spenderId = typeof spender === 'string' ? ContractId.fromString(spender) : spender

    const allowanceApproveTransaction = new AccountAllowanceApproveTransaction()

    for (let { tokenId, serial } of tokens) {
      tokenId = typeof tokenId === 'string' ? TokenId.fromString(tokenId) : tokenId
      const nftId = new NftId(tokenId, serial)
      allowanceApproveTransaction.approveTokenNftAllowance(nftId, accountId, spenderId.toString())
    }

    const frozenTx = await allowanceApproveTransaction.freezeWithSigner(signer)
    const signTx = await frozenTx.signWithSigner(signer)
    const txResponse = await signTx.executeWithSigner(signer)

    return txResponse.transactionId?.toString() ?? null
  }

  return Promise.all(
    tokens.map(async ({ tokenId, serial }) => {
      tokenId = typeof tokenId === 'string' ? TokenId.fromString(tokenId) : tokenId
      const contractAddress = toEvmAddress(tokenId)
      const spenderId =
        typeof spender === 'string' ? toEvmAddress(ContractId.fromString(spender)) : toEvmAddress(spender)

      return await writeContract(config, {
        address: contractAddress,
        abi,
        functionName: 'approve',
        args: [spenderId, serial],
      })
    }),
  )
}
