const deployPivWallet = require("./deployPivWallet");
const hre = require("hardhat")
const ethers = hre.ethers

let pivCoinAddress;

async function main() {
    const [signer] = await ethers.getSigners()

    const PivCoin = await ethers.getContractFactory('PivCoin', signer)

    const pivCoin = await PivCoin.deploy();

    await pivCoin.deployed()

    await deployPivWallet(pivCoin.address)
}



main().then(() => {
  console.log('Deployment complete!')
}).catch(error => {
  console.error(error)
  process.exit(1)
})