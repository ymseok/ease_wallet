// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "./interfaces/IAccount.sol";
import "./interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * Simple Account implementation
 * Basic smart account that uses ECDSA signature validation
 */
contract SimpleAccount is IAccount {
    using ECDSA for bytes32;

    IEntryPoint public immutable entryPoint;
    address public owner;

    modifier onlyEntryPoint() {
        require(
            msg.sender == address(entryPoint),
            "Account: not from EntryPoint"
        );
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Account: not owner");
        _;
    }

    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    constructor(IEntryPoint _entryPoint, address _owner) {
        entryPoint = _entryPoint;
        owner = _owner;
    }

    /**
     * Change account owner (for PIN change support)
     * Can only be called by current owner
     */
    function changeOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Account: new owner is zero address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnerChanged(previousOwner, newOwner);
    }

    /**
     * Execute a transaction (called by entryPoint)
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external onlyEntryPoint {
        (bool success, ) = dest.call{value: value}(func);
        require(success, "Account: execution failed");
    }

    /**
     * Validate user's signature and nonce
     */
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        require(
            msg.sender == address(entryPoint),
            "Account: not from EntryPoint"
        );

        // Recover signature
        bytes32 hash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", userOpHash)
        );
        address recovered = hash.recover(userOp.signature);

        // Validate owner signature
        if (recovered != owner) {
            return 1; // Validation failed
        }

        // Deposit missing funds if needed
        if (missingAccountFunds > 0) {
            (bool success, ) = payable(msg.sender).call{
                value: missingAccountFunds
            }("");
            (success);
        }

        return 0; // Validation success
    }

    /**
     * Deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * Withdraw value from the account's deposit
     */
    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount
    ) public onlyOwner {
        // This would require EntryPoint to have withdrawTo method
        // For simplicity, we'll keep funds in the account
    }

    receive() external payable {}
}
