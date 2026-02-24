import "dotenv/config";
import { ethers } from "hardhat";

import YoGatewayAbi from "./abi/YoGateway.json";
import ERC20Abi from "./abi/ERC20.json";

const GATEWAY_ABI = (YoGatewayAbi as { abi: ethers.InterfaceAbi }).abi;
const ERC20_ABI = (ERC20Abi as { abi: ethers.InterfaceAbi }).abi;

async function main() {
  const gatewayAddress = "0x88Acc5D232081599FD66dc4192a49B0e22aa96F2";
  const vaultAddress = "0x1F5D56ae3c8FaF313aDb8b696c394dfF34f771a2";
  const sharesRaw = 900_000_000_000;
  const minAssetsOut = "0";
  const partnerId = 0;

  const shares = BigInt(sharesRaw);
  if (shares <= 0n) throw new Error("SHARES must be > 0");

  const [signer] = await ethers.getSigners();
  const to = signer.address as `0x${string}`;

  const gateway = new ethers.Contract(gatewayAddress, GATEWAY_ABI, signer);
  const vault = new ethers.Contract(vaultAddress, ERC20_ABI, signer);

  const currentAllowance = await vault.allowance(signer.address, gatewayAddress);
  if (currentAllowance < shares) {
    console.log("Approving gateway to spend vault shares...");
    const txApprove = await vault.approve(gatewayAddress, shares);
    await txApprove.wait();
    console.log("Approved.");
  }

  const estimatedAssets = await gateway.quotePreviewRedeem(vaultAddress, shares);
  console.log("Estimated assets out:", estimatedAssets.toString());

  console.log("Redeeming...");
  const tx = await gateway.redeem(
    vaultAddress,
    shares,
    BigInt(minAssetsOut),
    to,
    Number(partnerId)
  );
  const receipt = await tx.wait();
  console.log("Tx hash:", receipt?.hash);
  const assetsOrRequestId = receipt?.logs ? "see events" : "(check gateway event)";
  console.log("Redeem done. Assets or requestId:", assetsOrRequestId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
