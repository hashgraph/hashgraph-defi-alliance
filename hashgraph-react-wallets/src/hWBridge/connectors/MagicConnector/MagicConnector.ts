import { Magic } from 'magic-sdk'
import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider'
import { HederaExtension } from '@magic-ext/hedera'
import { OAuthExtension } from '@magic-ext/oauth'
import { MagicWallet } from './MagicWallet'
import { MagicProvider } from './MagicProvider'
import { HWBConnectorProps } from '../types'
import { MagicLoginConfig } from './types'
import { LoginModules } from './constants'
import MagicIconWhite from '../../../assets/magic-icon.png'
import MagicIconDark from '../../../assets/magic-icon-dark.png'
import BaseConnector from '../BaseConnector'

class MagicConnector extends BaseConnector {
  private readonly _magic: InstanceWithExtensions<SDKBase, HederaExtension[] | OAuthExtension[]>

  constructor({ network, metadata, config, debug = false }: HWBConnectorProps) {
    super({ network, metadata, config, debug })

    this._config = {
      icons: {
        white: MagicIconWhite,
        dark: MagicIconDark,
        ...config?.icons,
      },
      ...config,
    }

    if (!this._config?.publicApiKey) throw new Error('`publicApiKey` is missing from MagicConnector config')

    this._magic = new Magic(this._config.publicApiKey || '', {
      extensions: [new HederaExtension({ network: this._network }), new OAuthExtension()],
    })
  }

  async _createMagicWallet() {
    const magicSign = (message: Uint8Array) => this._magic.hedera.sign(message)

    const publicAddress = (await this._magic.user.getInfo()).publicAddress
    const { publicKeyDer } = await this._magic.hedera.getPublicKey()

    return new MagicWallet({
      accountId: publicAddress || '',
      provider: new MagicProvider(this._network),
      publicKey: publicKeyDer,
      magicSign,
    })
  }

  async getConnection(): Promise<MagicWallet | null> {
    if (this._debug) console.log('[Magic Connector]: Looking for an existing session')

    if (window.location.pathname === '/oauth') {
      const oAuthResult = await this._magic.oauth.getRedirectResult()

      if (oAuthResult.oauth?.accessToken) {
        if (this._debug) console.log('[Magic Connector]: There is an active oAuth session. Returning the wallet')

        return await this._createMagicWallet()
      }
    }

    if (await this.isWalletStateAvailable()) {
      if (this._debug) console.log('[Magic Connector]: There is an active session. Returning the wallet')

      return await this._createMagicWallet()
    }

    return null
  }

  async newConnection(props: MagicLoginConfig): Promise<MagicWallet | null> {
    if (this._debug) console.log('[Magic Connector]: Trying to create a new connection')
    return new Promise<MagicWallet | null>((resolve) => {
      this.checkExtensionPresence().then(async (isExtensionPresent) => {
        if (!isExtensionPresent) {
          if (this._debug && !isExtensionPresent) console.log('[Magic Connector]: Could not find a Magic instance')

          return resolve(null)
        }

        if (props.loginModule === LoginModules.Auth) {
          await this._magic.auth[props.method]?.(props.args as any)
        } else {
          await this._magic.oauth.loginWithRedirect({
            ...(props.args as any),
            redirectURI: window.location.href + 'oauth',
          })
        }

        return await this._createMagicWallet().then((wallet) => resolve(wallet))
      })
    })
  }

  async isWalletStateAvailable(): Promise<boolean> {
    return await this._magic.user.isLoggedIn()
  }

  async wipePairingData(): Promise<boolean> {
    try {
      if (this._debug) console.log('[Blade Connector]: Kill Magic Wallet session')
      return await this._magic.user.logout()
    } catch (e) {
      console.error(e)
      return false
    }
  }

  get sdk(): Magic | InstanceWithExtensions<SDKBase, HederaExtension[]> {
    return this._magic as Magic | InstanceWithExtensions<SDKBase, HederaExtension[]>
  }
}

export default MagicConnector
