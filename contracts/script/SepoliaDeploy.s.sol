// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {AccountFactory} from "../src/AccountFactory.sol";
import {Paymaster} from "../src/Paymaster.sol";
import {TestERC20} from "../src/TestERC20.sol";

contract SepoliaDeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying to Sepolia...");
        console.log("Deployer address:", deployer);

        console.log("Deploying EntryPoint...");
        EntryPoint entryPoint = new EntryPoint();
        console.log("EntryPoint deployed at:", address(entryPoint));

        console.log("Deploying AccountFactory...");
        AccountFactory factory = new AccountFactory(entryPoint);
        console.log("AccountFactory deployed at:", address(factory));

        console.log("Deploying TestERC20...");
        TestERC20 token = new TestERC20(deployer);
        console.log("TestERC20 deployed at:", address(token));

        console.log("Deploying Paymaster...");
        Paymaster paymaster = new Paymaster(entryPoint, token, deployer);
        console.log("Paymaster deployed at:", address(paymaster));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("EntryPoint:", address(entryPoint));
        console.log("AccountFactory:", address(factory));
        console.log("TestERC20:", address(token));
        console.log("Paymaster:", address(paymaster));
        console.log("\nSave these addresses to your .env file!");
    }
}




