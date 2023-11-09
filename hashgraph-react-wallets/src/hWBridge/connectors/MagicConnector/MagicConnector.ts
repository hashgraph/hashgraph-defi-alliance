import { Magic } from 'magic-sdk'
import { SDKBase, InstanceWithExtensions } from '@magic-sdk/provider'
import { HederaExtension } from '@magic-ext/hedera'
import { OAuthExtension } from '@magic-ext/oauth'
import { MagicWallet } from './MagicWallet.js'
import { MagicProvider } from './MagicProvider.js'
import IConnector from '../../interfaces/IConnector.js'
import { HWBConnectorProps } from '../types.js'
import { HederaNetwork } from '../../types.js'
import { MagicConfig, MagicLoginConfig } from './types.js'
import { LoginModules } from './constants.js'

class MagicConnector implements IConnector {
  private readonly _network: HederaNetwork
  private readonly _config: MagicConfig
  private readonly _debug: boolean
  private readonly _magic: InstanceWithExtensions<SDKBase, HederaExtension[] | OAuthExtension[]>

  constructor({ network, config, debug = false }: HWBConnectorProps) {
    this._network = network
    this._config = config as MagicConfig
    this._debug = debug || false

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

  async checkExtensionPresence(): Promise<boolean> {
    if (this._debug) console.log('[Magic Connector]: Returning the magic instance presence')
    return !!this._magic
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

  getSdk(): Magic | InstanceWithExtensions<SDKBase, HederaExtension[]> {
    return this._magic as Magic | InstanceWithExtensions<SDKBase, HederaExtension[]>
  }
}

export default MagicConnector
