const _storageServices = {}

export const Function = {
  load: 'load',
  store: 'store'
}

export const registerStorageService = (service: any) => {
  _storageServices[service.name] = service.meta
}

export const getStorageServices = (serviceNames?: string[]) => {
  if (!serviceNames || serviceNames.length === 0) {
    return _storageServices
  }
  const ret = {}
  for (const item of serviceNames) {
    ret[item] = _storageServices[item] || null
  }
  return ret
}
export const getStorageService = (name: string) => {
  return _storageServices[name]
}

export const store = async (
  service: string,
  source: string,
  paymentMeta?: any
) => {
  if (!_storageServices[service]) {
    throw new Error('Service not found.')
  }
  try {
    const res = await _storageServices[service].store(source)
    return res
  } catch (e) {
    console.error(e)
    throw e
  }
}

export const load = async (
  service: string,
  meta: { uri: string; config?: any }
) => {
  if (!_storageServices[service]) {
    throw new Error('Service not found.')
  }
  try {
    const { uri, config } = meta
    const source = await _storageServices[service].load(uri, config)
    return source
  } catch (e) {
    console.error(e)
    throw e
  }
}
