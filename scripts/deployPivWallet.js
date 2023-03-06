const hre = require("hardhat")
const ethers = hre.ethers

async function main(_coinAddress, _nftAddress) {
    const [signer] = await ethers.getSigners()

    const PivWallet = await ethers.getContractFactory('PivWallet', signer)

    const pivWallet = await PivWallet.deploy(_coinAddress, _nftAddress);

    await pivWallet.deployed()

    return pivWallet.address;
}

// main().then(() => {
//   console.log('Deployment complete!')
// }).catch(error => {
//   console.error(error)
//   process.exit(1)
// })

module.exports = main;