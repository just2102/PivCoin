const { expect } = require("chai");
const {ethers} = require("hardhat");

describe("PivCoin", function() {
    let acc1
    let acc2
    let pivContract

    beforeEach(async function() {
        [acc1, acc2] = await ethers.getSigners()
        const PivCoin = await ethers.getContractFactory("PivCoin", acc1)
        pivContract = await PivCoin.deploy()
        await pivContract.deployed()
    })

    it('should be deployed', async () => {
        console.log('piv contract address: ' + pivContract.address)
        console.log('deployed successfully')
    });

    it('should mint 5000 PIV to owner on deploy', async () => {
        const response = await pivContract.balanceOf(acc1.address)
        const responseFormatted = ethers.utils.formatEther(response)
        expect(responseFormatted).to.equal('5000.0')
    })

    it('owner should be able to mint', async() => {
        await pivContract.connect(acc1).mintTo(500, acc2.address) 
        const newBalance = await pivContract.balanceOf(acc2.address)

        const newBalanceFormatted = ethers.utils.formatEther(newBalance)
        expect(newBalanceFormatted).to.equal('500.0')
    })

    it('non-owners should NOT be able to mint', async() => {
        // transaction reverted
        await expect(pivContract.connect(acc2).mintTo(500, acc2.address)).to.be.reverted
    })    
})