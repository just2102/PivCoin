const { expect } = require("chai");
const {ethers} = require("hardhat");


describe("PivWallet", function() {
    let acc1
    let acc2
    let pivContract
    let walletContract

    beforeEach(async function() {
        // deploy coin
        [acc1, acc2] = await ethers.getSigners()
        const PivCoin = await ethers.getContractFactory("PivCoin", acc1)
        pivContract = await PivCoin.deploy()
        await pivContract.deployed();

        // deploy wallet
        [acc1, acc2] = await ethers.getSigners()
        const WalletContract = await ethers.getContractFactory("PivWallet", acc1)
        walletContract = await WalletContract.deploy(pivContract.address)
        await walletContract.deployed()
    })

    it('should be deployed', async () => {
        console.log('PIV contract address: ' + pivContract.address)

        console.log('wallet contract address: ' + walletContract.address)
        console.log('deployed successfully')
    });

    it('should set PIVcoin address in the wallet contract', async() => {
        const response = await walletContract.pivCoinAddress()
        expect(response).to.equal(pivContract.address)
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

    it('piv holder should be able to withdraw their piv', async() => {
        const pivAmount = ethers.utils.parseEther("40.0");
        await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
        await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)

        const holderWalletBeforeRedeem = await walletContract.wallets(acc2.address)
        const holderWalletBeforeRedeemFormatted = ethers.utils.formatEther(holderWalletBeforeRedeem)
        console.log('redeemable acc2 balance (on contract wallet) before redeem: ' + holderWalletBeforeRedeemFormatted)

        // holder redeems
        await walletContract.connect(acc2).redeemPiv(pivAmount)


        // holder wallet should be 0
        const holderWalletAfterRedeem = await walletContract.wallets(acc2.address)
        const holderWalletAfterRedeemFormatted = ethers.utils.formatEther(holderWalletAfterRedeem)
        console.log('redeemable acc2 balance (on contract wallet) after redeem: ' + holderWalletAfterRedeemFormatted)

        // owner balance should increase (back to 5000.0)
        const balance1After = await pivContract.balanceOf(acc1.address)
        const balance1AfterFormatted = ethers.utils.formatEther(balance1After)
        console.log('balance 1 after (PIV): '+ balance1AfterFormatted )
        expect(balance1AfterFormatted).to.equal("5000.0")
    })
})