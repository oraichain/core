import "dotenv/config";
import { ethers } from "hardhat";
import type { InterfaceAbi } from "ethers";

import YoOracleAbi from "./abi/YoOracle.json";

const ORACLE_ABI = (YoOracleAbi as { abi: InterfaceAbi }).abi;

/**
 * Gọi updateSharePrice trên YoOracle (test, hardcode).
 * Chỉ địa chỉ updater của oracle mới gọi được; signer phải là updater.
 */
async function main() {
  const oracleAddress = "0x8E7D4C3f93e30e319b15D6FF5781af4eAc508465";
  const vaultAddress = "0x156722e04eA32E7DEC8C7aDfC58347aA23983b58";
  const sharePrice = 1_000_000_000_000_000_000n; // 1e18 = 1:1

  const [signer] = await ethers.getSigners();
  const oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, signer);

  console.log("Oracle:", oracleAddress);
  console.log("Vault:", vaultAddress);
  console.log("Share price (raw):", sharePrice.toString());
  console.log("Signer (must be updater):", signer.address);

  try {
    const [priceBefore] = await oracle.getLatestPrice(vaultAddress);
    console.log("getLatestPrice before:", priceBefore.toString());
  } catch (e) {
    console.warn("getLatestPrice before reverted:", (e as Error).message);
  }

  console.log("Sending updateSharePrice...");
  const tx = await oracle.updateSharePrice(vaultAddress, sharePrice);
  const receipt = await tx.wait();
  console.log("Tx hash:", receipt?.hash);

  const [priceAfter] = await oracle.getLatestPrice(vaultAddress);
  console.log("getLatestPrice after:", priceAfter.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
