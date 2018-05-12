# XRP Ledger Stats

You can use this tool to fetch all the account balance information or a specific XRPL ledger number.

This tool will connect to a _rippled_-server using websockets. The default server it will connect to is `s1.ripple.com`. This server doesn't contain a lot of ledger history, so you can manually specify a different _rippled_-server. 

Please note: the public _rippled_ servers at `s1.ripple.com` (recent ledgers) and `s2.ripple.com` (full history) are used by many XRP apps and tools, so running your own _rippled_ server (and connecting to that one, of course) will definitely improve performance. ([rippled node: Docker Image](https://github.com/WietseWind/docker-rippled)).

## Workflow

You'll need to have [node (nodejs)](https://nodejs.org/en/download/) installed on your computer. Node runs the JS (Javascript) code in this repository [source]().

1. Clone this repository: 
`git clone `
2. Install dependencies: enter this folder (commandline) and run:
`npm install`
3. Fetch a specific ledger into a local `json` file
4. Read the ledger data (from the local `json` file) and calculate stats **(WORK IN PROGRESS!)**

## Syntax