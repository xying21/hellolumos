import { HexString, Script } from "@ckb-lumos/base";
import { getConfig } from "@ckb-lumos/config-manager";

function lockScript(pubkeyHash: HexString): Script {
  return {
    code_hash: getConfig().SCRIPTS!.SECP256K1_BLAKE160!.CODE_HASH,
    hash_type: getConfig().SCRIPTS!.SECP256K1_BLAKE160!.HASH_TYPE,
    args: pubkeyHash,
  };
}

// Note the private keys here are only for demo purposes, please do not use them elsewhere!
export const ALICE = {
//  Mnemonic: "",
  PRIVATE_KEY:
    "0xf2a91b1410f7308631b89603262448ba515cddac1ffe250265551c82fff3eb3a",
  ADDRESS: "ckt1qyq8uqrxpw9tzg4u5waydrzmdmh8raqt0k8qmuetsf",
  ARGS: "0x7e00660b8ab122bca3ba468c5b6eee71f40b7d8e",
  //LOCKHASH: "0xf6ea009a4829de7aeecd75f3ae6bcdbaacf7328074ae52a48456a8793a4b1cca"
};

export const BOB = {
 // Mnemonic: "",
  PRIVATE_KEY:
    "0x670ac6ac1ce8004b4220f0fb024179461f11989ff4d446816f78813b80b9c696",
  ADDRESS: "ckt1qyqwe03shn6udvhjmrkzm53f53sr5l3qdwvsytj4hs",
  ARGS: "0xecbe30bcf5c6b2f2d8ec2dd229a4603a7e206b99",
 // LOCKHASH: "0x34f085b5d2fa3f4ad2880713082a72864522a6ebffa1eb931b09e0407092eda5",
};

export const CHARLIE = {
 // Mnemonic: "spike way breeze cradle viable width ensure owner purchase wait just clip",
  PRIVATE_KEY:
    "0x5503cc1d40b9e05a46fe8e1d4702786c624a1b5e774f964db6746ea754b4843a",
  ADDRESS: "ckt1qyqfzx8hvqxnj4cf6zxugktfvlvvj2vc9udqww932t",
  ARGS: "0x9118f7600d395709d08dc4596967d8c929982f1a",
  //LOCKHASH: "0xea4f6d443ab511bbf6f4de37e4331993d84763d9b377cd12badff15ca2c84f56",
};

export const ALICE_genesis = {
   PRIVATE_KEY:
     "0xd00c06bfd800d27397002dca6fb0993d5ba6399b4238b2f29ee9deb97593d2bc",
   ADDRESS: "ckt1qyqvsv5240xeh85wvnau2eky8pwrhh4jr8ts8vyj37",
   ARGS: "0xc8328aabcd9b9e8e64fbc566c4385c3bdeb219d7",
   //LOCKHASH: "0x32e555f3ff8e135cece1351a6a2971518392c1e30375c1e006ad0ce8eac07947",
 };
 export const BOB_genesis = {
   PRIVATE_KEY:
     "0x63d86723e08f0f813a36ce6aa123bb2289d90680ae1e99d4de8cdb334553f24d",
   ADDRESS: "ckt1qyqywrwdchjyqeysjegpzw38fvandtktdhrs0zaxl4",
   ARGS: "0x470dcdc5e44064909650113a274b3b36aecb6dc7",
   //LOCKHASH: "0xc219351b150b900e50a7039f1e448b844110927e5fd9bd30425806cb8ddff1fd",
 };