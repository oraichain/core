// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.28 <0.9.0;

import "forge-std/Script.sol";
import { IYoRegistry } from "src/interfaces/IYoRegistry.sol";

import { BaseScript } from "./Base.s.sol";

/**
 * Gọi addYoVault trên YoRegistry. Caller phải là owner của registry (hoặc có authority).
 *
 * Env:
 *   REGISTRY_ADDRESS  - địa chỉ proxy Registry (bắt buộc)
 *   VAULT_ADDRESS    - địa chỉ vault (proxy) cần add (bắt buộc)
 *
 * Hoặc gọi với tham số: run(registry, vault)
 *
 * Ví dụ:
 *   export REGISTRY_ADDRESS=0x...
 *   export VAULT_ADDRESS=0x94f0EE8ceB84D6721df7e28546b45A15fDbbd455
 *   forge script script/Registry_AddYoVault.sol:Deploy run --rpc-url <RPC> [--broadcast]
 */
contract Deploy is BaseScript {
    function run() public broadcast {
        address registry = vm.envAddress("REGISTRY_ADDRESS");
        address vault = vm.envAddress("VAULT_ADDRESS");
        _addVault(registry, vault);
    }

    function run(address registry, address vault) public broadcast {
        _addVault(registry, vault);
    }

    function _addVault(address registry, address vault) internal {
        require(registry != address(0), "REGISTRY_ADDRESS not set");
        require(vault != address(0), "VAULT_ADDRESS not set");

        console.log("Registry:", registry);
        console.log("Adding vault:", vault);

        IYoRegistry(registry).addYoVault(vault);

        console.log("addYoVault done.");
        bool isRegistered = IYoRegistry(registry).isYoVault(vault);
        console.log("isYoVault:", isRegistered);
    }
}
