import "dotenv/config";
import { ethers } from "hardhat";
import type { InterfaceAbi } from "ethers";
import type { Contract } from "ethers";

import YoVaultV2Abi from "./abi/YoVault_V2.json";
import RolesAuthorityAbi from "./abi/RolesAuthority.json";

const VAULT_ABI = (YoVaultV2Abi as { abi: InterfaceAbi }).abi;
const ROLES_AUTHORITY_ABI = (RolesAuthorityAbi as { abi: InterfaceAbi }).abi;

/** ADMIN_ROLE = 1 (giống tests/utils/Constants.sol) */
const ADMIN_ROLE = 1;

type AbiItem = {
  type: string;
  name?: string;
  inputs?: { type: string }[];
};

/** Lấy tất cả selector (kể cả overload) của một function từ ABI. */
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

/** Bật capability cho một selector trên target. */
async function setCapability(
  authority: Contract,
  role: number,
  target: string,
  selector: string,
  enabled: boolean
): Promise<void> {
  const tx = await authority.setRoleCapability(
    role,
    target,
    selector as `0x${string}`,
    enabled
  );
  await tx.wait();
  console.log("  Tx:", tx.hash);
}

/** Gán role cho user. */
async function allowUserRole(
  authority: Contract,
  user: string,
  role: number
): Promise<void> {
  console.log(`allowUserRole: user=${user}, role=${role}`);
  const tx = await authority.setUserRole(user, role, true);
  await tx.wait();
  console.log("  Tx:", tx.hash);
}

/** Bật capability cho vault.manage (mọi overload). */
async function allowVaultManage(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const selectors = getSelectorsForFunction(VAULT_ABI, "manage");
  console.log("allowVaultManage: role=%s, vault=%s", role, vaultAddress);
  for (const sel of selectors) {
    await setCapability(authority, role, vaultAddress, sel, true);
  }
}

/** Bật capability cho vault.pause. */
async function allowVaultPause(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "pause");
  if (!sel) return;
  console.log("allowVaultPause: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho vault.unpause. */
async function allowVaultUnpause(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "unpause");
  if (!sel) return;
  console.log("allowVaultUnpause: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho vault.fulfillRedeem. */
async function allowVaultFulfillRedeem(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "fulfillRedeem");
  if (!sel) return;
  console.log("allowVaultFulfillRedeem: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho vault.cancelRedeem. */
async function allowVaultCancelRedeem(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "cancelRedeem");
  if (!sel) return;
  console.log("allowVaultCancelRedeem: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho vault.onUnderlyingBalanceUpdate. */
async function allowVaultOnUnderlyingBalanceUpdate(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "onUnderlyingBalanceUpdate");
  if (!sel) return;
  console.log("allowVaultOnUnderlyingBalanceUpdate: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho vault.updateMaxPercentageChange. */
async function allowVaultUpdateMaxPercentageChange(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "updateMaxPercentageChange");
  if (!sel) return;
  console.log("allowVaultUpdateMaxPercentageChange: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho vault.updateWithdrawFee. */
async function allowVaultUpdateWithdrawFee(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "updateWithdrawFee");
  if (!sel) return;
  console.log("allowVaultUpdateWithdrawFee: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho vault.updateDepositFee. */
async function allowVaultUpdateDepositFee(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "updateDepositFee");
  if (!sel) return;
  console.log("allowVaultUpdateDepositFee: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho vault.updateFeeRecipient. */
async function allowVaultUpdateFeeRecipient(
  authority: Contract,
  role: number,
  vaultAddress: string
): Promise<void> {
  const [sel] = getSelectorsForFunction(VAULT_ABI, "updateFeeRecipient");
  if (!sel) return;
  console.log("allowVaultUpdateFeeRecipient: role=%s, vault=%s", role, vaultAddress);
  await setCapability(authority, role, vaultAddress, sel, true);
}

/** Bật capability cho asset.transfer (để vault.manage có thể gọi transfer rút tiền). */
async function allowAssetTransfer(
  authority: Contract,
  role: number,
  assetAddress: string
): Promise<void> {
  const selector = ethers.id("transfer(address,uint256)").slice(0, 10);
  console.log("allowAssetTransfer: role=%s, asset=%s", role, assetAddress);
  await setCapability(authority, role, assetAddress, selector, true);
}

/**
 * Cập nhật RolesAuthority: gán ADMIN_ROLE cho owner và bật đủ capability để owner
 * có thể manage vault, pause/unpause, fulfill/cancel redeem, update fee, và rút asset qua manage(asset, transfer(...)).
 */
async function main() {
  const authorityAddress =
    process.env.ROLES_AUTHORITY_ADDRESS ?? "0x2d6Fd834AEe668805a3eA7dD5820599eb3E70FAc";
  const vaultAddress =
    process.env.VAULT_ADDRESS ?? "0x611c347DC99EAc72e5A3A9c7009E8BeAcbBcA999";
  const admin = process.env.OWNER_ADDRESS ?? "0x070829C7eF4F0292Eace7076163428417639D267";
  const role = ADMIN_ROLE;

  const [signer] = await ethers.getSigners();
  const owner = signer.address;

  const provider = signer.provider!;
  const code = await provider.getCode(authorityAddress);
  if (!code || code === "0x" || code.length <= 2) {
    throw new Error(
      `ROLES_AUTHORITY_ADDRESS (${authorityAddress}) has no contract code. ` +
      `Use the RolesAuthority contract address from deploy log ("Authority deployed at: 0x..."), not the owner/deployer EOA.`
    );
  }

  const authority = new ethers.Contract(
    authorityAddress,
    ROLES_AUTHORITY_ABI,
    signer
  );
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI, signer);

  let authOwner: string;
  try {
    authOwner = await authority.owner();
  } catch (e: unknown) {
    const msg = (e as { shortMessage?: string })?.shortMessage ?? (e as Error).message;
    throw new Error(
      `Failed to call owner() on ROLES_AUTHORITY_ADDRESS (${authorityAddress}). ${msg}. ` +
      `Ensure the address is the RolesAuthority contract (deploy log: "Authority deployed at: 0x..."), not an EOA.`
    );
  }
  if (!authOwner || authOwner === ethers.ZeroAddress) {
    throw new Error(
      `RolesAuthority at ${authorityAddress} returned no owner. Wrong contract or not a Solmate RolesAuthority.`
    );
  }
  if (authOwner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(
      `Signer ${signer.address} is not RolesAuthority owner (${authOwner}). Use PRIVATE_KEY of authority owner.`
    );
  }

  console.log("RolesAuthority:", authorityAddress);
  console.log("Vault:", vaultAddress);
  console.log("Owner (grant role to):", admin);
  console.log("Role:", role);
  console.log("");

  await allowUserRole(authority, admin, role);

  await allowVaultManage(authority, role, vaultAddress);
  await allowVaultPause(authority, role, vaultAddress);
  await allowVaultUnpause(authority, role, vaultAddress);
  await allowVaultFulfillRedeem(authority, role, vaultAddress);
  await allowVaultCancelRedeem(authority, role, vaultAddress);
  await allowVaultOnUnderlyingBalanceUpdate(authority, role, vaultAddress);
  await allowVaultUpdateMaxPercentageChange(authority, role, vaultAddress);
  await allowVaultUpdateWithdrawFee(authority, role, vaultAddress);
  await allowVaultUpdateDepositFee(authority, role, vaultAddress);
  await allowVaultUpdateFeeRecipient(authority, role, vaultAddress);

  const assetAddress = (await vault.asset()) as string;
  await allowAssetTransfer(authority, role, assetAddress);

  console.log("\nDone. Owner can: manage, pause/unpause, fulfill/cancel redeem, update fees, withdraw via manage(asset, transfer(...)).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
