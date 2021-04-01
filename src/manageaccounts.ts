import {
    AddressPrefix,
    AddressType as Type,
    pubkeyToAddress,
  } from "@nervosnetwork/ckb-sdk-utils";
import { utils, Address, Hash, Script, HexString } from "@ckb-lumos/base";
import {INDEXER} from "./index";
import * as ckbUtils from "@nervosnetwork/ckb-sdk-utils";
import { mnemonic, ExtendedPrivateKey, key } from "@ckb-lumos/hd";
import { CacheManager,CellCollector, CellCollectorWithQueryOptions, getDefaultInfos, getBalance } from "@ckb-lumos/hd-cache";
import { generateAddress, parseAddress } from "@ckb-lumos/helpers";
import { predefined } from "@ckb-lumos/config-manager";
import { Reader } from "ckb-js-toolkit";

const { CKBHasher, computeScriptHash } = utils;


export async function generateKey(

){
  const m = mnemonic.generateMnemonic();
  console.log("The mnemonic is",m);
  const seed = mnemonic.mnemonicToSeedSync(m);
  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
  console.log(extendedPrivateKey);
  
  const publickey = extendedPrivateKey.toExtendedPublicKey().publicKey;
  console.log("The public key is", publickey);
}

export async function private2Public (
  privatekey: HexString
):Promise<HexString> {
  const pubkey = key.privateToPublic(privatekey);
  
  console.log("The public key is",pubkey);
  return pubkey;
}

export async function signature2PublicKey (
  message: HexString,
  signature: HexString
):Promise<HexString> {
  const pubkey = key.recoverFromSignature(message,signature);
  
  console.log("The public key is",pubkey);
  return pubkey;
  
}

export async function publickeyHash (
  publickey: HexString
):Promise<Hash> {
  const hasher = new CKBHasher();
  hasher.update(publickey);
  const hashreader = hasher.digestReader();
  const keyHash = new Reader(hashreader.toArrayBuffer()).serializeJson();
  console.log("The public key hash is",keyHash);
  return keyHash;
}

export async function publicKey2Addresses (
    publicKey: string,
  ):Promise<string[]> {
    const pubkey = publicKey.startsWith("0x") ? publicKey : `0x${publicKey}`;
    
    const mainnetaddress = pubkeyToAddress(pubkey, {
        prefix:AddressPrefix.Mainnet,
        type: Type.HashIdx,
        codeHashOrCodeHashIndex: "0x00",
      });
      const testnetaddress = pubkeyToAddress(pubkey, {
        prefix:AddressPrefix.Testnet,
        type: Type.HashIdx,
        codeHashOrCodeHashIndex: "0x00",
      });
    return [mainnetaddress, testnetaddress];
    
}



export async function getBalancebyHDCache  (
  m:string
 )  {
   //const txcollector = new TransactionCollector(INDEXER,{lock});
   const cacheManager = CacheManager.fromMnemonic(INDEXER, m); 
   cacheManager.startForever();
   const masterPubkey = cacheManager.getMasterPublicKeyInfo();
   const nextReceivingPubkey = cacheManager.getNextReceivingPublicKeyInfo();
   const nextChangePubkey = cacheManager.getNextChangePublicKeyInfo();

    //await cacheManager.cache.loop();
    
    const collector = new CellCollector(cacheManager);

   const balance = await getBalance(collector);
   console.log("The HD wallet balance is", balance);
 }

export const publicKeyToTestnetAddress = (
  publicKey: string,
  prefix = AddressPrefix.Testnet
) => {
  const pubkey = publicKey.startsWith("0x") ? publicKey : `0x${publicKey}`;
  return pubkeyToAddress(pubkey, {
    prefix,
    type: Type.HashIdx,
    codeHashOrCodeHashIndex: "0x00",
  });
};

export async function generateMainnetAddress(
  lockScript:Script,
)  {
  const config = undefined || predefined.LINA;
  const mainnetAddress = generateAddress(lockScript,{config});
  console.log("The mainnet address for the lockscript is", mainnetAddress);  
}

export async function generateTestnetAddress(
  lockScript:Script,
)  {
  const config = undefined || predefined.AGGRON4;
  const testnetAddress = generateAddress(lockScript, {config});
  console.log("The testnet address for the lockscript is", testnetAddress);  
}

export async function generatelockFromAddress (
  address:Address
)  {
  const lockscript = parseAddress(address);
  console.log("The lockscript of the address is", lockscript);  
}

export async function generateLockHash(
  lock:Script
  ){
    const lockHash = computeScriptHash(lock);
    console.log("The lockHash is", lockHash);
}


export type Account = {
  lockScript: Script;
  lockHash: Hash;
  address: Address;
  pubKey: HexString;
  lockScriptMeta?: any;
};
 export const generateAccountFromPrivateKey = (privKey: HexString): Account => {
  const pubKey = ckbUtils.privateKeyToPublicKey(privKey);
  const address = publicKeyToTestnetAddress(pubKey);
  const lockScript = parseAddress(address);
  const lockHash = computeScriptHash(lockScript);
  return {
    lockScript,
    lockHash,
    address,
    pubKey,
  };
};
