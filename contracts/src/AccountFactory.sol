// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "./SimpleAccount.sol";
import "./interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

/**
 * Factory for creating SimpleAccount instances
 * Uses CREATE2 for deterministic address generation
 */
contract AccountFactory {
    IEntryPoint public immutable entryPoint;
    SimpleAccount public immutable accountImplementation;

    event AccountCreated(address indexed account, address indexed owner);

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
        // Deploy implementation contract
        accountImplementation = new SimpleAccount(_entryPoint, address(0));
    }

    /**
     * Create an account with a deterministic address
     * @param owner The owner of the account
     * @param salt Salt for CREATE2
     * @return ret The address of the created account
     */
    function createAccount(address owner, uint256 salt) public returns (address ret) {
        address addr = getAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return addr;
        }

        bytes memory deploymentData = abi.encodePacked(
            type(SimpleAccount).creationCode,
            abi.encode(entryPoint, owner)
        );

        ret = Create2.deploy(0, bytes32(salt), deploymentData);
        emit AccountCreated(ret, owner);
    }

    /**
     * Calculate the counterfactual address of this account as it would be returned by createAccount()
     * @param owner The owner of the account
     * @param salt Salt for CREATE2
     * @return The address of the account
     */
    function getAddress(address owner, uint256 salt) public view returns (address) {
        bytes memory deploymentData = abi.encodePacked(
            type(SimpleAccount).creationCode,
            abi.encode(entryPoint, owner)
        );
        return Create2.computeAddress(bytes32(salt), keccak256(deploymentData));
    }
}




