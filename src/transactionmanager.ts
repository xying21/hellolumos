import {INDEXER} from "./index";

import { Cell, Script } from "@ckb-lumos/base";


const lockscript:Script = {
  code_hash:
    "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
  hash_type: "type",
  args: "0x7e00660b8ab122bca3ba468c5b6eee71f40b7d8e",
};


import TransactionManager = require ("@ckb-lumos/transaction-manager");
const transactionmanager = new TransactionManager(INDEXER);
transactionmanager.start();

export async function getUncommittedCells(
  lockscript:Script
): Promise<Cell[]>  {
  const transactionmanager = new TransactionManager(INDEXER);
  transactionmanager.start();

  const cells:Cell[] = [];
  console.log("Get uncommitted cells");
  const collector = transactionmanager.collector( {lock:lockscript});
  for await (const cell of collector.collect()) {
    cells.push(cell);
    }
  return cells;
}
