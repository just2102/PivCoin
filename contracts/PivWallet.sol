// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PivWallet {
    address payable owner;
    address public pivCoinAddress;
    address newNftContractAddress;

    mapping (address => uint) public wallets;

    constructor(address _pivCoinAddress) {
        pivCoinAddress = _pivCoinAddress;
        owner = payable(msg.sender);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Permission denied");
        _;
    }
    receive() external payable {

    }

    function designatePiv (address receiver, uint amount) onlyOwner public {
        // ONLY PIV should be sent to this function
        // other coins might get lost!
        wallets[receiver] += amount;
    }

    modifier walletOwner {
        require(wallets[msg.sender]> 0, "You do not have a wallet");
        _;
    }

    function redeemPiv (uint amount) walletOwner public {
        // redeemed PIV are sent to the owner account
        require(wallets[msg.sender]>=amount, "Insufficient balance");
        require(ERC20(pivCoinAddress).transfer(owner, amount), "Transfer unsuccessful!");
        // mint NFT

        wallets[msg.sender] -= amount;
    }

    function getBalance (address _user) public view returns (uint) {
        require(wallets[_user]>0, 'User does not exist or their balance is zero!');
        return wallets[_user];
    }

    function transferPivToFriend (address _friend, uint amount) public {
        require(wallets[msg.sender]>amount, 'Insufficient PIV');
        require(ERC20(pivCoinAddress).transfer(_friend, amount), "Transaction unsuccessful!");
        wallets[msg.sender] -= amount;
    }
}