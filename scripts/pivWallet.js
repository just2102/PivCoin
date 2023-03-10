const hre = require('hardhat')
const ethers = hre.ethers
const WalletArtifact = require("../artifacts/contracts/PivWallet.sol/PivWallet.json")

async function main() {
    const [acc1, acc2, acc3] = await ethers.getSigners()
    const walletAddress = process.env.PIVWALLET_ADDRESS
    const pivCoinAddress = process.env.PIVCOIN_ADDRESS

    const walletContract = new ethers.Contract(
        walletAddress,
        WalletArtifact.abi,
        acc1
    )
    const pivContract = await ethers.getContractAt("PivCoin", pivCoinAddress)

    const pivAmount = ethers.utils.parseEther("35.0");

}





main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})