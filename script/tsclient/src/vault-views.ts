import "dotenv/config";
import { ethers } from "hardhat";
import type { InterfaceAbi } from "ethers";

import YoVaultV2Abi from "./abi/YoVault_V2.json";

const VAULT_ABI = (YoVaultV2Abi as { abi: InterfaceAbi }).abi;

/**
 * Script gọi các view của YoVault_V2 (test, hardcode).
 */
async function main() {
  const vaultAddress = "0x156722e04eA32E7DEC8C7aDfC58347aA23983b58";
  const userAddress = "0x0000000000000000000000000000000000000000"; // thay bằng địa chỉ cần test
  const assetsForPreview = 1_000_000n;
  const sharesForPreview = 1_000_000n;

  const [signer] = await ethers.getSigners();
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI, signer);
  const user = userAddress !== ethers.ZeroAddress ? userAddress : signer.address;

  console.log("Vault:", vaultAddress);
  console.log("User (for pending/max/balance):", user);
  console.log("");

  // --- Vault state ---
  try {
    const totalAssets = await vault.totalAssets();
    console.log("totalAssets():", totalAssets.toString());
  } catch (e) {
    console.warn("totalAssets reverted:", (e as Error).message);
  }
  try {
    const lastPrice = await vault.lastPricePerShare();
    console.log("lastPricePerShare():", lastPrice.toString());
  } catch (e) {
    console.warn("lastPricePerShare reverted:", (e as Error).message);
  }
  try {
    const totalSupply = await vault.totalSupply();
    console.log("totalSupply():", totalSupply.toString());
  } catch (e) {
    console.warn("totalSupply reverted:", (e as Error).message);
  }
  try {
    const decimals = await vault.decimals();
    console.log("decimals():", decimals);
  } catch (e) {
    console.warn("decimals reverted:", (e as Error).message);
  }
  try {
    const asset = await vault.asset();
    console.log("asset():", asset);
  } catch (e) {
    console.warn("asset reverted:", (e as Error).message);
  }
  try {
    const totalPending = await vault.totalPendingAssets();
    console.log("totalPendingAssets():", totalPending.toString());
  } catch (e) {
    console.warn("totalPendingAssets reverted:", (e as Error).message);
  }
  try {
    const feeWithdraw = await vault.feeOnWithdraw();
    const feeDeposit = await vault.feeOnDeposit();
    const feeRecipient = await vault.feeRecipient();
    console.log("feeOnWithdraw():", feeWithdraw.toString());
    console.log("feeOnDeposit():", feeDeposit.toString());
    console.log("feeRecipient():", feeRecipient);
  } catch (e) {
    console.warn("fee views reverted:", (e as Error).message);
  }
  try {
    const paused = await vault.paused();
    console.log("paused():", paused);
  } catch (e) {
    console.warn("paused reverted:", (e as Error).message);
  }
  try {
    const impl = await vault.getImplementation();
    console.log("getImplementation():", impl);
  } catch (e) {
    console.warn("getImplementation reverted:", (e as Error).message);
  }

  console.log("\n--- User: pending / balance / max ---");
  try {
    const [pendingAssets, pendingShares] = await vault.pendingRedeemRequest(user);
    console.log("pendingRedeemRequest(assets, pendingShares):", pendingAssets.toString(), pendingShares.toString());
  } catch (e) {
    console.warn("pendingRedeemRequest reverted:", (e as Error).message);
  }
  try {
    const balance = await vault.balanceOf(user);
    console.log("balanceOf(user):", balance.toString());
  } catch (e) {
    console.warn("balanceOf reverted:", (e as Error).message);
  }
  try {
    const maxDep = await vault.maxDeposit(user);
    const maxMint = await vault.maxMint(user);
    const maxWd = await vault.maxWithdraw(user);
    const maxRd = await vault.maxRedeem(user);
    console.log("maxDeposit(user):", maxDep.toString());
    console.log("maxMint(user):", maxMint.toString());
    console.log("maxWithdraw(user):", maxWd.toString());
    console.log("maxRedeem(user):", maxRd.toString());
  } catch (e) {
    console.warn("max* reverted:", (e as Error).message);
  }

  console.log("\n--- Previews (assets=" + assetsForPreview + ", shares=" + sharesForPreview + ") ---");
  try {
    const pd = await vault.previewDeposit(assetsForPreview);
    console.log("previewDeposit(assets):", pd.toString());
  } catch (e) {
    console.warn("previewDeposit reverted:", (e as Error).message);
  }
  try {
    const pm = await vault.previewMint(sharesForPreview);
    console.log("previewMint(shares):", pm.toString());
  } catch (e) {
    console.warn("previewMint reverted:", (e as Error).message);
  }
  try {
    const pw = await vault.previewWithdraw(assetsForPreview);
    console.log("previewWithdraw(assets):", pw.toString());
  } catch (e) {
    console.warn("previewWithdraw reverted:", (e as Error).message);
  }
  try {
    const pr = await vault.previewRedeem(sharesForPreview);
    console.log("previewRedeem(shares):", pr.toString());
  } catch (e) {
    console.warn("previewRedeem reverted:", (e as Error).message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
