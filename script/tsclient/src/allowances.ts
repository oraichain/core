import "dotenv/config";
import { ethers } from "hardhat";

import YoGatewayAbi from "./abi/YoGateway.json";

const GATEWAY_ABI = (YoGatewayAbi as { abi: ethers.InterfaceAbi }).abi;

/**
 * Xem allowance của Gateway: share allowance và asset allowance cho một owner (test, hardcode).
 */
async function main() {
  const gatewayAddress = "0x88Acc5D232081599FD66dc4192a49B0e22aa96F2";
  const vaultAddress = "0x1F5D56ae3c8FaF313aDb8b696c394dfF34f771a2";

  const [signer] = await ethers.getSigners();
  const owner = signer.address;

  const gateway = new ethers.Contract(gatewayAddress, GATEWAY_ABI, signer);

  console.log("Gateway:", gatewayAddress);
  console.log("Vault:", vaultAddress);
  console.log("Owner:", owner);
  console.log("");

  try {
    const shareAllowance = await gateway.getShareAllowance(vaultAddress, owner);
    console.log("getShareAllowance (vault shares → gateway):", shareAllowance.toString());
  } catch (e) {
    console.warn("getShareAllowance reverted:", (e as Error).message);
  }

  try {
    const assetAllowance = await gateway.getAssetAllowance(vaultAddress, owner);
    console.log("getAssetAllowance (vault asset → gateway):", assetAllowance.toString());
  } catch (e) {
    console.warn("getAssetAllowance reverted:", (e as Error).message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
