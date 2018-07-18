'use strict'

const pull = require('pull-stream')
const lp = require('pull-length-prefixed')
const Handshake = require('pull-handshake')
const promisify = require('promisify-es6')

function boolOr (b1, b2) { // [false, undef] => false; [false, true] => false
  if (b1 != null) { return Boolean(b1) }
  if (b2 != null) { return Boolean(b2) }
  return false
}

module.exports = function (opts, handshakeFinish) {
  const shake = Handshake(opts, handshakeFinish)
  const {handshake} = shake

  let rested = false
  const rpc = {
    // protocol buffers
    read: async (proto, max, timeout, fixed) => {
      const data = await rpc.readLP(max, timeout, fixed)
      return proto.decode(data)
    },
    write: (proto, data) => {
      rpc.writeLP(proto.encode(data))
    },

    // length prefixed
    readLP: promisify((max, timeout, fixed, cb) => {
      if (typeof fixed === 'function') {
        cb = fixed
        fixed = undefined
      }

      if (typeof timeout === 'function') {
        cb = timeout
        fixed = undefined
        timeout = undefined
      }

      if (typeof max === 'function') {
        cb = max
        fixed = undefined
        timeout = undefined
        max = undefined
      }

      let opt = {
        fixed: boolOr(fixed, opts.lpFixed),
        maxLength: max || opts.lpMaxLength
      }
      lp.decodeFromReader({read: (bytes, cb) => rpc.readRaw(bytes, timeout || cb, cb)}, opt, cb)
    }),
    writeLP: (buffer, fixed) => {
      let opt = {
        fixed: boolOr(fixed, opts.lpFixed)
      }
      pull(
        pull.values([buffer]),
        lp.encode(opt),
        pull.drain(data => rpc.writeRaw(data))
      )
    },

    // raw bytes
    readRaw: promisify((bytes, timeout, cb) => handshake.read(bytes, timeout || opts.timeout, cb)), // note that if no user timeout then timeout = cb which makes handshake use default timeout aka opts.timeout. "|| opts.timeout" only does something if timeout is falsy
    writeRaw: (bytes) => {
      handshake.write(bytes)
    },

    // util
    abort: handshake.abort,
    rest: () => {
      rested = true
      return handshake.rest()
    },
    rested: () => rested
  }

  return {
    rpc,
    sink: shake.sink,
    source: shake.source
  }
}
