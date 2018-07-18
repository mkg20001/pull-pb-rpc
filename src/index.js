'use strict'

const pull = require('pull-stream')
const lp = require('pull-length-prefixed')
const Handshake = require('pull-handshake')
const promisify = require('promisify-es6')

function boolOr (b1, b2) {
  if (b1 != null) { return Boolean(b1) }
  if (b2 != null) { return Boolean(b2) }
  return false
}

module.exports = function (opts, handshakeFinish) {
  const shake = Handshake(opts, handshakeFinish)
  const {handshake} = shake

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
    readRaw: promisify((bytes, timeout, cb) => handshake.read(bytes, timeout, cb)),
    writeRaw: (bytes) => {
      handshake.write(bytes)
    },

    // util
    abort: handshake.abort,
    rest: handshake.rest
  }

  return {
    rpc,
    sink: shake.sink,
    source: shake.source
  }
}
