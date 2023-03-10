// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract PivNFT is ERC721 {
    uint256 public tokenCounter;
    address public pivWalletAddress;
    address public owner;

    constructor() ERC721("PivNFT", "PVFT") {
        tokenCounter = 0;
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Permission denied");
        _;
    }
    function setWalletAddress (address newWalletAddress) onlyOwner public {
        pivWalletAddress = newWalletAddress;
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

    modifier onlyPivWallet {
        require(msg.sender==pivWalletAddress);
        _;
    }


    function mint(address receiver) onlyPivWallet public returns (uint256, bytes32) {
        uint256 newTokenId = tokenCounter;

        _safeMint(receiver, newTokenId);
        bytes32 mintedHash = keccak256(abi.encode(newTokenId, block.timestamp, "minted"));
        emit Minted(newTokenId, mintedHash);
        tokenCounter++;

        return (newTokenId, mintedHash);
    }

    function burn(address burner, uint256 tokenId, bytes32 mintedHash) onlyPivWallet public returns(bytes32) {
        require(_exists(tokenId), "NFT does not exist (ERC721)");
        require(_isApprovedOrOwner(burner, tokenId), "No permission or ownership of NFT recorded");
        _burn(tokenId);
        bytes32 burnedHash = keccak256(abi.encodePacked(tokenId, mintedHash, "burned"));
        emit Burned(tokenId, mintedHash, burnedHash);
        return burnedHash;
    }

    event Minted (uint256 indexed tokenId, bytes32 indexed mintedHash);
    event Burned (uint256 indexed tokenId, bytes32 indexed mintedHash, bytes32 indexed burnedHash);
}