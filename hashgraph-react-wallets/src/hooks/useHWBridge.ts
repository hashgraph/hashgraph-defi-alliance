import { useContext } from 'react'
import { HWBridgeContext } from '../provider/HWBridgeProvider'

export const useHWBridge = () => {
  const context = useContext(HWBridgeContext)

  if (!context) {
    throw new Error('This component must be rendered inside HWBridgeProvider.')
  }

  return context.hWBridge ?? null
}
