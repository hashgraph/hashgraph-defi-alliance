import { HashpackHNSResolver } from './hashpack'

export type HNSResolver = typeof HashpackHNSResolver

export type HNSResult = {
  hnsName: string
  avatar: string
  tokenId: string
  serial: number
}
