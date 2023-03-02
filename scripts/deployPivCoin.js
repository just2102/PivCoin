const hre = require("hardhat")
const ethers = hre.ethers

async function main() {
    const [signer] = await ethers.getSigners()

    const PivCoin = await ethers.getContractFactory('PivCoin', signer)

    const pivCoin = await PivCoin.deploy();

    await pivCoin.deployed()

    console.log('pivcoin contract address: ' + pivCoin.address)
}



main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})