// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";

import { Authority } from "src/base/AuthUpgradeable.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { Users } from "../../utils/Types.sol";
import { Utils } from "../../utils/Utils.sol";
import { Events } from "../../utils/Events.sol";
import { Constants } from "../../utils/Constants.sol";
import { MockAuthority } from "../../mocks/MockAuthority.sol";
import { MockERC20 } from "../../mocks/MockERC20.sol";

import { YoGateway } from "src/YoGateway.sol";
import { YoVault } from "src/YoVault.sol";
import { YoRegistry } from "src/YoRegistry.sol";

/// @notice Base test contract with common logic needed by all YoGateway tests.
/// Set env FORK=1 to run against Arbitrum RPC (real USDC); otherwise uses MockERC20 (no RPC).

abstract contract Gateway_Base_Test is Test, Events, Utils, Constants {
    using Math for uint256;

    /// @dev Arbitrum One native USDC
    address internal constant ARBITRUM_USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;

    // ========================================= VARIABLES =========================================
    Users internal users;
    /// @dev When true, tests use createSelectFork + real USDC; when false, use MockERC20 (no RPC).
    bool internal useFork;

    // ====================================== TEST CONTRACTS =======================================
    IERC20 internal usdc;
    YoVault internal yoVault;
    YoGateway internal gateway;
    Authority internal authority;
    YoRegistry internal registry;

    // Dummy address for testing unregistered vaults
    address internal constant DUMMY_VAULT = address(0x1234567890123456789012345678901234567890);

    // ====================================== SET-UP FUNCTION ======================================
    function setUp() public virtual {
        useFork = vm.envOr("FORK", uint256(0)) == 1;

        if (useFork) {
            vm.createSelectFork(vm.envOr("ARBITRUM_RPC_URL", string("https://evm-42161.keplr.app")));
            usdc = IERC20(ARBITRUM_USDC);
        } else {
            MockERC20 mockUsdc = new MockERC20("USD Coin", "USDC");
            usdc = IERC20(address(mockUsdc));
        }
        vm.label({ account: address(usdc), newLabel: "USDC" });

        // Create the admin.
        users.admin = payable(makeAddr({ name: "Admin" }));
        vm.startPrank({ msgSender: users.admin });

        deployContracts();

        vm.label({ account: address(yoVault), newLabel: "yoUSDCVault" });

        // Create users for testing.
        (users.bob, users.bobKey) = createUser("Bob");
        (users.alice, users.aliceKey) = createUser("Alice");
    }

    // ====================================== HELPERS =======================================

    /// @dev Funds an address with USDC: deal() when FORK=1, mint() when mock.
    function fundWithUsdc(address to, uint256 amount) internal {
        if (useFork) {
            deal({ token: address(usdc), to: to, give: amount, adjust: true });
        } else {
            MockERC20(address(usdc)).mint(to, amount);
        }
    }

    /// @dev Approves the protocol contracts to spend the user's USDC and shares.
    function approveProtocol(address from) internal {
        resetPrank({ msgSender: from });
        usdc.approve({ spender: address(gateway), value: UINT256_MAX });
        usdc.approve({ spender: address(yoVault), value: UINT256_MAX });
        yoVault.approve({ spender: address(gateway), value: UINT256_MAX });
        yoVault.approve({ spender: address(yoVault), value: UINT256_MAX });
    }

    /// @dev Generates a user, labels its address, funds it with test assets, and approves the protocol contracts.
    function createUser(string memory name) internal returns (address payable, uint256) {
        (address user, uint256 key) = makeAddrAndKey(name);
        vm.deal({ account: user, newBalance: 100 ether });
        fundWithUsdc(user, 1_000_000e6);
        approveProtocol({ from: user });
        return (payable(user), key);
    }

    /// @dev Deploys all the necessary contracts
    function deployContracts() internal {
        // Deploy YoRegistry
        YoRegistry registryImpl = new YoRegistry();
        bytes memory registryData =
            abi.encodeWithSelector(YoRegistry.initialize.selector, users.admin, Authority(address(0)));
        TransparentUpgradeableProxy registryProxy =
            new TransparentUpgradeableProxy(address(registryImpl), users.admin, registryData);
        registry = YoRegistry(payable(address(registryProxy)));

        // Deploy YoGateway
        YoGateway gatewayImpl = new YoGateway();
        bytes memory data = abi.encodeWithSelector(YoGateway.initialize.selector, address(registry));
        gateway = YoGateway(payable(new TransparentUpgradeableProxy(address(gatewayImpl), users.admin, data)));

        // Set up authority for registry
        authority = new MockAuthority(users.admin, Authority(address(0)));
        registry.setAuthority({ newAuthority: authority });

        MockAuthority(address(authority)).setUserRole(users.admin, ADMIN_ROLE, true);

        // Add the existing vault to the registry
        registry.addYoVault(address(yoVault));

        // Label the contracts
        vm.label({ account: address(gateway), newLabel: "YoGateway" });
        vm.label({ account: address(registry), newLabel: "YoRegistry" });
    }
}
