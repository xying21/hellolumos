import { utils, Address, Hash, Script, HexString } from "@ckb-lumos/base";
import { CONFIG, INDEXER} from "./index";
import { mnemonic, ExtendedPrivateKey, key } from "@ckb-lumos/hd";
import { CacheManager,CellCollector, getBalance } from "@ckb-lumos/hd-cache";
import { generateAddress, parseAddress } from "@ckb-lumos/helpers";
import { Config } from "@ckb-lumos/config-manager";
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

// export const publicKeyToTestnetAddress = (
//   publicKey: string,
//   prefix = AddressPrefix.Testnet
// ) => {
//   const pubkey = publicKey.startsWith("0x") ? publicKey : `0x${publicKey}`;
//   return pubkeyToAddress(pubkey, {
//     prefix,
//     type: Type.HashIdx,
//     codeHashOrCodeHashIndex: "0x00",
//   });
// };

export async function generateAddressfromLock(
  lockScript:Script,
  config: Config
)  {
  const address = generateAddress(lockScript, {config});
  console.log("The address for the lockscript is", address);  
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
  pubKey: string;
  lockScriptMeta?: any;
};
 export const generateAccountFromPrivateKey = (privKey: string): Account => {
  const pubKey = key.privateToPublic(privKey);
  console.log("pubKey is", pubKey);
  const args = key.publicKeyToBlake160(pubKey);
  console.log("args is", args);
  const template = CONFIG.SCRIPTS["SECP256K1_BLAKE160"]!
  const lockScript = {    
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: args
  };
  const address = generateAddress(lockScript);
  const lockHash = computeScriptHash(lockScript);
  return {
    lockScript,
    lockHash,
    address,
    pubKey,
  };
};
