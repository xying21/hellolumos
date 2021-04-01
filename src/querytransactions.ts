import { TransactionCollector } from "@ckb-lumos/indexer";
import { Script, ScriptWrapper, Transaction, TransactionWithStatus} from "@ckb-lumos/base";

import {CONFIG, INDEXER} from "./index";
import { Hash } from "crypto";
import { RPC } from "@ckb-lumos/rpc";

const rpc = new RPC("http://127.0.0.1:8114");

export async function getTxbyLock (
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


 export async function getTxbetweenBlocks (
    lockScript: Script,
    fromBlock: string,
    toBlock: string
  )  {
    const txCollector = new TransactionCollector(INDEXER,{lock:lockScript,fromBlock:fromBlock,toBlock:toBlock});
    console.log("Get transactions between given blocks:");
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function getTxandSkip (
    lockScript: Script,
    skip: number
  )  {
    const txCollector = new TransactionCollector(INDEXER,{lock:lockScript,skip:skip});
    console.log("Get transactions and skip the first", skip, "trasactions");
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function getTxandOrder (
    lockScript: Script,
    order: "asc"|"desc"
  )  {
    const txCollector = new TransactionCollector(INDEXER,{lock:lockScript,order:order});
    console.log("Get transactions in order of", order);
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function prefixSearch  (
    lockScript: Script,
    argslen : number
  )  {
    const txCollector = new TransactionCollector(INDEXER,{lock:lockScript,argsLen:argslen});
    console.log("Prefix Search");
    for await (const txWithStatus of txCollector.collect()) {
        console.log(txWithStatus);
    }
}

export async function  fineGrainedQuery  (
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

export async function getTXbyHash  (
  txHash: string
)   {
  const txWithStatus = await rpc.get_transaction(txHash);
  
  const status = txWithStatus?.tx_status.status;
  const blockhash = txWithStatus?.tx_status.block_hash;
  console.log("The transaction status is",status);
  console.log("The block hash for the transaction is",blockhash);
}