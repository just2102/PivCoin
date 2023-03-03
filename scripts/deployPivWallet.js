const hre = require("hardhat")
const ethers = hre.ethers

async function deployPivWallet(pivCoinAddress) {
    const [signer] = await ethers.getSigners()

    const PivWallet = await ethers.getContractFactory('PivWallet', signer)

    const pivWallet = await PivWallet.deploy(pivCoinAddress);

    await pivWallet.deployed()

    console.log('pivcoin contract address: ' + pivCoinAddress)
    console.log('pivwallet contract address: ' + pivWallet.address)
}

module.exports = deployPivWallet