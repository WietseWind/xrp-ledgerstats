# XRP Ledger Stats

You can use this tool to fetch all the account balance information or a specific XRPL ledger number.

This tool will connect to a _rippled_-server using websockets. The default server it will connect to is `s1.ripple.com`. This server doesn't contain a lot of ledger history, so you can manually specify a different _rippled_-server. 

Please note: the public _rippled_ servers at `s1.ripple.com` (recent ledgers) and `s2.ripple.com` (full history) are used by many XRP apps and tools, so running your own _rippled_ server (and connecting to that one, of course) will definitely improve performance. ([rippled node: Docker Image](https://github.com/WietseWind/docker-rippled)).

## Workflow

You'll need to have [node (nodejs)](https://nodejs.org/en/download/) installed on your computer. Node runs the JS (Javascript) code in this repository [source]().

1. Clone this repository: 
`git clone https://github.com/WietseWind/xrp-ledgerstats.git`
2. Install dependencies: enter this folder (commandline) and run:
`npm install`
3. Fetch a specific ledger into a local `json` file
4. Read the ledger data (from the local `json` file) and calculate stats **(WORK IN PROGRESS!)**

![Demo](https://jtfdmop.dlvr.cloud/XRP%20stats.gif)

## Syntax

### Fetch ledger account data into .json file

Run the code to fetch all account balances using:

```
npm run fetch
```

If you don't append any arguments, the latest (closed) ledger will be fetched from the public `s1.ripple.com` server.

If you want to fetch a specific ledger, append the ledger index:

```
npm run fetch 38596307
```

**Please note:** to fetch a specific ledger, the server should have the data for this ledger. If you want to fetch a ledger that goes way back in time, you'll probably want to query `s2.ripple.com` (full history servers):

If you want to query a specific _rippled_ node:
```
npm run fetch 32570 s2.ripple.com
```

(This tool will assume secure websockets (`wss://`) if you only enter a hostname. Prepend `ws://` to connect to an insecure host)

Instead of a ledger number (or omitting one) you can also enter one of the _rippled_ [ledger info keywords](https://ripple.com/build/rippled-apis/#specifying-ledgers):


```
npm run fetch "closed" s2.ripple.com
```

**The tool will save the balance information for the ledger in `./data/ledgerno.json`, eg. `./data/38596307.json`.

### JSON output format

The JSON files stored in the `./data/` folder will contain all the accounts (`balances[x].a`) found in the given ledger index with their balances (`balances[x].b`):

```
{
  "stats": {
    "hash":"4109C6F2045FC7EFF4CDE8F9905D19C28820D86304080FF886B299F0206E42B5",
    "ledger_index":32570,
    "close_time_human":"2013-Jan-01 03:21:10"
    ,"total_coins":99999999999.99632
  },
  "balances": [
    {"a":"rBKPS4oLSaV2KVVuHH8EpQqMGgGefGFQs7","b":370},
    {"a":"rLs1MzkFWCxTbuAHgjeTZK4fcCDDnf2KRv","b":10000},
    {"a":"rpGaCyHRYbgKhErgFih3RdjJqXDsYBouz3","b":10000000},
    {"a":"rUnFEsHjxqTswbivzL2DNHBb34rhAgZZZK","b":10000},
    [ ... more data ]
  ]
}
```


### Process ledger data from .json file (to stats)

Run:

```
npm run stats 32570
```

... where `32570` is the ledger index you want to process. You should -of course- have fetched this ledger first.