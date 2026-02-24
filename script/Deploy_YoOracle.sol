// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.28 <0.9.0;

import "forge-std/Script.sol";
import { YoOracle } from "src/YoOracle.sol";

import { BaseScript } from "./Base.s.sol";

contract Deploy is BaseScript {
    /// Mặc định: 24h window, 0.1% max change (1e6 / 1e9)
    uint64 internal constant DEFAULT_WINDOW_SECONDS = 86_400;
    uint64 internal constant DEFAULT_MAX_CHANGE_BPS = 1_000_000;

    /// Deploy YoOracle từ env. Gọi: forge script script/Deploy_YoOracle.sol:Deploy run
    /// Bắt buộc: ORACLE_UPDATER (địa chỉ được phép gọi updateSharePrice)
    /// Tùy chọn: ORACLE_WINDOW_SECONDS (86400), ORACLE_MAX_CHANGE_BPS (1000000 = 0.1%), ORACLE_OWNER (nếu set, chuyển ownership sau deploy)
    function run() public returns (YoOracle oracle) {
        return run(
            vm.envAddress("ORACLE_UPDATER"),
            uint64(vm.envOr("ORACLE_WINDOW_SECONDS", uint256(DEFAULT_WINDOW_SECONDS))),
            uint64(vm.envOr("ORACLE_MAX_CHANGE_BPS", uint256(DEFAULT_MAX_CHANGE_BPS))),
            vm.envOr("ORACLE_OWNER", address(0))
        );
    }

    function run(
        address _updater,
        uint64 _windowSeconds,
        uint64 _maxChangeBps,
        address _transferOwnerTo
    )
        public
        broadcast
        returns (YoOracle oracle)
    {
        require(_updater != address(0), "ORACLE_UPDATER not set");

        console.log("Deploying YoOracle...");
        console.log("Updater: ", _updater);
        console.log("Window seconds: ", _windowSeconds);
        console.log("Max change bps: ", _maxChangeBps);
        console.log("BlockNumber: ", block.number);

        oracle = new YoOracle(_updater, _windowSeconds, _maxChangeBps);
        console.log("YoOracle deployed at: ", address(oracle));
        console.log("Owner (deployer): ", oracle.owner());

        if (_transferOwnerTo != address(0) && _transferOwnerTo != broadcaster) {
            oracle.transferOwnership(_transferOwnerTo);
            console.log("Ownership transferred to: ", _transferOwnerTo);
        }

        console.log("\nOracle data:");
        console.log("DEFAULT_WINDOW_SECONDS:", oracle.DEFAULT_WINDOW_SECONDS());
        console.log("DEFAULT_MAX_CHANGE_BPS:", oracle.DEFAULT_MAX_CHANGE_BPS());
        console.log("Updater:", oracle.updater());
    }
}
