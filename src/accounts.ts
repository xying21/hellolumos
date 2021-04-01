import { HexString, Script } from "@ckb-lumos/base";
import { getConfig } from "@ckb-lumos/config-manager";

function lockScript(pubkeyHash: HexString): Script {
  return {
    code_hash: getConfig().SCRIPTS!.SECP256K1_BLAKE160!.CODE_HASH,
    hash_type: getConfig().SCRIPTS!.SECP256K1_BLAKE160!.HASH_TYPE,
    args: pubkeyHash,
  };
}

// Note the private keys here are only for demo purposes, please do not use them
// elsewhere!
export const ALICE = {
  PRIVATE_KEY:
    "0xf2a91b1410f7308631b89603262448ba515cddac1ffe250265551c82fff3eb3a",
  ADDRESS: "ckt1qyq8uqrxpw9tzg4u5waydrzmdmh8raqt0k8qmuetsf",
  ARGS: "0x7e00660b8ab122bca3ba468c5b6eee71f40b7d8e",
  LOCKHASH: "0xf6ea009a4829de7aeecd75f3ae6bcdbaacf7328074ae52a48456a8793a4b1cca"
};

export const BOB = {
  PRIVATE_KEY:
    "0x670ac6ac1ce8004b4220f0fb024179461f11989ff4d446816f78813b80b9c696",
  ADDRESS: "ckt1qyqwe03shn6udvhjmrkzm53f53sr5l3qdwvsytj4hs",
  ARGS: "0xecbe30bcf5c6b2f2d8ec2dd229a4603a7e206b99",
  LOCKHASH: "0x34f085b5d2fa3f4ad2880713082a72864522a6ebffa1eb931b09e0407092eda5",
};
