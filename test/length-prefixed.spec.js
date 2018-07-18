'use strict'

/* eslint-env mocha */

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const duplex = require('pull-pair/duplex')
const pbRPC = require('../')
const pull = require('pull-stream')
const promisify = require('promisify-es6')

describe('length-prefixed', () => {
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
    let cReq = Buffer.from('GET / LP 1.0')
    client.writeLP(cReq)
    const sReq = await server.readLP()
    // expect(sReq).to.equal(cReq) // TODO: does not work because very strict compare mode
    expect(String(sReq)).to.equal(String(cReq))

    let sRes = Buffer.from('Hello World!')
    server.writeLP(sRes)
    const cRes = await client.readLP()
    // expect(cRes).to.equal(sRes) // TODO: does not work because very strict compare mode
    expect(String(cRes)).to.equal(String(sRes))

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
