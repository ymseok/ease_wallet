// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {EntryPoint} from "../src/EntryPoint.sol";
import {AccountFactory} from "../src/AccountFactory.sol";
import {Paymaster} from "../src/Paymaster.sol";
import {TestERC20} from "../src/TestERC20.sol";

/**
 * Multi-chain deployment script
 * Deploys contracts to multiple chains with deterministic addresses
 *
 * Usage:
 *   forge script script/MultiChainDeploy.s.sol:MultiChainDeployScript \
 *     --rpc-url $RPC_URL \
 *     --broadcast \
 *     --verify
 */
contract MultiChainDeployScript is Script {
    // These addresses should be the same across all chains
    // In production, use a CREATE2 deployer factory for truly deterministic addresses

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        string memory chainName = vm.envString("CHAIN_NAME"); // e.g., "sepolia", "baseSepolia"

        vm.startBroadcast(deployerPrivateKey);

        console.log("=== Multi-Chain Deployment ===");
        console.log("Chain:", chainName);
        console.log("Deployer address:", deployer);
        console.log("");

        // Deploy EntryPoint
        console.log("Deploying EntryPoint...");
        EntryPoint entryPoint = new EntryPoint();
        console.log("EntryPoint deployed at:", address(entryPoint));

        // Deploy AccountFactory
        console.log("Deploying AccountFactory...");
        AccountFactory factory = new AccountFactory(entryPoint);
        console.log("AccountFactory deployed at:", address(factory));

        // Deploy TestERC20
        console.log("Deploying TestERC20...");
        TestERC20 token = new TestERC20(deployer);
        console.log("TestERC20 deployed at:", address(token));

        // Deploy Paymaster
        console.log("Deploying Paymaster...");
        Paymaster paymaster = new Paymaster(entryPoint, token, deployer);
        console.log("Paymaster deployed at:", address(paymaster));

        // Deposit funds to Paymaster for gas sponsorship
        console.log("\nDepositing 0.1 ETH to Paymaster...");
        paymaster.deposit{value: 0.1 ether}();

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary for", chainName, "===");
        console.log("EntryPoint:", address(entryPoint));
        console.log("AccountFactory:", address(factory));
        console.log("TestERC20:", address(token));
        console.log("Paymaster:", address(paymaster));
        console.log("\n=== Add these to your backend .env ===");
        console.log(
            string.concat(
                getEnvPrefix(chainName),
                "_ENTRYPOINT=",
                addressToString(address(entryPoint))
            )
        );
        console.log(
            string.concat(
                getEnvPrefix(chainName),
                "_FACTORY=",
                addressToString(address(factory))
            )
        );
        console.log(
            string.concat(
                getEnvPrefix(chainName),
                "_ERC20=",
                addressToString(address(token))
            )
        );
        console.log(
            string.concat(
                getEnvPrefix(chainName),
                "_PAYMASTER=",
                addressToString(address(paymaster))
            )
        );
    }

    function getEnvPrefix(
        string memory chainName
    ) internal pure returns (string memory) {
        if (keccak256(bytes(chainName)) == keccak256(bytes("sepolia"))) {
            return "SEPOLIA";
        } else if (
            keccak256(bytes(chainName)) == keccak256(bytes("baseSepolia"))
        ) {
            return "BASE_SEPOLIA";
        } else if (
            keccak256(bytes(chainName)) == keccak256(bytes("arbitrumSepolia"))
        ) {
            return "ARBITRUM_SEPOLIA";
        } else if (
            keccak256(bytes(chainName)) == keccak256(bytes("optimismSepolia"))
        ) {
            return "OPTIMISM_SEPOLIA";
        }
        return "UNKNOWN";
    }

    function addressToString(
        address addr
    ) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint(uint8(data[i] >> 4))];
            str[3 + i * 2] = alphabet[uint(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }
}
