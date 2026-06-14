import { deflateSync } from 'node:zlib'
import { Vec3 } from '../math/vec'

function u32be(n: number) {
  const b = Buffer.allocUnsafe(4)
  b.writeUInt32BE(n)
  return b
}

function chunk(type: string, data: Buffer) {
  const t = Buffer.from(type, 'ascii')
  const len = u32be(data.length)
  // CRC covers type + data
  const crcBuf = Buffer.concat([t, data])
  let crc = 0xffffffff
  for (const byte of crcBuf) {
    crc ^= byte
    for (let k=0;k<8;k++) crc = (crc&1) ? (crc>>>1)^0xedb88320 : crc>>>1
  }
  crc ^= 0xffffffff
  return Buffer.concat([len, t, data, u32be(crc>>>0)])
}

export function encodePNG(w: number, h: number, frameBuffer: Vec3[]): Buffer {
  // Build raw scanlines with filter byte 0
  const raw = Buffer.allocUnsafe(h * (1 + w * 3))
  for (let y=0;y<h;y++) {
    raw[y*(1+w*3)] = 0 // filter: None
    for (let x=0;x<w;x++) {
      const px = frameBuffer[y*w+x]
      const off = y*(1+w*3)+1+x*3
      raw[off]   = Math.max(0,Math.min(255,Math.round(px.x*255)))
      raw[off+1] = Math.max(0,Math.min(255,Math.round(px.y*255)))
      raw[off+2] = Math.max(0,Math.min(255,Math.round(px.z*255)))
    }
  }

  const sig = Buffer.from([137,80,78,71,13,10,26,10])
  const ihdr = chunk('IHDR', Buffer.concat([u32be(w), u32be(h), Buffer.from([8,2,0,0,0])]))
  const idat = chunk('IDAT', deflateSync(raw))
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}
