import { HWBConnectorProps } from '../types'
import BladeIconWhite from '../../../assets/blade-icon.png'
import BladeIconDark from '../../../assets/blade-icon-dark.png'
import { HWCConnector } from '../HWCConnector'

class BladeWalletConnector extends HWCConnector {
  constructor(props: HWBConnectorProps) {
    super({ ...props, extensionId: 'abogmiocnneedmmepnohnhlijcjpcifd' })

    this._config = {
      icons: {
        white: BladeIconWhite,
        dark: BladeIconDark,
        ...props.config?.icons,
      },
      ...props.config,
    }
  }

  get isExtensionRequired() {
    return true
  }
}

export default BladeWalletConnector
