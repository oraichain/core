// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.28 <0.9.0;

import "forge-std/Script.sol";
import { YoVault } from "src/YoVault.sol";
import { RolesAuthority } from "@solmate/auth/authorities/RolesAuthority.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { BaseScript } from "./Base.s.sol";

contract Deploy is BaseScript {
    /// Deploy từ env (tránh lỗi parser khi truyền string từ CLI). Gọi: forge script script/Deploy_YoVault.sol:Deploy run
    /// Bắt buộc: VAULT_NAME, VAULT_SYMBOL, VAULT_ASSET, VAULT_OWNER
    /// Tùy chọn: VAULT_AUTHORITY, VAULT_IMPL (mặc định 0), VAULT_DEPOSIT_AMOUNT (0), VAULT_PAUSE (false)
    function run() public returns (YoVault vault, RolesAuthority authority) {
        return run(
            vm.envString("VAULT_NAME"),
            vm.envString("VAULT_SYMBOL"),
            vm.envAddress("VAULT_ASSET"),
            vm.envAddress("VAULT_OWNER"),
            vm.envOr("VAULT_AUTHORITY", address(0)),
            vm.envOr("VAULT_IMPL", address(0)),
            vm.envOr("VAULT_DEPOSIT_AMOUNT", uint256(0)),
            vm.envOr("VAULT_PAUSE", false)
        );
    }

    function run(
        string memory _name,
        string memory _symbol,
        address _asset,
        address _owner,
        address _authority,
        address _vault,
        uint256 _depositAmount,
        bool _pause
    )
        public
        broadcast
        returns (YoVault vault, RolesAuthority authority)
    {
        console.log("Deploying vault...");
        console.log("Name: ", _name);
        console.log("Symbol: ", _symbol);
        console.log("Asset: ", _asset);
        console.log("Owner: ", _owner);
        console.log("Authority: ", _authority);
        console.log("Vault: ", _vault);

        require(_owner != address(0), "No Owner address set");
        require(_asset != address(0), "Asset address not set");

        console.log("BlockNumber: ", block.number);

        if (_authority == address(0)) {
            authority = new RolesAuthority(_owner, RolesAuthority(address(0)));
            console.log("Authority deployed at: ", address(authority));
        } else {
            authority = RolesAuthority(_authority);
        }

        YoVault impl;
        if (_vault == address(0)) {
            impl = new YoVault();
            console.log("yoVault implementation deployed at: ", address(impl));
        } else {
            impl = YoVault(payable(_vault));
        }
        console.log("yoVault implementation deployed at: ", address(impl));

        bytes memory data = abi.encodeWithSelector(YoVault.initialize.selector, IERC20(_asset), _owner, _name, _symbol);

        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(impl), _owner, data);

        vault = YoVault(payable(address(proxy)));
        console.log("yoVault proxy deployed at: ", address(vault));

        vault.setAuthority(authority);
        console.log("Authority set for vault");

        if (_depositAmount > 0) {
            IERC20(_asset).approve(address(vault), _depositAmount);
            vault.deposit(_depositAmount, _owner);
            console.log("Deposited: ", _depositAmount);
        }

        if (_pause) {
            vault.pause();
        }

        console.log("\nVault data:");
        console.log("Underlying asset:", address(vault.asset()));
        console.log("Name:", vault.name());
        console.log("Symbol:", vault.symbol());
        console.log("Owner:", vault.owner());
        console.log("Total Supply:", vault.totalSupply());
        console.log("Paused:", vault.paused());
        console.log("Authority:", address(vault.authority()));
        console.log("Deposit Fee:", vault.feeOnDeposit());
        console.log("Withdraw Fee:", vault.feeOnDeposit());
        console.log("FeeRecipient:", vault.feeRecipient());
    }
}
