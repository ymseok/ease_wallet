// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {SimpleAccount} from "../src/SimpleAccount.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {IEntryPoint} from "../src/interfaces/IEntryPoint.sol";

contract SimpleAccountTest is Test {
    EntryPoint public entryPoint;
    SimpleAccount public account;
    address public owner;
    uint256 public ownerPrivateKey;

    function setUp() public {
        ownerPrivateKey = 0xABCD;
        owner = vm.addr(ownerPrivateKey);

        entryPoint = new EntryPoint();
        account = new SimpleAccount(entryPoint, owner);

        // Fund account
        vm.deal(address(account), 10 ether);
    }

    function testOwnerSet() public {
        assertEq(account.owner(), owner);
    }

    function testExecute() public {
        address recipient = address(0x9999);
        uint256 amount = 1 ether;

        vm.prank(address(entryPoint));
        account.execute(recipient, amount, "");

        assertEq(recipient.balance, amount);
    }

    function testExecuteOnlyEntryPoint() public {
        address recipient = address(0x9999);

        vm.expectRevert("Account: not from EntryPoint");
        vm.prank(owner);
        account.execute(recipient, 1 ether, "");
    }

    function testChangeOwner() public {
        address newOwner = address(0x5555);

        vm.prank(owner);
        account.changeOwner(newOwner);

        assertEq(account.owner(), newOwner);
    }

    function testChangeOwnerOnlyOwner() public {
        address newOwner = address(0x5555);
        address attacker = address(0x6666);

        vm.expectRevert("Account: not owner");
        vm.prank(attacker);
        account.changeOwner(newOwner);
    }

    function testChangeOwnerZeroAddress() public {
        vm.expectRevert("Account: new owner is zero address");
        vm.prank(owner);
        account.changeOwner(address(0));
    }

    function testChangeOwnerEvent() public {
        address newOwner = address(0x5555);

        vm.expectEmit(true, true, false, false);
        emit SimpleAccount.OwnerChanged(owner, newOwner);

        vm.prank(owner);
        account.changeOwner(newOwner);
    }

    // NOTE: testAddDeposit removed because our simple EntryPoint
    // doesn't expose deposit tracking methods
    function testReceiveETH() public {
        uint256 initialBalance = address(account).balance;

        (bool success, ) = address(account).call{value: 1 ether}("");
        assertTrue(success);

        assertEq(address(account).balance, initialBalance + 1 ether);
    }
}
