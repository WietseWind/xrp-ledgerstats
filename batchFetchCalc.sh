#!/bin/bash

self(){
  DIR=$( cd "$( dirname "$0" )/" && pwd)
  echo $DIR
}

cd $(self)

start=$1

echo "Batch fetch + calculate XRP ledgers;"
echo "Start at ledger:    $1"
echo "Use rippled server: $2"
echo "Ledger increments:  $3"

sleep 4

while [[ $start -gt 32569 ]]
do
    clear
    echo "Fetching ledger $start"
    sleep 1
    npm run fetch $start $2 >&1
    npm run stats $start >&1
    rm $(self)/data/$start.json
    start=$(( $start - $3 ))
done

echo "Done"