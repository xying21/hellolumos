//import { ecdsaSign } from "secp256k1";
import { RPC } from "@ckb-lumos/rpc";
import { sealTransaction, createTransactionFromSkeleton, TransactionSkeleton, TransactionSkeletonType } from "@ckb-lumos/helpers";
import { common, secp256k1Blake160, dao } from "@ckb-lumos/common-scripts";
import {Hash,Header, Cell, Transaction } from "@ckb-lumos/base";
import {locktimePool, FromInfo} from "@ckb-lumos/common-scripts";
import {key} from "@ckb-lumos/hd";

import {INDEXER, CKB_RPC} from "./index";
const rpc = new RPC("http://127.0.0.1:8114");


//const senderaddress = ALICE.ADDRESS;
//console.log("sender address is ",senderaddress);
//const recipient = BOB.ADDRESS;
//const amount = 20000000000n;
//const txFee =  10000000n;
//const privatekey = ALICE.PRIVATE_KEY;


export async function signandSeal(
    txskeleton:TransactionSkeletonType,
    privatekey : string
):Promise<Transaction>{
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
    privateKey:string
):Promise<Hash> {
    let txSkeleton:TransactionSkeletonType = TransactionSkeleton({cellProvider: INDEXER});
    const tipheader = await rpc.get_tip_header();
        
    txSkeleton = await common.transfer(
            txSkeleton,
            fromInfos,
            toAddress,
            BigInt(amount),
            undefined,
            tipheader
            );
    
    txSkeleton = await common.payFee(
        txSkeleton,
        fromInfos,
        BigInt(txFee),
    )
    
    txSkeleton = common.prepareSigningEntries(txSkeleton);
    const tx = await signandSeal(txSkeleton,privateKey);
    //const rpc = new RPC("http://127.0.0.1:8114");
    const hash = await rpc.send_transaction(tx);
    console.log("The transaction hash is",hash);
    return hash;
}

export async function deposit2DAO(
    sender: string,
    amount: bigint,
    txFee: bigint,
    privateKey:string
):Promise<Hash> {
    let skeleton:TransactionSkeletonType = TransactionSkeleton({cellProvider: INDEXER});
    //@ts-ignore
    console.log("Deposit to DAO transaction");
    skeleton = await dao.deposit(skeleton,sender,sender,BigInt(amount));
    console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));
    skeleton = await secp256k1Blake160.payFee(skeleton,sender,BigInt(txFee));
    console.log(createTransactionFromSkeleton(skeleton).inputs.length);
    skeleton = secp256k1Blake160.prepareSigningEntries(skeleton);
    console.log("signingEntries:",skeleton.get("signingEntries").toArray());
    
    const tx = await signandSeal(skeleton,privateKey);
    //const rpc = new RPC("http://127.0.0.1:8114");
    const hash = await rpc.send_transaction(tx);
    console.log("The transaction hash is",hash);
    return hash;
}

export async function listDAOCells(
    fromaddress: string,
    celltype: "deposit" | "all" | "withdraw"
) {
    console.log("List the",celltype,"cells for the address", fromaddress);
    //@ts-ignore
    for await (const cell of dao.listDaoCells(INDEXER,fromaddress,celltype)) {
         console.log(cell); 
    }
}

export async function withdrawfromDAO(
    cell: Cell,
    frominfo: string,
    txFee: bigint,
    privateKey:string
):Promise<Hash> {
    console.log("Withdraw a DAO cell for the address", frominfo);
    let skeleton = TransactionSkeleton({ cellProvider: INDEXER });
    skeleton = await dao.withdraw(skeleton, cell, frominfo);
    skeleton = await secp256k1Blake160.payFee(skeleton, frominfo, BigInt(txFee));
    skeleton = secp256k1Blake160.prepareSigningEntries(skeleton);
    console.log("signingEntries:",skeleton.get("signingEntries").toArray());
    const tx = await signandSeal(skeleton,privateKey);
    //const rpc = new RPC("http://127.0.0.1:8114");
    const hash = await rpc.send_transaction(tx);
    console.log("The transaction hash is",hash);
    return hash;
}

export async function unlockWithdraw(
    depositinput: Cell,
    withdrawinput: Cell,
    toaddress:string,
    frominfo: string,
    txFee: bigint,
    privateKey:string
):Promise<Hash> {
    let skeleton = TransactionSkeleton({ cellProvider: INDEXER });
    skeleton = await dao.unlock(skeleton,depositinput,withdrawinput,toaddress,frominfo);
    skeleton = await secp256k1Blake160.payFee(skeleton, frominfo, BigInt(txFee));
    skeleton = secp256k1Blake160.prepareSigningEntries(skeleton);
    console.log("signingEntries:",skeleton.get("signingEntries").toArray());
    const tx = await signandSeal(skeleton,privateKey);
    const hash = await rpc.send_transaction(tx);
    console.log("The transaction hash is",hash);
    return hash;
}


export async function locktimepoolTX(
    toaddress:string,
    frominfo: string,
    amount:bigint,
    txFee:bigint,
    privateKey:string
):Promise<Hash> {
    const tipheader = await rpc.get_tip_header();
   
    let skeleton = TransactionSkeleton({ cellProvider: INDEXER });
    //@ts-ignore
    skeleton = await locktimePool.transfer(skeleton, [frominfo], toaddress, BigInt(amount),tipheader);
    console.log(JSON.stringify(createTransactionFromSkeleton(skeleton), null, 2));
    skeleton = await locktimePool.payFee(skeleton,[frominfo], txFee, tipheader);
    skeleton = locktimePool.prepareSigningEntries(skeleton);
    skeleton.get("signingEntries").toArray();
    const tx = await signandSeal(skeleton,privateKey);
    const hash = await rpc.send_transaction(tx);
    console.log("The transaction hash is",hash);
    return hash;
}
