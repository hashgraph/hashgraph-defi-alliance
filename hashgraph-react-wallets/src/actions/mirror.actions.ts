import { FetchQueryOptions } from '@tanstack/react-query'
import { tanstackQueryClient } from '..'
import { HederaChainIds, HederaNetworks } from '../constants'
import { HederaNetwork } from '../types'

export const queryMirror = async <MirrorData>({
  path,
  queryKey = ['rawMirrorQuery'],
  options = {
    network: HederaNetworks[HederaChainIds.testnet],
    firstOnly: false,
  },
}: {
  path: string
  queryKey: string[]
  options?: Omit<FetchQueryOptions<Response, Error, MirrorData, string[], never>, 'queryKey'> & {
    network: HederaNetwork
    firstOnly?: boolean
  }
}) => {
  const { network, ...rest } = options || {}
  const mirrorSubdomain = network === 'mainnet' ? 'mainnet-public' : 'testnet'
  const baseMirrorUrl = `https://${mirrorSubdomain}.mirrornode.hedera.com`

  const queryFn = async () => {
    let pages: any = []

    const walkLogs = async ({ path }: { path: string }) => {
      const response = await fetch(baseMirrorUrl + path)
      const jResponse = await response.json()

      if (!Object.keys(jResponse).length) return pages

      pages = [...pages, jResponse]

      if (!options.firstOnly && jResponse.links?.next) {
        await walkLogs({ path: jResponse.links.next })
      }
    }

    await walkLogs({ path })

    return pages.reverse()
  }

  try {
    return tanstackQueryClient.fetchQuery({
      queryKey,
      queryFn,
      ...rest,
    })
  } catch (e) {
    console.error(e)
  }

  return null
}

export const getContractResults = async <ContractResultsReturnType>({
  transactionIdOrHash,
  network,
}: {
  transactionIdOrHash: string
  network: HederaNetwork
}) => {
  return await queryMirror<ContractResultsReturnType>({
    path: '/api/v1/contracts/results/' + transactionIdOrHash,
    queryKey: ['contractResults', transactionIdOrHash, network],
    options: {
      network,
    },
  })
}

export const getTransactionsByTimestamp = async <TransactionsReturnType>({
  timestamp,
  network,
}: {
  timestamp: string
  network: HederaNetwork
}) => {
  return await queryMirror<TransactionsReturnType>({
    path: '/api/v1/transactions?timestamp=' + timestamp,
    queryKey: ['transactionsByTimestamp', timestamp, network],
    options: {
      network,
    },
  })
}

export const getTransactionsById = async <TransactionsReturnType>({
  transactionId,
  network,
}: {
  transactionId: string
  network: HederaNetwork
}) => {
  return await queryMirror<TransactionsReturnType>({
    path: '/api/v1/transactions/' + transactionId,
    queryKey: ['transactionsById', transactionId, network],
    options: {
      network,
    },
  })
}
