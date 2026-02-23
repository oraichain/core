// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Mock ERC20 with mint for tests. No fork/RPC required.
contract MockERC20 is IERC20 {
    mapping(address => uint256) private _balanceOf;
    mapping(address => mapping(address => uint256)) private _allowance;
    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals = 6;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balanceOf[account];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowance[owner][spender];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = _allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "ERC20: transfer amount exceeds allowance");
            _allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    /// @dev Mint tokens for testing (no access control).
    function mint(address to, uint256 amount) external {
        _balanceOf[to] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(_balanceOf[from] >= amount, "ERC20: transfer amount exceeds balance");
        _balanceOf[from] -= amount;
        _balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
