import "dotenv/config";
import { ethers } from "hardhat";

import YoGatewayAbi from "./abi/YoGateway.json";
import ERC20Abi from "./abi/ERC20.json";

const GATEWAY_ABI = (YoGatewayAbi as { abi: ethers.InterfaceAbi }).abi;
const ERC20_ABI = (ERC20Abi as { abi: ethers.InterfaceAbi }).abi;
const VAULT_ABI = ["function asset() external view returns (address)"];

async function main() {
  const gatewayAddress = "0x88Acc5D232081599FD66dc4192a49B0e22aa96F2";
  const vaultAddress = "0x156722e04eA32E7DEC8C7aDfC58347aA23983b58";
  const assetsRaw = 1_000_000;
  const minSharesOut = "0";
  const partnerId = 0;

  const assets = BigInt(assetsRaw);
  if (assets <= 0n) throw new Error("ASSETS must be > 0");

  const [signer] = await ethers.getSigners();
  const to = signer.address as `0x${string}`;

  const gateway = new ethers.Contract(gatewayAddress, GATEWAY_ABI, signer);
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI, signer);
  const assetAddress = (await vault.asset()) as string;
  const asset = new ethers.Contract(assetAddress, ERC20_ABI, signer);

  const currentAllowance = await asset.allowance(signer.address, gatewayAddress);
  if (currentAllowance < assets) {
    console.log("Approving gateway to spend asset...");
    const txApprove = await asset.approve(gatewayAddress, assets);
    await txApprove.wait();
    console.log("Approved.");
  }

  try {
    const estimatedShares = await gateway.quotePreviewDeposit(vaultAddress, assets);
    console.log("Estimated shares out:", estimatedShares.toString());
  } catch (e) {
    console.warn("quotePreviewDeposit reverted (vault may not be in registry or vault paused). Proceeding with deposit...");
  }

  console.log("Depositing...");
  const tx = await gateway.deposit(
    vaultAddress,
    assets,
    BigInt(minSharesOut),
    to,
    Number(partnerId)
  );
  const receipt = await tx.wait();
  console.log("Tx hash:", receipt?.hash);
  const sharesOut = receipt?.logs ? "see events" : "(check gateway event)";
  console.log("Deposit done. Shares out:", sharesOut);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
