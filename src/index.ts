const _storageServices = {}

const registerStorageService = (service: any) => {
  _storageServices[service.name] = service.meta
}

const getStorageServices = (serviceNames?: string[]) => {
  if (!serviceNames || serviceNames.length === 0) {
    return _storageServices
  }
  const ret = {}
  for (const item of serviceNames) {
    ret[item] = _storageServices[item] || null
  }
  return ret
}

const store = async (service: string, source: string, paymentMeta?: any) => {
  if (!_storageServices[service]) {
    return null
  }
  const res = await _storageServices[service].storeFunc(source)
  return res
}

const load = async (service: string, uri: string) => {
  if (!_storageServices[service]) {
    return null
  }
  const source = await _storageServices[service].loadFunc(uri)
  return source
}
export const getStorageService = (name: string) => {
  return _storageServices[name]
}

export { store, load, getStorageServices, registerStorageService }
export default _storageServices
