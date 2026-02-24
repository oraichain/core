// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.28 <0.9.0;

import "forge-std/Script.sol";
import { YoOracle } from "src/YoOracle.sol";

import { BaseScript } from "./Base.s.sol";

/**
 * Gọi updateSharePrice trên YoOracle. Chỉ ORACLE_UPDATER (địa chỉ set khi deploy oracle) mới gọi được.
 *
 * Env:
 *   ORACLE_ADDRESS  - địa chỉ YoOracle (bắt buộc)
 *   VAULT_ADDRESS   - địa chỉ vault (proxy) cần set price (bắt buộc)
 *   PRICE           - price per share (vd. 1e18 cho 1:1 lúc mới) (bắt buộc)
 *
 * YoVault_V2 cần oracle có price > 0 cho vault thì deposit/redeem mới chạy (không revert InvalidPrice).
 */
contract Deploy is BaseScript {
    function run() public broadcast {
        address oracleAddress = vm.envAddress("ORACLE_ADDRESS");
        address vaultAddress = vm.envAddress("VAULT_ADDRESS");
        uint256 price = vm.envOr("PRICE", uint256(1));

        require(oracleAddress != address(0), "ORACLE_ADDRESS not set");
        require(vaultAddress != address(0), "VAULT_ADDRESS not set");
        require(price > 0, "PRICE must be > 0");

        console.log("Oracle:", oracleAddress);
        console.log("Vault:", vaultAddress);
        console.log("Price:", price);

        YoOracle(oracleAddress).updateSharePrice(vaultAddress, price);

        (uint256 latest,) = YoOracle(oracleAddress).getLatestPrice(vaultAddress);
        console.log("getLatestPrice after:", latest);
    }
}
