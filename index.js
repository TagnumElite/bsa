/**
 * Bethesda Softworks Archive CLI (de)compressor
 * @module bsa
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

const bitwise = require('./lib/bitwise')
const split = require('./lib/split')
const read = require('./lib/read')
const path = require('path')
const write = require('./lib/write')
const co = require('co')

module.exports = {
  // compress,
  extract,
  list
}

function list(buf) {
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError('Argument 1 must be a Buffer')
  }

  const header = read.header(buf)

  if (!bitwise.get(header.archiveFlags, 1) || !bitwise.get(header.archiveFlags, 2)) {
    throw new Error(`Archive doesn't contains real names of folders or files`)
  }

  const folders = new Array(header.folders)

  /* read folders */
  for(let i = 0, folders_offset = 0; i < header.folders; ++i) {
    const folder = read.folder(buf, folders_offset + header.offset)
    folders[i] = read.tree(buf, folder, folder.offset - header.totalFileNameLength + 1)

    folders_offset += 16
  }

  /* read file names */
  const file_names_offset = folders[0].files[0].offset - header.totalFileNameLength
  const names = split(buf.slice(file_names_offset, file_names_offset + header.totalFileNameLength), 0)

  /* join folder names and file names */
  const files = new Array( names.length )

  for(let i = 0, files_count = 0; i < folders.length; ++i) {
    const folder = folders[i]

    for(let j = 0; j < folder.files.length; ++j,++files_count) {
      files[files_count] = path.join(folder.name, names[files_count].toString('ascii'))
    }
  }

  return files
}

function extract(buf, where) {
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError('Argument 1 must be a Buffer')
  }

  where = where || '.'

  if (typeof where != 'string') {
    throw new TypeError('Argument 2 must be valid path to folder')
  }

  const header = read.header(buf)

  if (!bitwise.get(header.archiveFlags, 1) || !bitwise.get(header.archiveFlags, 2)) {
    throw new Error(`Archive doesn't contains real names of folders or files`)
  }

  const folder_record_size = 16
  var names

  return co(function* () {
    yield write.folder(where)

    /* read folders */
    for(let i = 0, folders_offset = 0, files_count = 0; i < header.folders; ++i) {
      const folder = read.folder(buf, folders_offset + header.offset)
      const tree = read.tree(buf, folder, folder.offset - header.totalFileNameLength + 1)

      /* read file names */
      if (i == 0) {
        const names_offset = tree.files[0].offset - header.totalFileNameLength
        names = split(buf.slice(names_offset, names_offset + header.totalFileNameLength), 0)
      }

      yield write.folder(path.join(where, tree.name))

      for(const file of tree.files) {
        /* join file name */
        const name = names[files_count].toString('ascii')

        /* read file data */
        const data = buf.slice(file.offset, file.offset + file.size)

        yield write.file(path.join(where, tree.name, name), data)
        ++files_count
      }

      folders_offset += folder_record_size
    }
  })
}
