// const IPFS = require('ipfs-api');
// const ipfs = new IPFS({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
// });
//
// const IpfsHttpClient = require('ipfs-http-client');
// const { create } = require('ipfs-http-client');
import { create } from 'ipfs-http-client'
const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
})

function binaryToArrayBuffer(data: any) {
  const arr = new Uint8Array(data.length)
  for (let i = 0, l = data.length; i < l; i++) {
    arr[i] = data.charCodeAt(i)
  }
}

const ipfsAdd = async (file: File | Blob | ArrayBuffer | string) => {
  async function toBuffer(ab: any) {
    if (ab instanceof ArrayBuffer) {
      const buf = new Buffer(ab.byteLength)
      const view = new Uint8Array(ab)
      for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i]
      }
      return buf
    } else if (ab instanceof File) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsArrayBuffer(ab)
        fileReader.onload = function (e) {
          resolve(Buffer.from(fileReader.result as string))
        }
      })
    } else if (typeof ab === 'string' && ab.startsWith('http')) {
      const response = await fetch(ab)
      const res = await response.arrayBuffer()
      return Buffer.from(res)
    }
  }
  const buf: any = await toBuffer(file)
  const res = await ipfsClient.add(buf)
  const hash = res.cid.toV1().toString() // get v1 cid
  return hash
}

const ipfsGet = async (cid: string) => {
  const res = await ipfsClient.get(cid)
  if (res[0] && res[0].content) {
    return res[0].content as Uint8Array
  }
  return null
}

// set image's src
const getImgDataFromU8Array = (content: Uint8Array) => {
  return URL.createObjectURL(
    new Blob([content.buffer], { type: 'image/png' } /* (1) */)
  )
}

export { ipfsAdd, ipfsGet, getImgDataFromU8Array }
