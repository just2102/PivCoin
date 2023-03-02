const hre = require("hardhat")
const ethers = hre.ethers

async function main() {
    const [signer] = await ethers.getSigners()

    const PivWallet = await ethers.getContractFactory('PivWallet', signer)

    const pivWallet = await PivWallet.deploy();

    await pivWallet.deployed()

    console.log('pivwallet contract address: ' + pivWallet.address)
}



main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})