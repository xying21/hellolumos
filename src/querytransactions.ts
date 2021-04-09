import { TransactionCollector } from "@ckb-lumos/indexer";
import { Script, ScriptWrapper, Transaction, TransactionWithStatus} from "@ckb-lumos/base";

import {CONFIG, INDEXER} from "./index";
import { Hash } from "crypto";
import { RPC } from "@ckb-lumos/rpc";

const rpc = new RPC("http://127.0.0.1:8114");

export async function getTxsbyLock (
  lockScript: Script,
) {
  console.log("Get transactions by lock script:");
  const txCollector = new TransactionCollector(INDEXER,{lock:lockScript});
  const txs:Transaction[]= [];
  for await (const txWithStatus of txCollector.collect()) {
    //@ts-ignore
    const tx = txWithStatus.transaction; 
    //@ts-ignore
    const txStatus=txWithStatus.tx_status.status;
    txs.push(tx);
    //console.log(txStatus);
  }
  return txs;
}


 export async function getTxsbetweenBlocks (
    lockScript: Script,
    fromBlock: string,
    toBlock: string
  )  {
    const txCollector = new TransactionCollector(INDEXER,{lock:lockScript,fromBlock,toBlock});
    console.log("Get transactions between given blocks:");
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function getTxsandSkip (
    lock: Script,
    skip: number
  )  {
    const txCollector = new TransactionCollector(INDEXER,{lock,skip});
    console.log("Get transactions and skip the first", skip, "trasactions");
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function getTxsandOrder (
    lock: Script,
    order: "asc"|"desc"
  )  {
    const txCollector = new TransactionCollector(INDEXER,{lock,order});
    console.log("Get transactions in order of", order);
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function findTXsbyPrefix  (
    lock: Script,
    argsLen : number
  )  {
    const txCollector = new TransactionCollector(INDEXER,{lock,argsLen});
    console.log("Prefix Search");
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function  finegrainedSearch  (
    lockScript: Script,
    typescript : Script,
    argslen: number,
    iotype:"output"|"input"|"both"
    ) {
    const type:ScriptWrapper = {
      script:typescript,
      ioType:iotype,
      argsLen: argslen
    }
    const txCollector = new TransactionCollector(INDEXER,{lock:lockScript,type:type});
    console.log("Fine Grained Query");
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function getTxsbyHash  (
  txHash: string
)   {
  const txWithStatus = await rpc.get_transaction(txHash);
  
  const status = txWithStatus?.tx_status.status;
  const blockHash = txWithStatus?.tx_status.block_hash;
  console.log("The transaction status is",status);
  console.log("The block hash for the transaction is",blockHash);
}