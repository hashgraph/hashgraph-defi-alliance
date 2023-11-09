import {
  LoginWithMagicLinkConfiguration,
  LoginWithSmsConfiguration,
  LoginWithEmailOTPConfiguration,
} from '@magic-sdk/types'
import { OAuthRedirectConfiguration } from '@magic-ext/oauth'
import { LoginModules, MagicLoginMethods } from './constants'

type LoginMethodsMap = {
  [MagicLoginMethods.LoginWithCredentials]: string
  [MagicLoginMethods.LoginWithEmailOTP]: LoginWithEmailOTPConfiguration
  [MagicLoginMethods.LoginWithMagicLink]: LoginWithMagicLinkConfiguration
  [MagicLoginMethods.LoginWithSMS]: LoginWithSmsConfiguration
}

export type MagicLoginConfig = {
  loginModule: LoginModules
  method: keyof LoginMethodsMap
  args: LoginMethodsMap[keyof LoginMethodsMap] | Omit<OAuthRedirectConfiguration, 'redirectURI'>
}

export type MagicConfig = {
  publicApiKey?: string
}
