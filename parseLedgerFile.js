process.stdout.write('\033c')

const numeral = require('numeral')
const fs = require('fs')

const instructions = () => {
    console.log('Error: please enter the (fetched) ledger number (after the command to execute)')
    console.log('You can find the ledger number by checking the ./data/ folder (without the `.json` part)')
    console.log('')
    console.log('  eg. npm run stats 32570')
    console.log('')
    console.log('If you didn\'t fetch this ledger data first:')
    console.log('  npm run fetch')
    console.log('')
    process.exit(0)
}

if (process.argv.length < 3) {
    instructions()
}

let filename = parseInt(process.argv[2].split('.')[0]) + '.json'
if (fs.existsSync(__dirname + '/data/' + filename)) {
    console.log('Reading ledger stats:', filename)
    let data = JSON.parse(fs.readFileSync(__dirname + '/data/' + filename))
    console.log('  > Done')
    console.log(' -- Accounts:             ', data.balances.length)
    console.log(' -- Ledger close time:    ', data.stats.close_time_human)
    console.log(' -- Ledger hash:          ', data.stats.hash)
    console.log(' -- Total XRP existing:   ', numeral(data.stats.total_coins).format('0,0.000000'))
    console.log('')
    console.log('Calculating spendable XRP sum')
    let balanceSum = data.balances.reduce((a, b) => { return a + b.b }, 0)
    console.log('  > Done')
    console.log(' -- Accounts balance sum: ', numeral(balanceSum).format('0,0.000000'))
    console.log('')

    console.log('Sorting balances')
    data.balances.sort((a, b) => { return (a.b > b.b) ? -1 : ((b.b > a.b) ? 1 : 0) })
    console.log('  > Done')
    console.log('')

    console.log('Stats 🎉')
    console.log('')
    console.log(' -- Top 100')
    let top100sum = data.balances.slice(0,100).reduce((a, b) => { return a + b.b }, 0)
    console.log('  > Balance sum                                  ', numeral(top100sum).format('0,0.000000'))
    console.log('  > Balance percentage (vs. Total XRP existing)  ', numeral(top100sum / data.stats.total_coins * 100).format('0.00') + ' %')
    console.log('  > Balance percentage (vs. Accounts balance sum)', numeral(top100sum / balanceSum * 100).format('0.00') + ' %')
    console.log('')
    console.log('More to come (Todo...)')
    console.log('')
} else {
    instructions()
}