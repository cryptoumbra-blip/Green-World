// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GreenWorld
 * @notice Minimal onchain click game: pay to greenify a tile. Event-driven, no map storage.
 */
contract GreenWorld {
    address public owner;
    uint256 public price;

    event TileGreenified(address indexed user, uint256 x, uint256 y);

    error InsufficientPayment();
    error TransferFailed();
    error NotOwner();

    constructor(uint256 _price) {
        owner = msg.sender;
        price = _price;
    }

    function greenify(uint256 x, uint256 y) external payable {
        if (msg.value < price) revert InsufficientPayment();
        (bool ok,) = payable(owner).call{value: msg.value}("");
        if (!ok) revert TransferFailed();
        emit TileGreenified(msg.sender, x, y);
    }

    function setPrice(uint256 _price) external {
        if (msg.sender != owner) revert NotOwner();
        price = _price;
    }

    function withdraw() external {
        if (msg.sender != owner) revert NotOwner();
        uint256 balance = address(this).balance;
        (bool ok,) = payable(owner).call{value: balance}("");
        if (!ok) revert TransferFailed();
    }

    receive() external payable {}
}
