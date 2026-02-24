import "dotenv/config";
import { ethers } from "hardhat";

import YoGatewayAbi from "./abi/YoGateway.json";

const GATEWAY_ABI = (YoGatewayAbi as { abi: ethers.InterfaceAbi }).abi;

/**
 * Gọi các view quote của Gateway (không gửi tx).
 * Env: GATEWAY_ADDRESS, VAULT_ADDRESS; ASSETS và/hoặc SHARES (số để quote).
 */
async function main() {
  const gatewayAddress = "0x88Acc5D232081599FD66dc4192a49B0e22aa96F2";
  const vaultAddress = "0x1F5D56ae3c8FaF313aDb8b696c394dfF34f771a2";
  const assetsRaw = 1000000;
  const sharesRaw = 1000000;

  if (!gatewayAddress || !vaultAddress) {
    throw new Error("Set GATEWAY_ADDRESS, VAULT_ADDRESS in .env");
  }

  const [signer] = await ethers.getSigners();
  const gateway = new ethers.Contract(gatewayAddress, GATEWAY_ABI, signer);

  const hasAssets = assetsRaw != null && assetsRaw !== "" && BigInt(assetsRaw) > 0n;
  const hasShares = sharesRaw != null && sharesRaw !== "" && BigInt(sharesRaw) > 0n;

  if (!hasAssets && !hasShares) {
    throw new Error("Set ASSETS and/or SHARES in .env to quote (e.g. ASSETS=1000000)");
  }

  console.log("Gateway:", gatewayAddress);
  console.log("Vault:", vaultAddress);
  console.log("");

  if (hasAssets) {
    const assets = BigInt(assetsRaw!);
    console.log("--- Quote for ASSETS =", assets.toString(), "---");
    try {
      const previewDeposit = await gateway.quotePreviewDeposit(vaultAddress, assets);
      console.log("quotePreviewDeposit:", previewDeposit.toString());
    } catch (e) {
      console.warn("quotePreviewDeposit reverted:", (e as Error).message);
    }
    try {
      const convertToShares = await gateway.quoteConvertToShares(vaultAddress, assets);
      console.log("quoteConvertToShares:", convertToShares.toString());
    } catch (e) {
      console.warn("quoteConvertToShares reverted:", (e as Error).message);
    }
    try {
      const previewWithdraw = await gateway.quotePreviewWithdraw(vaultAddress, assets);
      console.log("quotePreviewWithdraw:", previewWithdraw.toString());
    } catch (e) {
      console.warn("quotePreviewWithdraw reverted:", (e as Error).message);
    }
    console.log("");
  }

  if (hasShares) {
    const shares = BigInt(sharesRaw!);
    console.log("--- Quote for SHARES =", shares.toString(), "---");
    try {
      const previewRedeem = await gateway.quotePreviewRedeem(vaultAddress, shares);
      console.log("quotePreviewRedeem:", previewRedeem.toString());
    } catch (e) {
      console.warn("quotePreviewRedeem reverted:", (e as Error).message);
    }
    try {
      const convertToAssets = await gateway.quoteConvertToAssets(vaultAddress, shares);
      console.log("quoteConvertToAssets:", convertToAssets.toString());
    } catch (e) {
      console.warn("quoteConvertToAssets reverted:", (e as Error).message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
