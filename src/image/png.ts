import { deflateSync } from 'node:zlib'
import { Vec3 } from '../math/vec'

/** 将 32 位无符号整数以大端字节序写入 4 字节 Buffer（PNG 规范要求大端）。 */
function u32be(n: number) {
  const b = Buffer.allocUnsafe(4)
  b.writeUInt32BE(n)
  return b
}

/**
 * 构造一个 PNG 数据块（chunk）。
 * PNG 块格式：[4字节 数据长度][4字节 类型ASCII][数据][4字节 CRC-32]
 * CRC-32 覆盖「类型 + 数据」，使用 IEEE 802.3 多项式 0xEDB88320（反射位序）。
 */
function chunk(type: string, data: Buffer) {
  const t = Buffer.from(type, 'ascii')
  const len = u32be(data.length)
  // CRC covers type + data
  const crcBuf = Buffer.concat([t, data])
  let crc = 0xffffffff
  for (const byte of crcBuf) {
    crc ^= byte
    // 逐位展开（Sarwate 算法内联版），多项式 0xEDB88320 为 IEEE 802.3 反射形式
    for (let k=0;k<8;k++) crc = (crc&1) ? (crc>>>1)^0xedb88320 : crc>>>1
  }
  crc ^= 0xffffffff
  return Buffer.concat([len, t, data, u32be(crc>>>0)])
}

/**
 * 将帧缓冲（线性 RGB float [0,1]）编码为 PNG Buffer，可直接发送或写文件。
 *
 * PNG 结构：
 *   签名(8B) → IHDR → IDAT（zlib压缩扫描行）→ IEND
 *
 * IHDR 参数：位深度=8（每通道8位），颜色类型=2（RGB，无 alpha）。
 * 扫描行格式（filter=None）：每行首字节 0x00，后跟 w×3 字节 RGB，y=0 为图像顶部。
 */
export function encodePNG(w: number, h: number, frameBuffer: Vec3[]): Buffer {
  // 构建原始扫描行：每行 = [0x00 filter] + [R G B × w]
  const raw = Buffer.allocUnsafe(h * (1 + w * 3))
  for (let y=0;y<h;y++) {
    raw[y*(1+w*3)] = 0 // filter: None（不做行滤波）
    for (let x=0;x<w;x++) {
      const px = frameBuffer[y*w+x]
      const off = y*(1+w*3)+1+x*3
      raw[off]   = Math.max(0,Math.min(255,Math.round(px.x*255)))  // R
      raw[off+1] = Math.max(0,Math.min(255,Math.round(px.y*255)))  // G
      raw[off+2] = Math.max(0,Math.min(255,Math.round(px.z*255)))  // B
    }
  }

  const sig  = Buffer.from([137,80,78,71,13,10,26,10])  // PNG 魔数 \x89PNG\r\n\x1a\n
  const ihdr = chunk('IHDR', Buffer.concat([u32be(w), u32be(h), Buffer.from([8,2,0,0,0])]))
  const idat = chunk('IDAT', deflateSync(raw))           // Node.js 内置 zlib 压缩
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}
