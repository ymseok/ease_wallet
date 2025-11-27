// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {AccountFactory} from "../src/AccountFactory.sol";
import {SimpleAccount} from "../src/SimpleAccount.sol";
import {Paymaster} from "../src/Paymaster.sol";
import {TestERC20} from "../src/TestERC20.sol";
import {IEntryPoint} from "../src/interfaces/IEntryPoint.sol";

contract IntegrationTest is Test {
    EntryPoint public entryPoint;
    AccountFactory public factory;
    Paymaster public paymaster;
    TestERC20 public token;

    address public owner;
    uint256 public ownerPrivateKey;
    SimpleAccount public account;

    function setUp() public {
        ownerPrivateKey = 0x123;
        owner = vm.addr(ownerPrivateKey);

        entryPoint = new EntryPoint();
        factory = new AccountFactory(entryPoint);
        token = new TestERC20(address(this));
        paymaster = new Paymaster(entryPoint, token, address(this));

        // Deposit ETH to EntryPoint for paymaster
        entryPoint.depositTo{value: 1 ether}(address(paymaster));

        // Create account
        uint256 salt = 0;
        address accountAddress = factory.createAccount(owner, salt);
        account = SimpleAccount(payable(accountAddress));

        // Fund account
        vm.deal(address(account), 1 ether);
    }

    function testAccountExecution() public {
        address recipient = address(0x5678);
        uint256 amount = 0.1 ether;
        bytes memory callData = "";

        // Execute must be called from EntryPoint
        vm.prank(address(entryPoint));
        account.execute(recipient, amount, callData);

        assertEq(recipient.balance, amount);
    }
}
