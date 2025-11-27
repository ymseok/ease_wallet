// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "./interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Paymaster that accepts ERC-20 tokens for gas payment
 */
contract Paymaster is Ownable {
    using SafeERC20 for IERC20;

    IEntryPoint public immutable entryPoint;
    IERC20 public immutable token;
    uint256 public constant PRICE_DENOMINATOR = 1e6;
    uint256 public tokenPrice; // Price per gas unit in tokens (with PRICE_DENOMINATOR precision)

    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event GasPaid(address indexed user, uint256 gasCost, uint256 tokenAmount);

    constructor(IEntryPoint _entryPoint, IERC20 _token, address initialOwner) Ownable(initialOwner) {
        entryPoint = _entryPoint;
        token = _token;
        tokenPrice = 1e6; // 1 token per 1e6 gas units (default)
    }

    /**
     * Validate paymaster userOp
     * Called by EntryPoint
     */
    function validatePaymasterUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 maxCost)
        external
        returns (bytes memory context, uint256 validationData)
    {
        require(msg.sender == address(entryPoint), "Paymaster: not from EntryPoint");
        
        // Calculate token amount needed
        uint256 tokenAmount = (maxCost * tokenPrice) / PRICE_DENOMINATOR;
        
        // Check user has enough tokens
        require(token.balanceOf(userOp.sender) >= tokenAmount, "Paymaster: insufficient token balance");
        
        // Return context with token amount
        context = abi.encode(userOp.sender, tokenAmount);
        validationData = 0; // Validation success
    }

    /**
     * Post-operation handler
     * Called by EntryPoint after userOp execution
     */
    function postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) external {
        require(msg.sender == address(entryPoint), "Paymaster: not from EntryPoint");
        
        (address user, uint256 tokenAmount) = abi.decode(context, (address, uint256));
        
        // Only charge tokens if operation succeeded
        if (mode == PostOpMode.opSucceeded) {
            // Transfer tokens from user to paymaster
            token.safeTransferFrom(user, address(this), tokenAmount);
            emit GasPaid(user, actualGasCost, tokenAmount);
        }
    }

    /**
     * Set token price per gas unit
     */
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;
        emit TokenPriceUpdated(oldPrice, newPrice);
    }

    /**
     * Deposit funds to EntryPoint for gas payments
     */
    function deposit() public payable {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * Withdraw deposited funds from EntryPoint
     */
    function withdrawTo(address payable withdrawAddress, uint256 amount) public onlyOwner {
        // EntryPoint would need withdrawTo method
        // For now, we keep funds in EntryPoint
    }

    /**
     * Withdraw collected tokens
     */
    function withdrawTokens(address to, uint256 amount) public onlyOwner {
        token.safeTransfer(to, amount);
    }

    receive() external payable {
        deposit();
    }
}

enum PostOpMode {
    opSucceeded,
    opReverted,
    postOpReverted
}




