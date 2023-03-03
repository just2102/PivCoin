const { expect } = require("chai");
const {ethers} = require("hardhat");

describe("Payments", function() {
    let acc1
    let acc2
    let payments

    beforeEach(async function() {
        [acc1, acc2] = await ethers.getSigners()
        const Payments = await ethers.getContractFactory("Payments", acc1)
        payments = await Payments.deploy()
        await payments.deployed()
    })

    it('should be deployed', async () => {
        console.log(payments.address)
        console.log('deployed successfully')
    });
    
    it("should have 0 eth by def", async() => {
        const balance = await payments.getContractBalance()
        expect(balance).to.equal(0)
    })

    it('contract should be able to receive funds', async() => {
        // send 5 ETH from sender to contract address
        await acc1.sendTransaction({
            to: payments.address,
            value: ethers.utils.parseEther('5')
        })
        // check the contract balance
        const balance = await payments.getContractBalance()
        expect(balance).to.equal(ethers.utils.parseEther('5'))
        console.log(balance)
    });
    
})