// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "./interfaces/IEntryPoint.sol";
import "./interfaces/IAccount.sol";

/**
 * Simplified EntryPoint implementation
 * Note: This is a minimal implementation for testing.
 * In production, use the official ERC-4337 EntryPoint contract.
 */
contract EntryPoint is IEntryPoint {
    mapping(address => uint256) public deposits;
    mapping(address => mapping(uint192 => uint256)) public nonces;

    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external override {
        for (uint256 i = 0; i < ops.length; i++) {
            UserOperation calldata op = ops[i];
            
            // Validate nonce
            uint256 currentNonce = getNonce(op.sender, 0);
            require(op.nonce == currentNonce, "EntryPoint: invalid nonce");
            nonces[op.sender][0] = currentNonce + 1;

            // Validate account
            IAccount account = IAccount(op.sender);
            bytes32 userOpHash = getUserOpHash(op);
            uint256 missingFunds = 0;
            
            if (deposits[op.sender] < op.maxFeePerGas * op.callGasLimit) {
                missingFunds = (op.maxFeePerGas * op.callGasLimit) - deposits[op.sender];
            }

            uint256 validationData = account.validateUserOp(op, userOpHash, missingFunds);
            require(validationData == 0, "EntryPoint: validation failed");

            // Execute call
            (bool success, ) = op.sender.call(op.callData);
            require(success, "EntryPoint: execution failed");

            // Deduct gas
            uint256 gasCost = op.maxFeePerGas * op.callGasLimit;
            deposits[op.sender] -= gasCost;
            deposits[beneficiary] += gasCost;
        }
    }

    function depositTo(address account) external payable override {
        deposits[account] += msg.value;
    }

    function getNonce(address sender, uint192 key) public view override returns (uint256) {
        return nonces[sender][key];
    }

    function getUserOpHash(UserOperation calldata userOp) public view returns (bytes32) {
        return keccak256(abi.encode(
            userOp.sender,
            userOp.nonce,
            keccak256(userOp.initCode),
            keccak256(userOp.callData),
            userOp.callGasLimit,
            userOp.verificationGasLimit,
            userOp.preVerificationGas,
            userOp.maxFeePerGas,
            userOp.maxPriorityFeePerGas,
            userOp.paymaster,
            keccak256(userOp.paymasterData),
            block.chainid,
            address(this)
        ));
    }
}

