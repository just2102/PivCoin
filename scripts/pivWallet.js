const hre = require('hardhat')
const ethers = hre.ethers
const WalletArtifact = require("../artifacts/contracts/PivWallet.sol/PivWallet.json")


async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const contractAddress = process.env.PIVWALLET_ADDRESS
    const walletContract = new ethers.Contract(
        contractAddress,
        WalletArtifact.abi,
        acc1
    )
    
    const receiveResult = await walletContract.receivePiv();
    console.log(receiveResult)
}





main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})