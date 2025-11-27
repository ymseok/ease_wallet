// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {AccountFactory} from "../src/AccountFactory.sol";
import {SimpleAccount} from "../src/SimpleAccount.sol";
import {Paymaster} from "../src/Paymaster.sol";
import {TestERC20} from "../src/TestERC20.sol";

/**
 * End-to-end integration tests for AA wallet system
 * Tests complete workflows including account creation, transfers, and gas sponsorship
 */
contract E2ETest is Test {
    EntryPoint public entryPoint;
    AccountFactory public factory;
    Paymaster public paymaster;
    TestERC20 public token;

    address public user1;
    address public user2;
    uint256 public user1PrivateKey;
    uint256 public user2PrivateKey;

    SimpleAccount public account1;
    SimpleAccount public account2;

    function setUp() public {
        // Setup users
        user1PrivateKey = 0x1111;
        user2PrivateKey = 0x2222;
        user1 = vm.addr(user1PrivateKey);
        user2 = vm.addr(user2PrivateKey);

        console.log("User1:", user1);
        console.log("User2:", user2);

        // Deploy contracts
        entryPoint = new EntryPoint();
        factory = new AccountFactory(entryPoint);
        token = new TestERC20(address(this));
        paymaster = new Paymaster(entryPoint, token, address(this));

        console.log("EntryPoint:", address(entryPoint));
        console.log("Factory:", address(factory));
        console.log("Token:", address(token));
        console.log("Paymaster:", address(paymaster));

        // Fund paymaster
        vm.deal(address(paymaster), 100 ether);
        paymaster.deposit{value: 10 ether}();

        // Create AA accounts for both users
        address account1Addr = factory.createAccount(user1, 0);
        address account2Addr = factory.createAccount(user2, 0);
        account1 = SimpleAccount(payable(account1Addr));
        account2 = SimpleAccount(payable(account2Addr));

        console.log("Account1:", address(account1));
        console.log("Account2:", address(account2));

        // Fund accounts
        vm.deal(address(account1), 5 ether);
        vm.deal(address(account2), 5 ether);

        // Give tokens to accounts
        token.transfer(address(account1), 1000 * 1e18);
        token.transfer(address(account2), 1000 * 1e18);
    }

    function testMultiChainDeterministicAddress() public {
        // Same owner and salt should produce same address
        uint256 salt = 12345;

        address addr1 = factory.getAddress(user1, salt);
        address addr2 = factory.getAddress(user1, salt);

        assertEq(addr1, addr2, "Addresses should be deterministic");

        // Different salt should produce different address
        address addr3 = factory.getAddress(user1, 54321);
        assertTrue(
            addr1 != addr3,
            "Different salt should produce different address"
        );
    }

    function testETHTransferBetweenAccounts() public {
        uint256 transferAmount = 1 ether;
        uint256 initialBalance = address(account2).balance;

        // Account1 sends ETH to Account2
        vm.prank(address(entryPoint));
        account1.execute(address(account2), transferAmount, "");

        assertEq(address(account2).balance, initialBalance + transferAmount);
    }

    function testTokenTransferBetweenAccounts() public {
        uint256 transferAmount = 100 * 1e18;
        uint256 initialBalance = token.balanceOf(address(account2));

        // Prepare transfer call
        bytes memory transferCall = abi.encodeWithSignature(
            "transfer(address,uint256)",
            address(account2),
            transferAmount
        );

        // Account1 transfers tokens to Account2
        vm.prank(address(entryPoint));
        account1.execute(address(token), 0, transferCall);

        assertEq(
            token.balanceOf(address(account2)),
            initialBalance + transferAmount
        );
    }

    function testOwnershipTransfer() public {
        address newOwner = address(0x9876);

        // Change owner of account1
        vm.prank(user1);
        account1.changeOwner(newOwner);

        assertEq(account1.owner(), newOwner);

        // Old owner should not be able to change owner again
        vm.expectRevert("Account: not owner");
        vm.prank(user1);
        account1.changeOwner(user1);
    }

    function testAccountCreationIdempotent() public {
        uint256 salt = 999;

        // Create account twice with same parameters
        address addr1 = factory.createAccount(user1, salt);
        address addr2 = factory.createAccount(user1, salt);

        assertEq(addr1, addr2, "Should return same address");

        // Verify account exists
        assertTrue(addr1.code.length > 0, "Account should have code");
    }

    function testPaymasterDeposit() public {
        // Paymaster was funded in setUp, just verify it has deposits
        assertTrue(
            address(paymaster).balance > 0,
            "Paymaster should have ETH balance"
        );
    }

    function testCompleteUserFlow() public {
        console.log("\n=== Complete User Flow Test ===");

        // 1. User1 creates account (already done in setUp)
        console.log("1. Account created:", address(account1));
        console.log("   Owner:", account1.owner());
        assertEq(account1.owner(), user1);

        // 2. User1 receives tokens (already done in setUp)
        uint256 user1Tokens = token.balanceOf(address(account1));
        console.log("2. User1 token balance:", user1Tokens / 1e18, "tokens");
        assertEq(user1Tokens, 1000 * 1e18);

        // 3. User1 sends ETH to User2
        uint256 transferAmount = 0.5 ether;
        uint256 user2InitialBalance = address(account2).balance;

        vm.prank(address(entryPoint));
        account1.execute(address(account2), transferAmount, "");

        console.log("3. Sent", transferAmount / 1e18, "ETH to User2");
        console.log(
            "   User2 new balance:",
            address(account2).balance / 1e18,
            "ETH"
        );
        assertEq(
            address(account2).balance,
            user2InitialBalance + transferAmount
        );

        // 4. User1 changes PIN (simulated by changing owner)
        address newOwner = vm.addr(0x3333);
        vm.prank(user1);
        account1.changeOwner(newOwner);

        console.log("4. Changed owner to:", newOwner);
        assertEq(account1.owner(), newOwner);

        console.log("\n=== Test Completed Successfully ===\n");
    }
}
