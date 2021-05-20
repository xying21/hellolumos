import { TransactionCollector } from "@ckb-lumos/indexer";
import {
  Script,
  ScriptWrapper,
  Transaction
} from "@ckb-lumos/base";

import { INDEXER } from "./index";

import { RPC } from "@ckb-lumos/rpc";

const rpc = new RPC("http://127.0.0.1:8114");

export async function getTXsbyLock(lockScript: Script) {
  console.log("Get transactions by lock script:");
  const txCollector = new TransactionCollector(INDEXER, { lock: lockScript });
  const txs: Transaction[] = [];
  for await (const txWithStatus of txCollector.collect()) {
    console.log(txWithStatus);
    //@ts-ignore
    const tx = txWithStatus.transaction;
    //@ts-ignore
    const txStatus = txWithStatus.tx_status.status;
    txs.push(tx);
  }
  return txs;
}

export async function getTXsbetweenBlocks(
  lockScript: Script,
  fromBlock: string,
  toBlock: string
) {
  const txCollector = new TransactionCollector(INDEXER, {
    lock: lockScript,
    fromBlock,
    toBlock,
  });
  console.log("Get transactions between given blocks:");
  for await (const txWithStatus of txCollector.collect()) {
    console.log(txWithStatus);
  }
}


export async function getTXsandSkip(lock: Script, skip: number) {
  const txCollector = new TransactionCollector(INDEXER, { lock, skip });
  console.log("Get transactions and skip the first", skip, "trasactions");
  for await (const txWithStatus of txCollector.collect()) {
    console.log(txWithStatus);
  }
}

export async function getTXsandOrder(lock: Script, order: "asc" | "desc") {
  const txCollector = new TransactionCollector(INDEXER, { lock, order });
  console.log("Get transactions in order of", order);
  for await (const txWithStatus of txCollector.collect()) {
    console.log(txWithStatus);
  }
}

export async function findTXsbyPrefix(lock: Script, argsLen: number) {
  const txCollector = new TransactionCollector(INDEXER, { lock, argsLen });
  console.log("Prefix Search");
  for await (const txWithStatus of txCollector.collect()) {
    console.log(txWithStatus);
  }
}

export async function finegrainedSearch(
  lockScript: Script,
  argslen: number,
  iotype: "output" | "input" | "both"
) {
  const lock: ScriptWrapper = {
    script: lockScript,
    ioType: iotype,
    argsLen: argslen,
  };
  const txCollector = new TransactionCollector(INDEXER, {
    lock,
  });
  console.log("Fine Grained Query");
  for await (const txWithStatus of txCollector.collect()) {
    console.log(txWithStatus);
  }
}

export async function getTXbyHash(txHash: string) {
  const txWithStatus = await rpc.get_transaction(txHash);

  const status = txWithStatus?.tx_status.status;
  const blockHash = txWithStatus?.tx_status.block_hash;
  console.log("The transaction status is", status);
  console.log("The block hash for the transaction is", blockHash);
}

