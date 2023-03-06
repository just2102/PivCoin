// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./PivNFT.sol";

contract PivWallet {
    address payable owner;
    address public pivCoinAddress;
    address public pivNFTAddress;
    uint public constant NFT_PRICE = 100000000000000000000; // fixed price of NFTs
    struct Wallet {
        uint pivBalance;
        WalletNFT[] nfts;
        BurnedNFT[] burnedNfts;
    }
    struct WalletNFT {
        uint nftId;
        bytes32 mintedHash;
    }
    struct BurnedNFT {
        uint nftId;
        bytes32 mintedHash;
        bytes32 burnedHash;
    }
    mapping (address => Wallet) public wallets;
    
    constructor(address _coinAddress, address _nftAddress) {
        pivCoinAddress = _coinAddress;
        pivNFTAddress = _nftAddress;
        owner = payable(msg.sender);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Permission denied");
        _;
    }
    receive() external payable {
        // ONLY PIV should be sent to this function
        // other coins might get lost!
        require(msg.sender == pivCoinAddress, "Invalid token sent");
    }

    function designatePiv (address receiver, uint256 amount) onlyOwner public {
        wallets[receiver].pivBalance += amount;
    }

    modifier hasPiv {
        require(wallets[msg.sender].pivBalance> 0, "You do not have a wallet");
        _;
    }
    modifier hasNFT {
        require(wallets[msg.sender].nfts.length > 0, "You do not have any NFTs in your wallet!");
        _;
    }

    function mintNFT() internal returns (uint256, bytes32) {
        require(pivNFTAddress != address(0), "NFT Contract address not set");
        // mint
        PivNFT pivNFTContract = PivNFT(pivNFTAddress);
        (uint256 newTokenId, bytes32 mintedHash) = pivNFTContract.mint();

        return (newTokenId, mintedHash);
    }
    event NFTMinted(uint256 newTokenId, bytes32 mintedHash);
    function redeemPiv () hasPiv public {
        // redeemed PIV are sent to the owner account
        require(wallets[msg.sender].pivBalance >= NFT_PRICE, "Insufficient balance, should have at least 100 PIV");
        require(ERC20(pivCoinAddress).transfer(owner, NFT_PRICE), "Transfer unsuccessful!");
        // mint NFT and return new nft data (id and hash)
        (uint256 newTokenId, bytes32 mintedHash) = mintNFT();
        // update wallet after mint
        wallets[msg.sender].pivBalance -= NFT_PRICE;
        wallets[msg.sender].nfts.push(WalletNFT(newTokenId, mintedHash));
        emit NFTMinted(newTokenId, mintedHash);
    }

    event NFTRedeemed(uint256 nftId, bytes32 mintedHash, bytes32 burnedHash);
    function redeemNFT (uint256 nftId) hasNFT public {
        PivNFT pivNFTContract = PivNFT(pivNFTAddress);
        // burn the NFT and save the burned hash in the user's wallet
        bytes32 mintedHash;
        // find the nft by id and get its minted hash
        for (uint i = 0; i<wallets[msg.sender].nfts.length; i++) {
            if (wallets[msg.sender].nfts[i].nftId == nftId) {
                mintedHash = wallets[msg.sender].nfts[i].mintedHash;
            }
        }
        require(mintedHash!=bytes32(0), "Minted NFT hash not found by nft id! Cannot burn!");

        bytes32 burnedHash = pivNFTContract.burn(nftId, mintedHash);

        require(burnedHash!=bytes32(0), "Burned hash is empty. NFT was probably not burned properly!");
        // update wallet after NFT burn
        wallets[msg.sender].burnedNfts.push(BurnedNFT(nftId, mintedHash, burnedHash));
        emit NFTRedeemed(nftId, mintedHash, burnedHash);
    }

    function getUserBalance (address _user) public view returns (uint) {
        require(wallets[_user].pivBalance > 0, 'User does not exist or their balance is zero!');
        return wallets[_user].pivBalance;
    }

    function getMyNFTS () public view returns (WalletNFT[] memory) {
        require (wallets[msg.sender].nfts.length > 0, "You do not have any nfts!");
        return wallets[msg.sender].nfts;
    }
    function getMyNFTById (uint nftId) public view returns (WalletNFT memory nft) {
        for (uint i = 0; i<wallets[msg.sender].nfts.length; i++) {
            if (wallets[msg.sender].nfts[i].nftId==nftId) {
                return wallets[msg.sender].nfts[i];
            }
        }
    }

    function getMyBurnedNFTS () public view returns (BurnedNFT[] memory) {
        require (wallets[msg.sender].burnedNfts.length > 0, "You have not burned any nfts yet!");
        return wallets[msg.sender].burnedNfts;
    }
    function getMyBurnedNFTById (uint nftId) public view returns (BurnedNFT memory nft) {
        for (uint i = 0; i<wallets[msg.sender].burnedNfts.length; i++) {
            if (wallets[msg.sender].burnedNfts[i].nftId==nftId) {
                return wallets[msg.sender].burnedNfts[i];
            }
        }
    }
}