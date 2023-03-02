const hre = require('hardhat')
const ethers = hre.ethers
require('dotenv').config();
const CoinArtifact = require("../artifacts/contracts/PivCoin.sol/PivCoin.json")

const currentBalance = async(message,address) => {
    const balance = await ethers.provider.balance
    console.log(message, ethers.utils.formatEther(balance))
}

async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const contractAddress = process.env.PIVCOIN_ADDRESS
    const coinContract = new ethers.Contract(
        contractAddress,
        CoinArtifact.abi,
        acc1
    )
    const newBalance = await coinContract.balanceOf(acc2.address)
    console.log('new balance of acc2 after mint: '+ newBalance)
}





main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})