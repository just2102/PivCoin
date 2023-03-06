const deployCoin = require("./deployPivCoin");
const deployNFT = require("./deployNFT");
const deployWallet = require("./deployPivWallet");

async function main() {
  const [acc1, acc2, acc3] = await ethers.getSigners()

  const _coinAddress = await deployCoin();
  console.log('PIV coin deployment complete on '+ _coinAddress);

  const _nftAddress = await deployNFT();
  console.log('NFT deployment complete on ' + _nftAddress);

  const walletAddress = await deployWallet(_coinAddress, _nftAddress);
  console.log('Wallet deployment complete on ' + walletAddress);

  // set wallet address in nft contract
  const nftContract = await ethers.getContractAt("PivNFT", _coinAddress)
  await nftContract.setWalletAddress(walletAddress)
}

main()
.then(() => {
console.log('Coin, nft and wallet successfully deployed!');
})
.catch(error => {
console.error(error);
process.exit(1);
});