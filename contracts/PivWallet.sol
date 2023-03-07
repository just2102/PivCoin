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
        // WalletNFT[] nfts;
        mapping (uint256 => WalletNFT) nfts;
        // BurnedNFT[] burnedNfts;
        mapping (uint256 => BurnedNFT) burnedNfts;
    }
    struct WalletNFT {
        uint256 nftId;
        bytes32 mintedHash;
        bool exists;
    }
    struct BurnedNFT {
        uint256 nftId;
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
    modifier hasNFT (uint256 nftId) {
        require(wallets[msg.sender].nfts[nftId].mintedHash!=0, "This NFT is not stored in your wallet!");
        _;
    }
    modifier hasBurnedNFT (uint256 nftId) {
        require(wallets[msg.sender].burnedNfts[nftId].mintedHash!=0, "You have not burned this NFT");
        _;
    }

    function mintNFT(address receiver) internal returns (uint256, bytes32) {
        require(pivNFTAddress != address(0), "NFT Contract address not set");
        // mint
        PivNFT pivNFTContract = PivNFT(pivNFTAddress);
        (uint256 newTokenId, bytes32 mintedHash) = pivNFTContract.mint(receiver);

        return (newTokenId, mintedHash);
    }
    event NFTMinted(uint256 newTokenId, bytes32 mintedHash);
    function redeemPiv () hasPiv public {
        // redeemed PIV are sent to the owner account
        require(wallets[msg.sender].pivBalance >= NFT_PRICE, "Insufficient balance, should have at least 100 PIV");
        require(ERC20(pivCoinAddress).transfer(owner, NFT_PRICE), "Transfer unsuccessful!");
        // mint NFT and return new nft data (id and hash)
        (uint256 newTokenId, bytes32 mintedHash) = mintNFT(msg.sender);
        // update wallet after mint
        wallets[msg.sender].pivBalance -= NFT_PRICE;
        wallets[msg.sender].burnedNfts[newTokenId].mintedHash = mintedHash;
        wallets[msg.sender].nfts[newTokenId] = WalletNFT(newTokenId, mintedHash, true);
        emit NFTMinted(newTokenId, mintedHash);
    }

    event NFTBurned(uint256 nftId, bytes32 mintedHash, bytes32 burnedHash);
    function redeemNFT (uint256 nftId) hasNFT(nftId) public {
        PivNFT pivNFTContract = PivNFT(pivNFTAddress);
        // burn the NFT and save the burned hash in the user's wallet
        bytes32 mintedHash;
        mintedHash = wallets[msg.sender].nfts[nftId].mintedHash; 

        require(mintedHash!=bytes32(0), "Minted NFT hash not found by nft id! Cannot burn!");

        bytes32 burnedHash = pivNFTContract.burn(msg.sender, nftId, mintedHash);
        emit NFTBurned(nftId, mintedHash, burnedHash);

        require(burnedHash!=bytes32(0), "Burned hash is empty. NFT was probably not burned properly!");
        // update wallet after NFT burn
        wallets[msg.sender].burnedNfts[nftId] = BurnedNFT(nftId, mintedHash, burnedHash);
        delete wallets[msg.sender].nfts[nftId];
    }

    function getUserBalance (address _user) public view returns (uint) {
        require(wallets[_user].pivBalance > 0, 'User does not exist or their balance is zero!');
        return wallets[_user].pivBalance;
    }

    function getMyNFTById (uint nftId) hasNFT(nftId) public view returns (WalletNFT memory nft) {
        return wallets[msg.sender].nfts[nftId];
    }

    function getMyBurnedNFTById (uint nftId) hasBurnedNFT(nftId) public view returns (BurnedNFT memory nft) {
        return wallets[msg.sender].burnedNfts[nftId];
    }
}