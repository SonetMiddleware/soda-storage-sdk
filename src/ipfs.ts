import { CID } from 'ipfs-http-client'
import { Function, registerStorageService } from './storage'
import { ipfsAdd, ipfsGet } from './utils/ipfsHandler'

const actions = [Function.store, Function.load]

const calPrice = () => {
  throw new Error('[storage-ipfs] Invalid action "calPrice".')
}
const store = async (source: File | Blob | ArrayBuffer | string) => {
  if (!actions.includes(Function.store))
    throw new Error('[storage-ipfs] Invalid action "store".')
  const hash = await ipfsAdd(source)
  console.debug('[storage-ipfs] store: ', hash)
  return hash
}

const getUrl = (uri: string, config?: any): string => {
  if (!uri) return null
  let source: string = uri
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return source
  }
  if (source.startsWith('ipfs://')) {
    source = source.substring(7)
  }
  // FIXME: optimize of well known source
  if (config && config.source == 'opensea') {
    // source = `https://opensea.mypinata.cloud/ipfs/${source}`
    source = `https://ipfs.io/ipfs/${source}`
  } else if (source.indexOf('/') >= 0) {
    source = `https://ipfs.io/ipfs/${source}`
  } else {
    const cidv1 = CID.parse(source).toV1().toString()
    source = `https://${cidv1}.ipfs.dweb.link/`
  }
  return source
}
const load = async (source: string, config?: any) => {
  if (!actions.includes(Function.load))
    throw new Error('[storage-ipfs] Invalid action "load".')
  console.debug('[storage-ipfs] load: ', source, config)
  let hash: string
  try {
    // Fix issue: json as source, hard code for backward compatible
    const json = JSON.parse(source)
    hash = json.image
  } catch (e) {
    hash = source
  }
  if (hash.startsWith('ipfs://')) hash = hash.substring(7)
  if (config && config.uri) {
    const src = getUrl(hash, config)
    let s: string
    const extra = []
    try {
      // FIXME: hard code for now, to get "image" from json source, for opensea NFT protocol
      s = await (await (await fetch(src, { mode: 'cors' })).blob()).text()
      const json = JSON.parse(s)
      s = json.image
      if (!s && json.animation_url) {
        // FIXME: hardcode for now
        extra['animation'] = { origin: json.animation_url }
      }
      if (json.presentation) {
        for (const k of Object.keys(json.presentation)) {
          extra[k] = {
            origin: json.presentation[k],
            uri: getUrl(json.presentation[k], config)
          }
        }
      }
    } catch (e) {
      s = src
    }
    const uri = getUrl(s, config)
    const res = { uri, origin: s, extra }
    console.debug('[soda-storage-ipfs] load resource with uri: ', res)
    return res
  } else {
    if (hash.startsWith('http://') || hash.startsWith('https://')) {
      return await (await fetch(hash)).blob()
    }
    const res = await ipfsGet(hash)
    return res
  }
}

const init = () => {
  registerStorageService({
    name: 'ipfs',
    meta: {
      calPrice,
      store,
      load
    }
  })
}

export default init
