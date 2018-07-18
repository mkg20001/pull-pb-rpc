'use strict'

/* eslint-env mocha */

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const protons = require('protons')
const {Request, Response} = protons('message Request { string file = 1; } message Response { int64 error = 1; bytes content = 2; }')
const duplex = require('pull-pair/duplex')
const pbRPC = require('../')
const pull = require('pull-stream')
const promisify = require('promisify-es6')

describe('protocol-buffers', () => {
  let client
  let server

  beforeEach(() => {
    let [cSocket, sSocket] = duplex()
    client = pbRPC()
    server = pbRPC()
    pull(cSocket, client, cSocket)
    pull(sSocket, server, sSocket)
    client = client.rpc
    server = server.rpc
  })

  it('should properly transfer data back and forth', async () => {
    let cReq = {file: '/hello'}
    client.write(Request, cReq)
    const sReq = await server.read(Request)
    // expect(sReq).to.equal(cReq) // TODO: does not work because very strict compare mode
    expect(sReq.file).to.equal(cReq.file)

    let sRes = {error: 0, content: Buffer.from('world')}
    server.write(Response, sRes)
    const cRes = await client.read(Response)
    // expect(cRes).to.equal(sRes) // TODO: does not work because very strict compare mode
    expect(cRes.error).to.equal(sRes.error)
    expect(String(cRes.content)).to.equal(String(sRes.content))

    const cRest = client.rest()
    const sRest = server.rest()

    const cVal = Buffer.from('hi')
    const sVal = Buffer.from('hello')

    await Promise.all([
      promisify((cb) => {
        pull(
          pull.values([cVal]),
          cRest,
          pull.collect((err, res) => {
            expect(err).to.not.exist()
            // expect(res[0]).to.equal(sVal) // TODO: does not work because very strict compare mode
            expect(String(res[0])).to.equal(String(sVal))
            cb()
          })
        )
      })(),

      promisify((cb) => {
        pull(
          pull.values([sVal]),
          sRest,
          pull.collect((err, res) => {
            expect(err).to.not.exist()
            // expect(res[0]).to.equal(cVal) // TODO: does not work because very strict compare mode
            expect(String(res[0])).to.equal(String(cVal))
            cb()
          })
        )
      })()
    ])
  })

  it('should respect max option')

  it('should respect timeout option')

  it('should respect fixed option')
})
