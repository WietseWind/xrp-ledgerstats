process.stdout.write('\033c')

const numeral = require('numeral')
const fs = require('fs')
const JSONStream = require('JSONStream')
const WebSocket = require('ws')
let endpoint = 'wss://s1.ripple.com'
if (process.argv.length > 3) {
  endpoint = process.argv[3]
  if (!endpoint.match(/^ws[s]*:\/\//)) {
    endpoint = 'wss://' + endpoint
  }
}
console.log('Connecting to rippled running at:', endpoint)
console.log('')
const ws = new WebSocket(endpoint)

let ledger = null
let calls = 0
let records = 0
let lastMarker = ''
let transformStream
let outputStream

const send = (requestJson) => {
  calls++
  ws.send(JSON.stringify(requestJson))
}

ws.on('open', function open () {
  let requestLedgerIndex = 'closed'
  if (process.argv.length > 2) {
    if (process.argv[2].match(/^[0-9]+$/)) {
      requestLedgerIndex = parseInt(process.argv[2])
    }
  }
  send({ command: 'ledger', ledger_index: requestLedgerIndex })
})
 
let req = { command: 'ledger_data', ledger: null, type: 'account', limit: 20000 }
ws.on('message', function incoming (data) {
  const r = JSON.parse(data)

  if (ledger === null) {
    if (typeof r.error_message === 'undefined') {
      ledger = r.result.ledger
      req.ledger = ledger.hash
      console.log('Now fetching XRP ledger', ledger.ledger_index)
      console.log('')
      console.log(' -- Ledger close time:  ', ledger.close_time_human)
      console.log(' -- Ledger hash:        ', ledger.hash)
      console.log(' -- Total XRP existing: ', numeral(parseInt(ledger.total_coins) / 1000000).format('0,0.000000'))
      console.log('')

      let filename = ledger.ledger_index + '.json'
      let stats = {
        hash: ledger.hash,
        ledger_index: parseInt(ledger.ledger_index),
        close_time_human: ledger.close_time_human,
        total_coins: parseInt(ledger.total_coins) / 1000000
      }
      transformStream = JSONStream.stringify('{\n  "stats": ' + JSON.stringify(stats) + ',\n  "balances": [\n    ', ',\n    ', '\n  ]\n}\n')
      outputStream = fs.createWriteStream(__dirname + '/data/' + filename)
      transformStream.pipe(outputStream)
      outputStream.on('finish', function handleFinish () {
        console.log('')
        console.log('Done! wrote records:', records, 'to:', './data/' + filename)
        console.log('')
        console.log('Now you can retrieve the stats for this ledger by running:')
        console.log('  npm run stats ' + ledger.ledger_index)
        console.log('')
        process.exit(0)
      })

      send(req)
    } else {
      console.log('Error from rippled:', r.error_message)
      ws.close()
    }
  } else {
    if (r.status && r.status === 'success' && r.type && r.type === 'response') {
      if (r.result.state !== null) {
        r.result.state.forEach((i) => {
          records++
          transformStream.write({ a: i.Account, b: parseInt(i.Balance) / 1000000 })
        })
      }
      
      process.stdout.write('  > Retrieved '  + records + ' accounts in ' + calls + ' calls to rippled...' + "\r");

      if (typeof r.result.marker === 'undefined' || r.result.marker === null || r.result.marker === lastMarker) {
        // No new marker
        console.log('')

        transformStream.end()
      } else {
        // Continue 
        req.marker = r.result.marker
        lastMarker = req.marker
        send(req)
      }
    } else {
      throw new Error('Response error...')
    }
  }
})