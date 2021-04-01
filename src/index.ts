import { env } from "process";
import { Script, ScriptWrapper } from "@ckb-lumos/base";
import { getConfig, initializeConfig } from "@ckb-lumos/config-manager";

import { Indexer } from "@ckb-lumos/indexer";

export const CKB_RPC = "http://127.0.0.1:8114";

// For simplicity, we hardcode 0.1 CKB as transaction fee here.
export const FEE = BigInt(10000000);

env.LUMOS_CONFIG_FILE = env.LUMOS_CONFIG_FILE || "./config.json";
initializeConfig();

export const CONFIG = getConfig();
export const INDEXER = new Indexer(CKB_RPC, "./indexed-data");
INDEXER.startForever();
console.log(`The server is started.`);

export * as accounts from "./accounts";
export * as querycells from "./querycells";
export * as querytransactions from "./querytransactions";
export * as transactionmanager from "./transactionmanager";
export * as buildTXs from "./buildTXs";
export * as manageaccounts from "./manageaccounts";

const template = CONFIG.SCRIPTS["DAO"]!;
export const DAOscript:Script = {
     code_hash: template.CODE_HASH,
     hash_type: template.HASH_TYPE,
     args: "0x"
  };
export const DAOscriptWrapper:ScriptWrapper = {
     script:DAOscript,
     ioType:"output"
  };