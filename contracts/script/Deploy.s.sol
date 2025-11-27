// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {AccountFactory} from "../src/AccountFactory.sol";
import {Paymaster} from "../src/Paymaster.sol";
import {TestERC20} from "../src/TestERC20.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying EntryPoint...");
        EntryPoint entryPoint = new EntryPoint();
        console.log("EntryPoint deployed at:", address(entryPoint));

        console.log("Deploying AccountFactory...");
        AccountFactory factory = new AccountFactory(entryPoint);
        console.log("AccountFactory deployed at:", address(factory));

        console.log("Deploying TestERC20...");
        TestERC20 token = new TestERC20(msg.sender);
        console.log("TestERC20 deployed at:", address(token));

        console.log("Deploying Paymaster...");
        Paymaster paymaster = new Paymaster(entryPoint, token, msg.sender);
        console.log("Paymaster deployed at:", address(paymaster));

        // Deposit some ETH to EntryPoint for paymaster
        entryPoint.depositTo{value: 1 ether}(address(paymaster));
        console.log("Deposited 1 ETH to Paymaster in EntryPoint");

        vm.stopBroadcast();
    }
}




