export const OAUTH_DEFAULT_REDIRECT_PATH = '/magic-oauth'

export enum LoginModules {
  Auth = 'auth',
  OAuth = 'oauth',
}

export enum MagicLoginMethods {
  LoginWithCredentials = 'loginWithCredential',
  LoginWithEmailOTP = 'loginWithEmailOTP',
  LoginWithMagicLink = 'loginWithMagicLink',
  LoginWithSMS = 'loginWithSMS',
}
