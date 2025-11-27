// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {AccountFactory} from "../src/AccountFactory.sol";
import {Paymaster} from "../src/Paymaster.sol";
import {TestERC20} from "../src/TestERC20.sol";

/**
 * Local deployment script for Foundry/Anvil
 *
 * Usage:
 *   forge script script/LocalDeploy.s.sol:LocalDeployScript --fork-url http://localhost:8545 --broadcast
 */
contract LocalDeployScript is Script {
    function run() external {
        // Anvil default account #0
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("=== Local Deployment (Anvil) ===");
        console.log("Deployer address:", deployer);
        console.log("Balance:", deployer.balance / 1e18, "ETH");
        console.log("");

        // Deploy EntryPoint
        console.log("1. Deploying EntryPoint...");
        EntryPoint entryPoint = new EntryPoint();
        console.log("   EntryPoint deployed at:", address(entryPoint));

        // Deploy AccountFactory
        console.log("2. Deploying AccountFactory...");
        AccountFactory factory = new AccountFactory(entryPoint);
        console.log("   AccountFactory deployed at:", address(factory));

        // Deploy TestERC20
        console.log("3. Deploying TestERC20...");
        TestERC20 token = new TestERC20(deployer);
        console.log("   TestERC20 deployed at:", address(token));
        console.log("   Initial supply:", token.totalSupply() / 1e18, "tokens");

        // Deploy Paymaster
        console.log("4. Deploying Paymaster...");
        Paymaster paymaster = new Paymaster(entryPoint, token, deployer);
        console.log("   Paymaster deployed at:", address(paymaster));

        // Fund Paymaster with ETH for gas sponsorship
        console.log("5. Funding Paymaster...");
        paymaster.deposit{value: 1 ether}();
        console.log("   Deposited 1 ETH to Paymaster");

        // Transfer some tokens to paymaster for testing
        token.transfer(address(paymaster), 1000 * 1e18);
        console.log("   Transferred 1000 tokens to Paymaster");

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("EntryPoint:      ", address(entryPoint));
        console.log("AccountFactory:  ", address(factory));
        console.log("TestERC20:       ", address(token));
        console.log("Paymaster:       ", address(paymaster));
        console.log("\n=== Test Account Info ===");
        console.log("Deployer:        ", deployer);
        console.log(
            "Token Balance:   ",
            token.balanceOf(deployer) / 1e18,
            "tokens"
        );

        console.log("\n=== Next Steps ===");
        console.log("Run tests with: forge test -vvv");
        console.log(
            "Or interact via: forge script --sig 'createAccount()' ..."
        );
    }
}
