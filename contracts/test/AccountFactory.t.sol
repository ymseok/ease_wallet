// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {AccountFactory} from "../src/AccountFactory.sol";
import {SimpleAccount} from "../src/SimpleAccount.sol";

contract AccountFactoryTest is Test {
    EntryPoint public entryPoint;
    AccountFactory public factory;
    address public owner;

    function setUp() public {
        entryPoint = new EntryPoint();
        factory = new AccountFactory(entryPoint);
        owner = address(0x1234);
    }

    function testCreateAccount() public {
        uint256 salt = 123;
        address expectedAddress = factory.getAddress(owner, salt);
        
        address account = factory.createAccount(owner, salt);
        
        assertEq(account, expectedAddress);
        assertTrue(account.code.length > 0);
    }

    function testGetAddress() public {
        uint256 salt = 456;
        address addr1 = factory.getAddress(owner, salt);
        address addr2 = factory.getAddress(owner, salt);
        
        assertEq(addr1, addr2);
    }

    function testCreateAccountTwice() public {
        uint256 salt = 789;
        address account1 = factory.createAccount(owner, salt);
        address account2 = factory.createAccount(owner, salt);
        
        assertEq(account1, account2);
    }
}




