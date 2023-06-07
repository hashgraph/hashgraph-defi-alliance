import { HWBridgeSession } from '../hWBridge'
import { useHWBridge } from './useHWBridge'

export function useConnectedWallets(): HWBridgeSession[] {
  const hWBridge = useHWBridge()

  if (!hWBridge) {
    return []
  }

  return hWBridge.connectedSessions
}
