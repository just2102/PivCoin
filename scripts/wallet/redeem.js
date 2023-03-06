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


    const pivAmount = ethers.utils.parseEther("100.0");

    const contractBalanceBeforeRedeem = ethers.utils.formatEther(await pivContract.balanceOf(walletAddress))
    console.log('Contract balance before redeem: ' + contractBalanceBeforeRedeem)
    
    // redeem
    await walletContract.connect(acc2).redeemPiv(pivAmount, {gasLimit: 300000})

    const contractBalanceAfterRedeem = ethers.utils.formatEther(await pivContract.balanceOf(walletAddress))
    console.log('Contract balance after redeem: ' + contractBalanceAfterRedeem)

}






main()
.then(()=>process.exit(0))
.catch((error)=>{
  console.error(error)
  process.exit(1)
})