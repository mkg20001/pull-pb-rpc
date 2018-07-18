# pull-pb-rpc

Protocol Buffers RPC utility module for pull-streams

# Usage

```js
const conn = getConnectionSomehow()
const PBRPC = require('pull-pb-rpc')
const pbRPC = PBRPC()
const rpc = pbRPC.rpc

pull(
  conn,
  pbRPC,
  conn
)

rpc.read(Request).then(request => {
  // ...
})
```

# API

Constructor:
- `opts.timeout`: `Number` Default timeout for reading
- `opts.lpFixed`: `Boolean` Whether to use fixed length-prefixes instead of varInt ones
- `opts.lpMaxLength`: `Number` Default maximum message length in bytes for length-prefixed reads

`.read(Proto[, max, timeout, fixed])`
Read a Protocol Buffers message
- `Proto`: Protocol Buffers Protocol as returned by `protons`
- `max`: `Number` Maximum message length in bytes
- `timeout`: `Number` Timeout for reading
- `fixed`: `Boolean` Flag whether to use fixed length-prefixes instead of varInt ones

`.write(Proto, data[, fixed])`
Write a Protocol Buffers message
- `Proto`: Protocol Buffers Protocol as returned by `protons`
- `data`: `Object` Message payload
- `fixed`: `Boolean` Flag whether to use fixed length-prefixes instead of varInt ones

`.readLP([max, timeout, fixed])` Read a length-prefixed message
- `max`: `Number` Maximum message length in bytes
- `timeout`: `Number` Timeout for reading
- `fixed`: `Boolean` Flag whether to use fixed length-prefixes instead of varInt ones

`.writeLP(data[, fixed])` Write a length-prefixed message
- `data`: `Buffer` Message payload
- `fixed`: `Boolean` Flag whether to use fixed length-prefixes instead of varInt ones

`.readRaw(bytes[, timeout])` Read bytes
- `bytes`: `Number` Amount of bytes to read
- `timeout`: `Number` Timeout for reading

`.writeRaw(data)` Write bytes
- `data`: `Buffer` Message payload
