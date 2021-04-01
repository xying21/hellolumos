import {INDEXER} from "./index";
import { Address,Cell, Script, ScriptWrapper } from "@ckb-lumos/base";
import { CONFIG } from "./index";
import {minimalCellCapacity, generateAddress, parseAddress} from "@ckb-lumos/helpers";
import TransactionManager = require ("@ckb-lumos/transaction-manager");
import { CellCollector } from "@ckb-lumos/indexer";
import {locktimePool} from "@ckb-lumos/common-scripts";
import {utils, Hash,Header } from "@ckb-lumos/base";
const {  computeScriptHash } = utils;


export const findCellsbylock = async (
    lockScript: Script,
  ): Promise<Cell[]> => {
 
  const collector = INDEXER.collector({ lock:lockScript});
  const cells: Cell[] = [];
  console.log("Find the cells by lock script:");
  for await (const cell of collector.collect()) {
      cells.push(cell);
      //console.log(cell);
    }
    return cells;
  };
// const lockscript:Script = {
//   code_hash:
//     "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
//   hash_type: "type",
//   args: ALICE.ARGS,
// };

export async function findCellsbyLockandType(
  lockScript: Script,
  typeScript: Script
): Promise<Cell[]>  {

const collector = INDEXER.collector({ lock:lockScript, type:typeScript});
const cells: Cell[] = [];
console.log("Find the cells by Lock and Type script");
for await (const cell of collector.collect()) {
    cells.push(cell);
    //console.log(cell);
 }
return cells;
};

const template = CONFIG.SCRIPTS["DAO"]!;
// the example uses the type script of DAO script 
export const DAOscript:Script = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: "0x"
};


export async function findCellsfromto (
  lockScript: Script,
  fromblock: string,
  toblock: string
): Promise<Cell[]> {

const collector = INDEXER.collector({ lock:lockScript, fromBlock:fromblock,toBlock:toblock});
const cells: Cell[] = [];
console.log("Find cells from block",fromblock,"to block", toblock);
for await (const cell of collector.collect()) {
    cells.push(cell);
   // console.log(cell);
 }
return cells;
};
const fromblock = "0x11";
const toblock = "0x15";

export async function findCellsandSkip(
  lockScript: Script,
  skip: number
): Promise<Cell[]> {

const collector = INDEXER.collector({ lock:lockScript, skip:skip});
const cells: Cell[] = [];
console.log("Find Cells and Skip the first",skip, "cells:");
for await (const cell of collector.collect()) {
    cells.push(cell);
    console.log(cell);
 }
return cells;
};

export async function findCellsinOrderofBlockNum (
  lockScript: Script,
  order:"asc"|"desc"
): Promise<Cell[]> {
const collector = new CellCollector(INDEXER, { lock:lockScript, order:order});
//const collector = INDEXER.collector({ lock:lockScript, order:order});
const cells: Cell[] = [];
console.log("Find Cells in descending", order, "order of block numbers:");
for await (const cell of collector.collect()) {
    cells.push(cell);
 }
return cells;
};

export async function findCellsbyPrefix(
  lockScript: Script,
  argslen:number
): Promise<Cell[]>  {

const collector = INDEXER.collector({ lock:lockScript,argsLen:argslen});
const cells: Cell[] = [];
console.log("Find Cells by prefix of args");
for await (const cell of collector.collect()) {
    cells.push(cell);
 }
return cells;
};

export async function finegrainedsearch(
  lockScript: Script,
  typeScript: Script,
  argslen: number,
  iotype:"output"|"input"|"both"
): Promise<Cell[]> {
const lock:ScriptWrapper = {
  script:lockScript,
  ioType:iotype,
  argsLen: argslen
}
const collector = INDEXER.collector({ lock:lock,type:typeScript});
const cells: Cell[] = [];
console.log("Fine-Grained Query:");
for await (const cell of collector.collect()) {
    cells.push(cell);
 }
return cells;
};


export async function getminimalCellCapacity(
 fullcell:Cell
) {
 // const fullcell = (await findCellsbylock(lockScript))[0];
  console.log("The full cell is", fullcell);
  const result = minimalCellCapacity(fullcell);
  console.log("The minimal cell capacity is",result);
};

export async function getBalancebyLock (
  lockScript:Script
)  {
  let balance = BigInt(0);
  const collector = INDEXER.collector({ lock:lockScript});
  const cells: Cell[] = [];
  //console.log("Get the balance of an account");
  for await (const cell of collector.collect()) {
      cells.push(cell);
   }
 
  balance = cells
   .map((cell) =>
     BigInt(
       cell.cell_output.capacity
     )
   )
   .reduce((balance, capacity) => (balance = balance += capacity),BigInt(0));
  console.log("The balance of the account is", balance);
}



export const findCellsforSufficientAmount = async (
  lockScript: Script,
  amount: BigInt
): Promise<Cell[]> => {
  let foundCapacity = BigInt(0);
  const Cells = [] as Cell[];

  const collector = INDEXER.collector({ lock: lockScript });

  const cells: Cell[] = [];
  for await (const cell of collector.collect()) {
    // If the cell has a type script or data, ignore
    if (!cell.cell_output.type && cell.data === "0x") {
      cells.push(cell);
    }
  }

  for (const cell of cells) {
    if (foundCapacity < amount) {
      foundCapacity = foundCapacity + BigInt(cell.cell_output.capacity);
      Cells.push(cell);
    }
    if (foundCapacity > amount) break;
  }

  if (foundCapacity < amount)
    throw new Error(`Insufficient capacity cells found`);

  return Cells;
};


export async function getUncommittedCells(
  lockScript:Script
): Promise<Cell[]>  {
  const transactionmanager = new TransactionManager(INDEXER);
  transactionmanager.start();

  const cells:Cell[] = [];
  console.log("Get uncommitted cells");
  const collector = transactionmanager.collector( {lock:lockScript});
  for await (const cell of collector.collect()) {
    cells.push(cell);
    //console.log(cell)
  }
  return cells;
}

export async function locktimepoolCells(
  frominfo: string,
):Promise<Cell[]> {
  const collector = new locktimePool.CellCollector(frominfo,INDEXER);
  const cells: Cell[] = [];
  for await (const cell of collector.collect()) { 
      cells.push(cell);
      console.log(cell); }
   return cells;
}
