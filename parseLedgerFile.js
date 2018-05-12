process.stdout.write('\033c')

const numeral = require('numeral')
const fs = require('fs')
const { table } = require('table')

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
let exportJson = {
    meta: {},
    top100Balance: 0,
    accountPercentageBalance: [],
    accountNumberBalanceRange: []
}
if (fs.existsSync(__dirname + '/data/' + filename)) {
    console.log('Reading ledger stats:', filename)
    let data = JSON.parse(fs.readFileSync(__dirname + '/data/' + filename))
    data.balances.sort((a, b) => { return (a.b > b.b) ? -1 : ((b.b > a.b) ? 1 : 0) })
    
    let numberOfAccounts = data.balances.length
    console.log(' -- Accounts:             ', numberOfAccounts)
    exportJson.meta.numberAccounts = numberOfAccounts
    console.log(' -- Ledger close time:    ', data.stats.close_time_human)
    exportJson.meta.ledgerClosedAt = data.stats.close_time_human
    console.log(' -- Ledger hash:          ', data.stats.hash)
    exportJson.meta.ledgerHash = data.stats.hash
    console.log(' -- Total XRP existing:   ', numeral(data.stats.total_coins).format('0,0.000000'))
    exportJson.meta.existingXRP = data.stats.total_coins
    console.log('')
    console.log('Calculating spendable XRP sum')
    let balanceSum = data.balances.reduce((a, b) => { return a + b.b }, 0)
    console.log(' -- Accounts balance sum: ', numeral(balanceSum).format('0,0.000000'))
    exportJson.top100Balance = balanceSum
    console.log('')

    console.log('Stats 🎉')
    console.log('')
    console.log(' -- Top 100')
    let top100sum = data.balances.slice(0, 100).reduce((a, b) => { return a + b.b }, 0)
    console.log('  > Balance sum                                  ', numeral(top100sum).format('0,0.000000'))
    console.log('  > Balance percentage (vs. Total XRP existing)  ', numeral(top100sum / data.stats.total_coins * 100).format('0.00') + ' %')
    console.log('  > Balance percentage (vs. Accounts balance sum)', numeral(top100sum / balanceSum * 100).format('0.00') + ' %')

    console.log('')
    console.log(' -- Percentage of accounts with balance starting at...')
    let percentages = [ 0.2, 0.5, 1, 2, 3, 4, 5, 10 ]
    let pctAccountsBalance = [ [ 'Percentage', '# Accounts', 'Balance equals (or greater than)' ] ]
    percentages.forEach(p => {
        let n = Math.round(numberOfAccounts / 100 * p)
        let e = data.balances.slice(0, n).reverse()[0].b
        pctAccountsBalance.push([ 
            p + ' %', 
            numeral(n).format('0,0.'), 
            numeral(e).format('0,0.000000') + ' XRP'
        ])
        exportJson.accountPercentageBalance.push({
            percentage: p,
            numberAccounts: n,
            balanceEqGt: e
        })
    })
    console.log(table(pctAccountsBalance, { 
        columns: {
            0: { alignment: 'right' },
            1: { alignment: 'right' },
            2: { alignment: 'right' }
        }
    }))
    // numberOfAccounts

    console.log('')
    console.log(' -- Number of accounts and sum of balance range')
    let balanceranges = [ 1000000000, 500000000, 100000000, 20000000, 10000000, 5000000, 1000000, 500000, 100000, 75000, 50000, 25000, 10000, 5000, 1000, 500, 0 ]
    let noAccountsBalanceRange = [ [ '# Accounts', 'Balance from', '... To', 'Sum (XRP)' ] ]
    let sliceFrom = 0
    let lastBalanceRange = 0
    let XbalanceSum = 0
    balanceranges.forEach(b => {
        let a = 0
        let f = b
        let t = lastBalanceRange
        let s = 0
        for (let i = sliceFrom; i < numberOfAccounts; i++) {
            if (data.balances[i].b < f) {
                sliceFrom = i
                break;
            } else {
                s += data.balances[i].b
                a++
            }
        }
        noAccountsBalanceRange.push([ 
            numeral(a).format('0,0.'),
            numeral(f).format('0,0.'),
            lastBalanceRange === 0 ? '∞' : numeral(t).format('0,0.'),
            numeral(Math.round(s)).format('0,0.000000')
        ])
        exportJson.accountNumberBalanceRange.push({
            numberAccounts: a,
            balanceFrom: f,
            balanceTo: t,
            balanceSum: s
        })
        lastBalanceRange = b
    })
    console.log(table(noAccountsBalanceRange, { 
        columns: {
            0: { alignment: 'right' },
            1: { alignment: 'right' },
            3: { alignment: 'right' }
        }
    }))
    console.log('')

    console.log('')
    console.log('---')
    console.log('Writing stats...')
    let exportFilename = __dirname + '/data/' + filename.replace(/.json$/, '.stats.json')
    fs.writeFileSync(exportFilename, JSON.stringify(exportJson), 'utf8');
    console.log(' > Stats written as JSON object to: ', exportFilename)
    console.log('')
} else {
    instructions()
}