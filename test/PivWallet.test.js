const { expect } = require("chai");
const {ethers} = require("hardhat");

describe("PivWallet", function() {
    let acc1
    let acc2
    let acc3
    let pivContract
    let nftContract
    let walletContract

    beforeEach(async function() {
        // deploy coin
        [acc1, acc2, acc3] = await ethers.getSigners()
        const PivCoin = await ethers.getContractFactory("PivCoin", acc1)
        pivContract = await PivCoin.deploy()
        await pivContract.deployed();

        // deploy nft
        const NFTContract = await ethers.getContractFactory("PivNFT", acc1)
        nftContract = await NFTContract.deploy()
        await nftContract.deployed()

        // deploy wallet
        const WalletContract = await ethers.getContractFactory("PivWallet", acc1)
        walletContract = await WalletContract.deploy(pivContract.address, nftContract.address)
        await walletContract.deployed()

        // set wallet address in nft contract
        await nftContract.connect(acc1).setWalletAddress(walletContract.address)
    })

    it('should be deployed', async () => {
        console.log('PIV contract address: ' + pivContract.address)
        console.log('NFT contract address: ' + nftContract.address)
        console.log('wallet contract address: ' + walletContract.address)
        console.log('deployed successfully')
    });
    it('should set PIVcoin address in the wallet contract', async() => {
        const response = await walletContract.pivCoinAddress()
        expect(response).to.equal(pivContract.address)
    })
    it('should set correct NFT address in the wallet contract', async() => {
        const response = await walletContract.pivNFTAddress()
        expect(response).to.equal(nftContract.address)
    })
    it('should set correct wallet address in NFT contract', async() => {
        const response = await nftContract.pivWalletAddress()
        expect(response).to.equal(walletContract.address)
    })

    it('wallet should receive PIV from owner', async() => {
// initial acc1 balance = 5000 (5000.0) PIV (minted on deploy)
        const balance1Before = await pivContract.balanceOf(acc1.address)
        const balance1BeforeFormatted = ethers.utils.formatEther(balance1Before)

        const contractBalanceBeforeFormatted = ethers.utils.formatEther(await pivContract.balanceOf(walletContract.address))

        // owner sends 40 PIV to the contract address and gifts PIV to account 2
        const pivAmount = ethers.utils.parseEther("40.0");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)

// check wallet balances in PIV after transaction
        const balance1After = await pivContract.balanceOf(acc1.address)
        const balance1AfterFormatted = ethers.utils.formatEther(balance1After)
        expect(balance1AfterFormatted).to.equal("4960.0")

        const contractBalanceAfter = await pivContract.balanceOf(walletContract.address)
        const contractBalanceAfterFormatted = ethers.utils.formatEther(contractBalanceAfter)
        expect(contractBalanceAfterFormatted).to.equal("40.0")
    })

    it('owner should be able to designate funds for another wallet', async() => {
        const pivAmount = ethers.utils.parseEther("40.0");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
        await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)

        const receiverWallet = await walletContract.wallets(acc2.address)
        const receiverWalletFormatted = ethers.utils.formatEther(receiverWallet)

        const balance1After = await pivContract.balanceOf(acc1.address)
        const balance1AfterFormatted = ethers.utils.formatEther(balance1After)
        expect(balance1AfterFormatted).to.equal("4960.0")

        expect(receiverWalletFormatted).to.equal("40.0")
    })
// REDEEM
    it('piv holders should be able to redeem their piv (>=100PIV)', async() => {
        const pivAmount = ethers.utils.parseEther("100.0");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
        await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)

        const holderWalletBeforeRedeem = await walletContract.wallets(acc2.address)
        const holderWalletBeforeRedeemFormatted = ethers.utils.formatEther(holderWalletBeforeRedeem)

        // holder redeems
        await walletContract.connect(acc2).redeemPiv()

        // holder wallet should be 0 PIV
        const holderWalletAfterRedeem = await walletContract.wallets(acc2.address)
        const holderWalletAfterRedeemFormatted = ethers.utils.formatEther(holderWalletAfterRedeem)
        expect(holderWalletAfterRedeemFormatted).to.equal("0.0")
        
        // contract balance should be 0 PIV
        const contractBalanceAfterRedeem = await pivContract.balanceOf(walletContract.address)
        const contractBalanceAfterRedeemFormatted = ethers.utils.formatEther(contractBalanceAfterRedeem)
        expect(contractBalanceAfterRedeemFormatted).to.equal("0.0")

        // owner balance should increase (back to 5000.0)
        const ownerBalanceAfterRedeem = await pivContract.balanceOf(acc1.address)
        const ownerBalanceAfterRedeemFormatted = ethers.utils.formatEther(ownerBalanceAfterRedeem)
        expect(ownerBalanceAfterRedeemFormatted).to.equal("5000.0")
    })
    it('throws error if tries to redeem with balance of <100 PIV', async() => {
        const pivAmount = ethers.utils.parseEther("99.5");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
        await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)
        // holder redeems
        await expect(walletContract.connect(acc2).redeemPiv()).to.be.revertedWith('Insufficient balance, should have at least 100 PIV')
    })
// NFT INTERACTION (MINT/BURN)
    it('should award NFT after redeeming 100 PIV', async() => {
        const pivAmount = ethers.utils.parseEther("100.0");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
        await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)
        // holder redeems PIV and receives an nft
        await walletContract.connect(acc2).redeemPiv()

        walletContract.on("NFTMinted", (newTokenId, mintedHash) => {
            console.log(`New NFT minted! ID: ${newTokenId}, Hash: ${mintedHash}`);
        });

        const acc2NFTS = await walletContract.connect(acc2).getMyNFTS()
        expect(acc2NFTS[0].nftId).to.equal('0')
    })
    it('should be able to redeem NFTs, burn them and save them in the wallet', async() => {
        const pivAmount = ethers.utils.parseEther("100.0");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
        await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)
        // holder redeems PIV and receives an nft
        await walletContract.connect(acc2).redeemPiv()
        
        const acc2NFTS = await walletContract.connect(acc2).getMyNFTS()
        const nftToBurn = acc2NFTS[0]
        // holder redeems his NFT and the NFT is burned
        await walletContract.connect(acc2).redeemNFT(nftToBurn.nftId)
        walletContract.on("NFTRedeemed", (nftId, mintedHash, burnedHash) => {
            console.log(`nft id: ${nftId} ; minted hash: ${mintedHash} ; burnedHash: ${burnedHash}`)
        })

        const acc2BurnedNFTS = await walletContract.connect(acc2).getMyBurnedNFTS()
        expect(acc2BurnedNFTS[0].nftId).to.equal(0)

        // successfully removes nft from user wallet

    })

    it('should successfully search NFT by id (among my nfts)', async() => {
        const pivAmount = ethers.utils.parseEther("100.0");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
        await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)
        // holder redeems PIV and receives an nft
        await walletContract.connect(acc2).redeemPiv()

        const firstNFT = await walletContract.connect(acc2).getMyNFTById(0)
        expect(firstNFT.nftId).to.equal('0')
        
        // holder redeems his NFT and the NFT is burned
        await walletContract.connect(acc2).redeemNFT(firstNFT.nftId)

        const firstNFTBurned = await walletContract.connect(acc2).getMyBurnedNFTById(0)
        
    })

    it('should display balance of holders correctly', async() => {
        const pivAmount = ethers.utils.parseEther("80.0");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
        await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)

        const response = await walletContract.wallets(acc2.address)
        const responseFormatted = ethers.utils.formatEther(response)
        expect(responseFormatted).to.equal("80.0")
    })
})