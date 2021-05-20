import { utils, Address, Hash, Script, HexString } from "@ckb-lumos/base";
import { CONFIG, INDEXER } from "./index";
import {
  mnemonic,
  ExtendedPrivateKey,
  key,
  Keystore,
  XPubStore,
} from "@ckb-lumos/hd";
import {
  CacheManager,
  CellCollector,
  getBalance,
  getDefaultInfos,
} from "@ckb-lumos/hd-cache";
import { generateAddress, parseAddress } from "@ckb-lumos/helpers";
import { Config } from "@ckb-lumos/config-manager";
import { Reader } from "ckb-js-toolkit";

const { CKBHasher, computeScriptHash } = utils;

export async function generateKeys() {
  const m = mnemonic.generateMnemonic();
  console.log("The mnemonic is", m);
  const seed = mnemonic.mnemonicToSeedSync(m);
  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
  console.log("The extended private key is",extendedPrivateKey);

  const publicKey = extendedPrivateKey.toExtendedPublicKey().publicKey;
  console.log("The public key is", publicKey);
}

export async function private2Public(
  privateKey: HexString
): Promise<HexString> {
  const publicKey = key.privateToPublic(privateKey);

  console.log("The public key is", publicKey);
  return publicKey;
}

export async function public2Args(publicKey: HexString): Promise<string> {
  const lockArgs = key.publicKeyToBlake160(publicKey);

  console.log("The lock args is", lockArgs);
  return lockArgs;
}

export async function recoverFromSignature(
  message: HexString,
  signature: HexString
): Promise<HexString> {
  const publicKey = key.recoverFromSignature(message, signature);

  console.log("The public key is", publicKey);
  return publicKey;
}


export async function publickeyHash(publickey: HexString): Promise<Hash> {
  const hasher = new CKBHasher();
  hasher.update(publickey);
  const hashReader = hasher.digestReader();
  const keyHash = new Reader(hashReader.toArrayBuffer()).serializeJson();
  console.log("The public key hash is", keyHash);
  return keyHash;
}

export async function generateKeystore(
  password: string,
  path: string,
  name: string,
  overwrite: boolean | undefined
) {
  const m = mnemonic.generateMnemonic();
  console.log("The mnemonic is", m);
  const seed = mnemonic.mnemonicToSeedSync(m);
  const extendedPrivateKey = ExtendedPrivateKey.fromSeed(seed);
  console.log("The extendedPrivateKey is", extendedPrivateKey);
  const keystore = Keystore.create(extendedPrivateKey, password);
  keystore.save(path, { name, overwrite });
}

export async function generateXPubStore(
  extendedPrivateKey: ExtendedPrivateKey,
  path: string,
  overwrite: boolean | undefined
) {
  const accountExtendedPublicKey = extendedPrivateKey.toAccountExtendedPublicKey();
  console.log("The accountExtendedPublicKey is", accountExtendedPublicKey);
  const xpubStore = new XPubStore(accountExtendedPublicKey);
  xpubStore.save(path, { overwrite });
}

export async function getBalancebyHDCache(
  path: string,
  password: string,
  needMasterPublicKey: boolean
) {
  const cacheManager = CacheManager.loadFromKeystore(
    INDEXER,
    path,
    password,
    getDefaultInfos(),
    { needMasterPublicKey }
  );
  cacheManager.startForever();
  //  console.log("The master public key info is", cacheManager.getMasterPublicKeyInfo());
  //  console.log("The next receiving public key info is", cacheManager.getNextReceivingPublicKeyInfo());
  //  console.log("The next change public key info is",cacheManager.getNextChangePublicKeyInfo());
  //  console.log("The receiving keys are",cacheManager.getReceivingKeys());
  //@ts-ignore
  await cacheManager.cache.loop();

  /*    const collector = new CellCollector(cacheManager);
    for await (const cell of collector.collect()) {
      console.log(cell)
    } */
  const balance = await getBalance(new CellCollector(cacheManager));
  console.log("The HD wallet balance is", BigInt(balance));
}

export async function generateAddressfromLock(
  lockScript: Script,
  config: Config
) {
  const address = generateAddress(lockScript, { config });
  console.log("The address for the lockscript is", address);
}

export async function generateLockFromAddress(address: Address) {
  const lockScript = parseAddress(address);
  console.log("The lock script of the address is", lockScript);
}

export async function generateLockHash(lock: Script) {
  const lockHash = computeScriptHash(lock);
  console.log("The lock hash is", lockHash);
}

export type Account = {
  lockScript: Script;
  lockHash: Hash;
  address: Address;
  pubKey: string;
};
export const generateAccountFromPrivateKey = (privKey: string): Account => {
  const pubKey = key.privateToPublic(privKey);
  console.log("pubKey is", pubKey);
  const args = key.publicKeyToBlake160(pubKey);
  console.log("args is", args);
  const template = CONFIG.SCRIPTS["SECP256K1_BLAKE160"]!;
  const lockScript = {
    code_hash: template.CODE_HASH,
    hash_type: template.HASH_TYPE,
    args: args,
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
