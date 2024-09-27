// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Hubeth {
    mapping(string => address) private hubbers;
    address private owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event HubberAddressAdded(string indexed handle, address indexed hubberAddress);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Function to transfer ownership
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Function to add a GitHub handle mapping
    function addHubberAddress(string calldata handle) public onlyOwner {
        require(bytes(handle).length > 0 && bytes(handle).length <= 30, "Handle must be between 1 and 30 characters");
        require(hubbers[handle] == address(0), "Handle already mapped");

        hubbers[handle] = msg.sender; // Store owner's address
        emit HubberAddressAdded(handle, msg.sender);
    }

    // Function to retrieve the Ethereum address for a given GitHub handle
    function getHubberAddress(string calldata handle) public view returns (address) {
        return hubbers[handle];
    }
}

