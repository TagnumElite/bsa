/**
 * 
 * @module bsa/bitwise
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

/* bitwise ops */

const bits = [
  0x1,  /* 1 */
  0x2,  /* 2 */
  0x4,  /* 3 */
  0x8,  /* 4 */
  0x10, /* 5 */
  0x20, /* 6 */
  0x40, /* 7 */
  0x80  /* 8 */
]

/**
 * read bit from number
 * @param num {number}
 * @param bit {number} bit, [1 - 32]
 */
exports.get = function bitwise_get (num, bit) {
  if (typeof num !== 'number') {
    throw new TypeError('Argument 1 must be a number')
  }

  if (bit > 32 || bit < 1) {
    throw new RangeError('Only 32-bit values supported')
  }

  if (bit <= 8) {           /* 1st byte */
    return check_bit(num, bit)
  } else if (bit <= 16) {   /* 2nd byte */
    return check_bit(num >> 8, bit - 8)
  } else if (bit <= 24) {
    return check_bit(num >> 16, bit - 16)
  } else {
    return check_bit(num >> 24, bit - 24)
  }
}

function check_bit(byte, bit) {
  return byte & bits[bit - 1]
}
