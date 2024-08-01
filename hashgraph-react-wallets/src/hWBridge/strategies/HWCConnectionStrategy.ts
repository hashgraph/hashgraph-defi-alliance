import { ConnectionStrategy } from './ConnectionStrategy'
import { ConnectionStrategyType, HederaNetworks } from '../..'
import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  ledgerIdToCAIPChainId,
} from '@hashgraph/hedera-wallet-connect'
import { SignClientTypes } from '@walletconnect/types'
import { LedgerId } from '@hashgraph/sdk'
import { Chain } from 'viem'

export interface HWCConnectionInitOpts {
  metadata: SignClientTypes.Metadata
  projectId: string
  methods?: string[]
  events?: string[]
  chains?: Chain[]
}

export class HWCConnectionStrategy extends ConnectionStrategy {
  constructor(public options: HWCConnectionInitOpts) {
    super(ConnectionStrategyType.HWC)
  }

  async build(chains: Chain[]): Promise<ConnectionStrategy> {
    const defaultChainId = chains[0].id
    const defaultLedgerId = LedgerId.fromString(HederaNetworks[defaultChainId])

    const methods = [...Object.values(HederaJsonRpcMethod), ...(this.options.methods ?? [])]
    const events = [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged, ...(this.options.events ?? [])]

    const chainsCAIP = [...chains, ...(this.options?.chains ?? [])].map((c) =>
      ledgerIdToCAIPChainId(LedgerId.fromString(HederaNetworks[c.id])),
    )

    const controller = new DAppConnector(
      this.options.metadata,
      defaultLedgerId,
      this.options.projectId,
      methods,
      events,
      chainsCAIP,
    )

    await controller.init()

    this.setController(controller)
    this.setSupportedChains(chains)

    return this
  }
}
