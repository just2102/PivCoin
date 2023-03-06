const hre = require("hardhat")
const ethers = hre.ethers

let holderAddress; 

async function main() {
    const [signer] = await ethers.getSigners()

    const PivNFT = await ethers.getContractFactory('PivNFT', signer)

    const pivNFT = await PivNFT.deploy();

    await pivNFT.deployed()
    
    return pivNFT.address;
}

// main().then(() => {
//   console.log('NFT deployment complete!')
// }).catch(error => {
//   console.error(error)
//   process.exit(1)
// })

module.exports = main;