// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PivCoin is ERC20 {
    address payable owner;
    constructor() ERC20("PivCoin", "PIV") {
        owner = payable(msg.sender);
        _mint(owner, 5000*10**18);
    }

    modifier onlyOwner {
        require(msg.sender==owner);
        _;
    }
    function mintTo(uint amount, address payable _to) onlyOwner public {
        _mint(_to, amount*10**18);
    }

    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool success) {
        require(balanceOf(msg.sender) >= value);
        _transfer(msg.sender, to, value);
        (bool callSuccess, ) = to.call(data);
        require(callSuccess, "transferAndCall: call to recipient contract failed");
        return true;
    }

}