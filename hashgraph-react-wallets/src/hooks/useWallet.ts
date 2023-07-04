import { HWBridgeSession } from '../hWBridge'
import { HWBridgeConnector } from '../hWBridge/connectors/types'
import { useHWBridge } from './useHWBridge'

export function useWallet<TConnector extends HWBridgeConnector>(connector?: TConnector): HWBridgeSession {
  const hWBridge = useHWBridge()

  if (!hWBridge) {
    return {} as HWBridgeSession
  }

  if (connector) {
    return hWBridge.getSessionFor(connector)
  }

  if (hWBridge.defaultConnector) {
    return hWBridge.getSessionFor(hWBridge.defaultConnector)
  }

  return hWBridge.connectedSessions.length > 0 ? hWBridge.connectedSessions[0] : ({} as HWBridgeSession)
}
