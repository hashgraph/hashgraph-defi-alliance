import { HWCConnectionInitOpts } from './HWCConnectionStrategy'
import { WagmiConnectionInitOpts } from './WagmiConnectionStrategy'

export type StrategyConfig = HWCConnectionInitOpts | WagmiConnectionInitOpts
