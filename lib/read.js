/**
 * 
 * @module bsa/read
 * @license
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Dmitry Tsvettsikh
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict'

const nullstr = require('./nullstr')

module.exports = {
  header,
  folder,
  tree
}

/**
 * read file header
 * @param buf {Buffer}
 */
function header(buf) {
  const sign = buf.slice(0, 3)  // must be "BSA"
  const version = buf.readUInt32LE(4) // 0x67 for TES 4, 0x68 for TES 5
  const offset = buf.readUInt32LE(8)  // Offset of beginning of folder records.
  const archiveFlags = buf.readUInt32LE(12)

  const folders = buf.readUInt32LE(16)
  const files = buf.readUInt32LE(20)
  const totalFolderNameLength = buf.readUInt32LE(24)
  const totalFileNameLength = buf.readUInt32LE(28)
  const fileFlags = buf.readUInt32LE(32)

  return {
    sign,
    version,
    offset,
    archiveFlags,
    folders,
    files,
    totalFolderNameLength,
    totalFileNameLength,
    fileFlags
  }
}

/**
 * read folder info block
 * @param buf {Buffer}
 */
function folder(buf, offset) {
  offset = offset >>> 0

  const hash = buf.slice(offset, offset + 8)
  const count = buf.readUInt32LE(offset + 8)
  const folder_offset = buf.readUInt32LE(offset + 12)

  return {
    hash,
    count,
    offset: folder_offset
  }
}

/**
 * read files for provided folder
 * @param buf {Buffer}
 * @param folder {object} folder object from folder() associated with this tree
 */
function tree(buf, folder, offset) {
  offset = offset >>> 0

  const files = new Array(folder.count)
  const name = nullstr(!offset ? buf : buf.slice(offset)).toString('ascii')

  const start = offset + name.length + 1
  buf = buf.slice(start, start + files.length * 16)

  for(var i = 0; i < files.length; ++i) {
    files[i] = {
      size: buf.readUInt32LE(i * 16 + 8),
      offset: buf.readUInt32LE(i * 16 + 12)
    }
  }

  return {
    name,
    size: name.length + 1 /* \0 */ + files.length * 16,
    files
  }
}
