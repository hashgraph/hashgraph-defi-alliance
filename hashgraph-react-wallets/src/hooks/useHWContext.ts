import { useContext } from 'react'
import { HWContext } from '../provider/HWContextProvider'

export const useHWContext = () => {
  const context = useContext(HWContext)

  if (!context) {
    throw new Error('This component must be rendered inside HWBridgeProvider.')
  }

  return context ?? null
}
