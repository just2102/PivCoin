const hre = require('hardhat')
const ethers = hre.ethers
const WalletArtifact = require("../../artifacts/contracts/PivWallet.sol/PivWallet.json")

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
      // designation happens in 2 transactions: 
      // 1) transfer of PIV from owner address to wallet address
      // 2) designation
    await pivContract.connect(acc1).transfer(walletContract.address, pivAmount)
    await walletContract.connect(acc1).designatePiv(acc2.address, pivAmount)

    const newContractBalance = await pivContract.balanceOf(walletAddress)
    const newContractBalanceFormatted = ethers.utils.formatEther(newContractBalance)
    console.log('new contract balance: ' + newContractBalanceFormatted)

    const newUserBalance = await walletContract.wallets(acc2.address)
    const newUserBalanceFormatted = ethers.utils.formatEther(newUserBalance)
    console.log('new user2 balance in piv wallet: ' + newUserBalance)
}









main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})