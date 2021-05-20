import {
  sealTransaction,
  createTransactionFromSkeleton,
  TransactionSkeleton,
  TransactionSkeletonType,
} from "@ckb-lumos/helpers";
import { common, dao, sudt } from "@ckb-lumos/common-scripts";
import { Hash, Cell, Transaction } from "@ckb-lumos/base";
import { locktimePool, FromInfo } from "@ckb-lumos/common-scripts";
import { key } from "@ckb-lumos/hd";
import { INDEXER } from "./index";
import { RPC } from "@ckb-lumos/rpc";
const rpc = new RPC("http://127.0.0.1:8114");

export async function signandSeal(
  txskeleton: TransactionSkeletonType,
  privatekey: string
): Promise<Transaction> {
  const message = txskeleton.get("signingEntries").get(0)?.message;
  const Sig = key.signRecoverable(message!, privatekey);
  const tx = sealTransaction(txskeleton, [Sig]);
  return tx;
}

export async function commonTransfer(
  fromInfos: FromInfo[],
  toAddress: string,
  amount: bigint,
  txFee: bigint,
  privateKey: string
): Promise<Hash> {
  let txSkeleton: TransactionSkeletonType = TransactionSkeleton({
    cellProvider: INDEXER,
  });
  const tipheader = await rpc.get_tip_header();

  txSkeleton = await common.transfer(
    txSkeleton,
    fromInfos,
    toAddress,
    BigInt(amount),
    undefined,
    tipheader
  );

  txSkeleton = await common.payFee(txSkeleton, fromInfos, BigInt(txFee));

  txSkeleton = common.prepareSigningEntries(txSkeleton);
  const tx = await signandSeal(txSkeleton, privateKey);
  const hash = await rpc.send_transaction(tx);
  console.log("The transaction hash is", hash);
  return hash;
}

export async function deposit2DAO(
  fromInfo: FromInfo,
  toAddress: string,
  amount: bigint,
  txFee: bigint,
  privateKey: string
): Promise<Hash> {
  let skeleton: TransactionSkeletonType = TransactionSkeleton({
    cellProvider: INDEXER,
  });
  //@ts-ignore
  console.log("Deposit to DAO transaction");
  skeleton = await dao.deposit(skeleton, fromInfo, toAddress, BigInt(amount));
  skeleton = await common.payFee(skeleton, [fromInfo], BigInt(txFee));
  console.log(createTransactionFromSkeleton(skeleton).inputs.length);
  skeleton = common.prepareSigningEntries(skeleton);
  console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));
  console.log("signingEntries:", skeleton.get("signingEntries").toArray());

  const tx = await signandSeal(skeleton, privateKey);
  //const rpc = new RPC("http://127.0.0.1:8114");
  const hash = await rpc.send_transaction(tx);
  console.log("The transaction hash is", hash);
  return hash;
}

export async function listDAOCells(
  fromAddress: string,
  cellType: "deposit" | "all" | "withdraw"
) {
  console.log("List the", cellType, "cells for the address", fromAddress);
  //@ts-ignore
  for await (const cell of dao.listDaoCells(INDEXER, fromAddress, cellType)) {
    console.log(cell);
  }
}

export async function withdrawfromDAO(
  cell: Cell,
  frominfo: string,
  txFee: bigint,
  privateKey: string
): Promise<Hash> {
  console.log("Withdraw a DAO cell for the address", frominfo);
  let skeleton = TransactionSkeleton({ cellProvider: INDEXER });
  skeleton = await dao.withdraw(skeleton, cell, frominfo);
  skeleton = await common.payFee(skeleton, [frominfo], BigInt(txFee));
  skeleton = common.prepareSigningEntries(skeleton);
  //console.log("signingEntries:", skeleton.get("signingEntries").toArray());
  const tx = await signandSeal(skeleton, privateKey);
  //const rpc = new RPC("http://127.0.0.1:8114");
  const hash = await rpc.send_transaction(tx);
  console.log("The transaction hash is", hash);
  return hash;
}

export async function unlockWithdraw(
  depositinput: Cell,
  withdrawinput: Cell,
  toaddress: string,
  frominfo: string,
  txFee: bigint,
  privateKey: string
): Promise<Hash> {
  let skeleton = TransactionSkeleton({ cellProvider: INDEXER });
  skeleton = await dao.unlock(
    skeleton,
    depositinput,
    withdrawinput,
    toaddress,
    frominfo
  );
  skeleton = await common.payFee(skeleton, [frominfo], BigInt(txFee));
  skeleton = common.prepareSigningEntries(skeleton);
  //console.log("signingEntries:", skeleton.get("signingEntries").toArray());
  const tx = await signandSeal(skeleton, privateKey);
  const hash = await rpc.send_transaction(tx);
  console.log("The transaction hash is", hash);
  return hash;
}

export async function locktimePoolTransfer(
  toaddress: string,
  frominfo: string,
  amount: bigint,
  txFee: bigint,
  privateKey: string
): Promise<Hash> {
  const tipheader = await rpc.get_tip_header();

  let skeleton = TransactionSkeleton({ cellProvider: INDEXER });
  //@ts-ignore
  skeleton = await locktimePool.transfer(
    skeleton,
    [frominfo],
    toaddress,
    BigInt(amount),
    tipheader
  );
  console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));
  skeleton = await locktimePool.payFee(skeleton, [frominfo], txFee, tipheader);
  skeleton = locktimePool.prepareSigningEntries(skeleton);
  skeleton.get("signingEntries").toArray();
  const tx = await signandSeal(skeleton, privateKey);
  const hash = await rpc.send_transaction(tx);
  console.log("The transaction hash is", hash);
  return hash;
}

//sUDT
export async function issueSUDT(
  fromInfo: FromInfo,
  amount: bigint,
  capacity: bigint,
  txFee: bigint,
  privateKey: string
): Promise<Hash> {
  let skeleton: TransactionSkeletonType = TransactionSkeleton({
    cellProvider: INDEXER,
  });
  //@ts-ignore
  console.log("Issue SUDT tokens.");
  skeleton = await sudt.issueToken(skeleton, fromInfo, amount, capacity);
  skeleton = await common.payFee(skeleton, [fromInfo], BigInt(txFee));
  console.log(createTransactionFromSkeleton(skeleton).inputs.length);
  skeleton = common.prepareSigningEntries(skeleton);
  //console.log("signingEntries:", skeleton.get("signingEntries").toArray());
  console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));
  const tx = await signandSeal(skeleton, privateKey);
  const hash = await rpc.send_transaction(tx);
  console.log("The transaction hash is", hash);
  return hash;
}

export async function computeSUDTToken(fromInfo: FromInfo): Promise<Hash> {
  const sudtToken = sudt.ownerForSudt(fromInfo);
  console.log("SUDT Token:", sudtToken);

  return sudtToken;
}

export async function transferSUDT(
  fromInfo: FromInfo,
  toAddress: string,
  amount: bigint,
  capacity: bigint,
  txFee: bigint,
  privateKey: string
): Promise<Hash> {
  let skeleton: TransactionSkeletonType = TransactionSkeleton({
    cellProvider: INDEXER,
  });
  //@ts-ignore
  console.log("Transfer SUDT tokens:");
  const sudtToken = sudt.ownerForSudt(fromInfo);
  skeleton = await sudt.transfer(
    skeleton,
    [fromInfo],
    sudtToken,
    toAddress,
    amount,
    undefined,
    capacity
  );
  
  skeleton = await common.payFee(skeleton, [fromInfo], BigInt(txFee));
  console.log(createTransactionFromSkeleton(skeleton).inputs.length);
  skeleton = common.prepareSigningEntries(skeleton);
 // console.log("signingEntries:", skeleton.get("signingEntries").toArray());
//console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));
  const tx = await signandSeal(skeleton, privateKey);
  const hash = await rpc.send_transaction(tx);
  console.log("The transaction hash is", hash);
  return hash;
}
