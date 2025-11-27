// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {Paymaster} from "../src/Paymaster.sol";
import {TestERC20} from "../src/TestERC20.sol";

contract PaymasterTest is Test {
    EntryPoint public entryPoint;
    TestERC20 public token;
    Paymaster public paymaster;
    address public owner;

    function setUp() public {
        owner = address(this);
        entryPoint = new EntryPoint();
        token = new TestERC20(owner);
        paymaster = new Paymaster(entryPoint, token, owner);
        
        // Deposit ETH to EntryPoint for paymaster
        entryPoint.depositTo{value: 1 ether}(address(paymaster));
    }

    function testSetTokenPrice() public {
        uint256 newPrice = 2e6;
        paymaster.setTokenPrice(newPrice);
        assertEq(paymaster.tokenPrice(), newPrice);
    }

    function testWithdrawTokens() public {
        uint256 amount = 1000;
        token.mint(address(paymaster), amount);
        
        uint256 balanceBefore = token.balanceOf(owner);
        paymaster.withdrawTokens(owner, amount);
        uint256 balanceAfter = token.balanceOf(owner);
        
        assertEq(balanceAfter - balanceBefore, amount);
    }
}




