import { HWBConnectorProps } from '../types'
import KabilaIconWhite from '../../../assets/kabila-icon.png'
import KabilaIconDark from '../../../assets/kabila-icon-dark.png'
import { HWCConnector } from '../HWCConnector'

class KabilaWalletConnector extends HWCConnector {
  constructor(props: HWBConnectorProps) {
    super({ ...props, extensionId: 'cnoepnljjcacmnjnopbhjelpmfokpijm' })

    this._config = {
      icons: {
        white: KabilaIconWhite,
        dark: KabilaIconDark,
        ...props.config?.icons,
      },
      ...props.config,
    }
  }

  get isExtensionRequired() {
    return true
  }
}

export default KabilaWalletConnector
