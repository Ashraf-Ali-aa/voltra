#!/usr/bin/env node
// Decodes Voltra payload
// Usage: node decode-payload.js <base64-string>

const { brotliDecompress } = require('node:zlib')
const { promisify } = require('node:util')
const { Buffer } = require('node:buffer')

const brotliDecompressAsync = promisify(brotliDecompress)

const payload = process.argv[2]

if (!payload) {
  console.error('Usage: node decode-payload.js <base64-string>')
  process.exit(1)
}

;(async () => {
  try {
    const compressedBuffer = Buffer.from(payload, 'base64')
    const decompressedBuffer = await brotliDecompressAsync(compressedBuffer)
    const jsonString = decompressedBuffer.toString('utf8')
    process.stdout.write(jsonString)
  } catch (err) {
    console.error('Decode error:', err.message)
    process.exit(1)
  }
})()
