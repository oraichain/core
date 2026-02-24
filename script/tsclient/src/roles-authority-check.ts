import "dotenv/config";
import { ethers } from "hardhat";
import type { InterfaceAbi } from "ethers";
import type { Contract } from "ethers";

import YoVaultV2Abi from "./abi/YoVault_V2.json";
import RolesAuthorityAbi from "./abi/RolesAuthority.json";

const VAULT_ABI = (YoVaultV2Abi as { abi: InterfaceAbi }).abi;
const ROLES_AUTHORITY_ABI = (RolesAuthorityAbi as { abi: InterfaceAbi }).abi;

/** Tên các function requiresAuth trên vault (để kiểm tra capability). */
const VAULT_AUTH_FUNCTION_NAMES = [
  "manage",
  "pause",
  "unpause",
  "fulfillRedeem",
  "cancelRedeem",
  "onUnderlyingBalanceUpdate",
  "updateMaxPercentageChange",
  "updateWithdrawFee",
  "updateDepositFee",
  "updateFeeRecipient",
] as const;

type AbiItem = {
  type: string;
  name?: string;
  inputs?: { type: string }[];
};

function getSelectorsForFunction(abi: InterfaceAbi, functionName: string): string[] {
  const iface = new ethers.Interface(abi as InterfaceAbi);
  const items = abi as AbiItem[];
  const selectors: string[] = [];
  for (const item of items) {
    if (item.type !== "function" || item.name !== functionName) continue;
    const sig = `${item.name}(${(item.inputs ?? []).map((i) => i.type).join(",")})`;
    const frag = iface.getFunction(sig);
    if (frag) selectors.push(frag.selector);
  }
  return selectors;
}

/** Kiểm tra user có role không. */
async function checkUserRole(
  authority: Contract,
  user: string,
  role: number
): Promise<boolean> {
  return authority.doesUserHaveRole(user, role);
}

/** Kiểm tra role có capability (target, selector) không. */
async function checkRoleCapability(
  authority: Contract,
  role: number,
  target: string,
  selector: string
): Promise<boolean> {
  return authority.doesRoleHaveCapability(
    role,
    target,
    selector as `0x${string}`
  );
}

/** Kiểm tra user có được gọi (target, selector) không (canCall). */
async function checkCanCall(
  authority: Contract,
  user: string,
  target: string,
  selector: string
): Promise<boolean> {
  return authority.canCall(user, target, selector as `0x${string}`);
}

/**
 * Script kiểm tra RolesAuthority:
 * - doesUserHaveRole(user, role)
 * - doesRoleHaveCapability(role, target, functionSig) cho vault và asset
 * - canCall(user, target, functionSig) (user có thực sự gọi được không)
 *
 * Env: ROLES_AUTHORITY_ADDRESS, VAULT_ADDRESS. Tùy chọn: USER_ADDRESS (default signer), ROLE (default 1).
 */
async function main() {
  const authorityAddress = process.env.ROLES_AUTHORITY_ADDRESS;
  const vaultAddress = process.env.VAULT_ADDRESS;
  if (!authorityAddress || !vaultAddress) {
    throw new Error("Set ROLES_AUTHORITY_ADDRESS and VAULT_ADDRESS in .env");
  }

  const userAddress = process.env.USER_ADDRESS ?? "";
  const role = parseInt(process.env.ROLE ?? "1", 10);

  const [signer] = await ethers.getSigners();
  const user = userAddress || signer.address;

  const authority = new ethers.Contract(
    authorityAddress,
    ROLES_AUTHORITY_ABI,
    signer
  );
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI, signer);
  const assetAddress = (await vault.asset()) as string;

  console.log("RolesAuthority:", authorityAddress);
  console.log("Vault:", vaultAddress);
  console.log("User:", user);
  console.log("Role:", role);
  console.log("");

  const hasRole = await checkUserRole(authority, user, role);
  console.log(`doesUserHaveRole(${user}, ${role}): ${hasRole}`);
  console.log("");

  console.log("--- doesRoleHaveCapability(role, target, selector) ---");
  for (const name of VAULT_AUTH_FUNCTION_NAMES) {
    const selectors = getSelectorsForFunction(VAULT_ABI, name);
    for (const sel of selectors) {
      const ok = await checkRoleCapability(authority, role, vaultAddress, sel);
      console.log(`  vault.${name} (${sel}): ${ok}`);
    }
  }
  const transferSelector = ethers.id("transfer(address,uint256)").slice(0, 10);
  const assetCap = await checkRoleCapability(
    authority,
    role,
    assetAddress,
    transferSelector
  );
  console.log(`  asset.transfer (${transferSelector}): ${assetCap}`);
  console.log("");

  console.log("--- canCall(user, target, selector) ---");
  for (const name of VAULT_AUTH_FUNCTION_NAMES) {
    const selectors = getSelectorsForFunction(VAULT_ABI, name);
    for (const sel of selectors) {
      const ok = await checkCanCall(authority, user, vaultAddress, sel);
      console.log(`  vault.${name} (${sel}): ${ok}`);
    }
  }
  const assetCanCall = await checkCanCall(
    authority,
    user,
    assetAddress,
    transferSelector
  );
  console.log(`  asset.transfer (${transferSelector}): ${assetCanCall}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
