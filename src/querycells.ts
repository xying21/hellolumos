import { INDEXER } from "./index";
import { Cell, Script, ScriptWrapper } from "@ckb-lumos/base";
import { CONFIG } from "./index";
import { minimalCellCapacity } from "@ckb-lumos/helpers";
import TransactionManager = require("@ckb-lumos/transaction-manager");
import { CellCollector } from "@ckb-lumos/indexer";
import { locktimePool } from "@ckb-lumos/common-scripts";
import { utils } from "@ckb-lumos/base";
const { computeScriptHash } = utils;


export const findCellsbyLock = async (lockScript: Script): Promise<Cell[]> => {
  const collector = INDEXER.collector({ lock: lockScript });
  const cells: Cell[] = [];
  console.log("Find the cells by lock script:");
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }
  return cells;
};

export async function findCellsbyLockandType(
  lockScript: Script,
  typeScript: Script
): Promise<Cell[]> {
  const collector = INDEXER.collector({ lock: lockScript, type: typeScript });
  const cells: Cell[] = [];
  console.log("Find the cells by Lock and Type script");
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }
  return cells;
}

const template = CONFIG.SCRIPTS["DAO"]!;
// the example uses the type script of DAO script 
export const DAOscript:Script = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: "0x"
};


export async function findCellsBetweenBlocks(
  lockScript: Script,
  fromBlock: string,
  toBlock: string
): Promise<Cell[]> {
  const collector = INDEXER.collector({ lock: lockScript, fromBlock, toBlock });
  const cells: Cell[] = [];
  console.log("Find cells from block", fromBlock, "to block", toBlock);
  for await (const cell of collector.collect()) {
    cells.push(cell);
    // console.log(cell);
  }
  return cells;
}


export async function findCellsandSkip(
  lockScript: Script,
  skip: number
): Promise<Cell[]> {
  const collector = INDEXER.collector({ lock: lockScript, skip: skip });
  const cells: Cell[] = [];
  console.log("Find Cells and Skip the first", skip, "cells:");
  for await (const cell of collector.collect()) {
    cells.push(cell);
    console.log(cell);
  }
  return cells;
}

export async function findCellsbyPrefix(
  lockScript: Script,
  argslen: number
): Promise<Cell[]> {
  const collector = INDEXER.collector({ lock: lockScript, argsLen: argslen });
  const cells: Cell[] = [];
  console.log("Find Cells by prefix of args");
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }
  return cells;
}

export async function finegrainedSearch(
  lockScript: Script,
  argslen: number,
//  iotype: "output" | "input" | "both"
): Promise<Cell[]> {
  const lock: ScriptWrapper = {
    script: lockScript,
//    ioType: iotype,
    argsLen: argslen,
  };
  const collector = INDEXER.collector({ lock: lock });
  const cells: Cell[] = [];
  console.log("Fine-Grained Query:");
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }
  return cells;
}

export async function findCellsandOrder(
  lockScript: Script,
  order: "asc" | "desc"
): Promise<Cell[]> {
  const collector = new CellCollector(INDEXER, {
    lock: lockScript,
    order: order,
  });
  const cells: Cell[] = [];
  console.log("Find Cells in", order, "order of block numbers:");
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }
  return cells;
}

export async function getMinimalCellCapacity(fullcell: Cell) {
  // const fullcell = (await findCellsbylock(lockScript))[0];
  const result = minimalCellCapacity(fullcell);
  console.log("The minimal cell capacity is", result);
}

export async function getBalancebyLock(lockScript: Script) {
  let balance = BigInt(0);
  const collector = INDEXER.collector({ lock: lockScript });
  const cells: Cell[] = [];
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }
  balance = cells
    .map((cell) => BigInt(cell.cell_output.capacity))
    .reduce((balance, capacity) => (balance = balance += capacity), BigInt(0));
  console.log("The balance of the account is", balance);
}

export const findCellsforSufficientAmount = async (
  lockScript: Script,
  amount: bigint
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


export async function locktimePoolCells(frominfo: string): Promise<Cell[]> {
  const collector = new locktimePool.CellCollector(frominfo, INDEXER);
  const cells: Cell[] = [];
  for await (const cell of collector.collect()) {
    cells.push(cell);
    console.log(cell);
  }
  return cells;
}

export async function getSUDTBalance(lock: Script, sudtType: Script) {
  let balance = BigInt(0);
  const collector = INDEXER.collector({ lock, type: sudtType });
  const cells: Cell[] = [];
  for await (const cell of collector.collect()) {
    cells.push(cell);
  }

  balance = cells
    .map((cell) => utils.readBigUInt128LE(cell.data))
    .reduce((balance, amount) => (balance = balance += amount), BigInt(0));
  console.log("The balance of the account is", balance);
}
