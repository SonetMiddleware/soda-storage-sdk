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
    source = `https://opensea.mypinata.cloud/ipfs/${source}`
  } else if (source.indexOf('/') >= 0) {
    source = `https://ipfs.io/ipfs/${source}`
  } else {
    source = `https://${source}.ipfs.dweb.link/`
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
    try {
      // FIXME: hard code for now, to get "image" from json source
      s = await (await (await fetch(src, { mode: 'cors' })).blob()).text()
      s = JSON.parse(s).image
    } catch (e) {
      s = src
    }
    const uri = getUrl(s, config)
    return uri
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
