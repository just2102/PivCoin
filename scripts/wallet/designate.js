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

    const pivAmount = ethers.utils.parseEther("5.0");
    await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
    await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)

    const newContractBalance = ethers.utils.formatEther(await pivContract.balanceOf(walletAddress))
    console.log('new contract balance: ' + newContractBalance)

    const newUserBalance = ethers.utils.formatEther(await walletContract.getBalance(acc2.address))
    console.log('new user2 balance in piv wallet: ' + newUserBalance)
}









main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})