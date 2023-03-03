const hre = require('hardhat')
const ethers = hre.ethers
require('dotenv').config();
const CoinArtifact = require("../artifacts/contracts/PivCoin.sol/PivCoin.json")

const getBalance = async(contract, address) => {
    const balance = await contract.balanceOf(address) 
    const balanceFormatted = ethers.utils.formatEther(balance)
    console.log(`balance of ${address}: ${balanceFormatted}`)
}


async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const contractAddress = process.env.PIVCOIN_ADDRESS
    const coinContract = new ethers.Contract(
        contractAddress,
        CoinArtifact.abi,
        acc1
    )

    await coinContract.connect(acc1).mintTo(500, acc1.address)

    // await getBalance(coinContract, acc2.address)


}

main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})