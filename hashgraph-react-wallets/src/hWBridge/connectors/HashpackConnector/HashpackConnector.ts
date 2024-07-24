import { HNSResult } from '../../types'
import { HWBConnectorProps } from '../types'
import HashpackIconWhite from '../../../assets/hashpack-icon.png'
import HashpackIconDark from '../../../assets/hashpack-icon-dark.png'
import { HashpackHNSResolver } from '../../hnsResolvers'
import { HWCConnector } from '../HWCConnector'
import { chainToNetworkName } from '../../../utils'

class HashpackWalletConnector extends HWCConnector {
  constructor(props: HWBConnectorProps) {
    super({ ...props, extensionId: 'gjagmgiddbbciopjhllkdnddhcglnemk' })

    this._config = {
      icons: {
        white: HashpackIconWhite,
        dark: HashpackIconDark,
        ...props.config?.icons,
      },
      ...props.config,
    }
  }

  async resolveHNS(accountId: string): Promise<HNSResult | null> {
    const hnsResolver = new HashpackHNSResolver({ network: chainToNetworkName(this._strategy.chain) })
    return await hnsResolver.get(accountId)
  }

  get isExtensionRequired() {
    return true
  }
}

export default HashpackWalletConnector
