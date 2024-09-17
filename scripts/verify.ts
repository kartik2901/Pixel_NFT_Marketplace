const hre = require("hardhat");
import {
  expandTo18Decimals,
  expandTo6Decimals,
} from "../test/utils/utilities";
import { contracts } from "../typechain-types";

async function main() {
  console.log("after");
let owner = "0xC46d483FA31Cd67f93B7158569ACCA8678B1AAf5";
let factory = "0x5B7E8D1b028f830b58fC7Cf059B71FE350D4f850"
let weth = "0x96F10614c32bD6dCc2a8e5Fe71cAd70057659d8B"
  // await hre.run("verify:verify", {
  //   address: "0x3e136A9e746481937a6Da058178c9c244C5F2d5f",
  //   constructorArguments: [],
  //   contract: "contracts/USDC.sol:Usdc",
  // });

  // await hre.run("verify:verify", {
  //   address: "0x7B17CF011d42e19265494Fa5feBabd6f3AA383c2",
  //   constructorArguments: [],
  //   contract: "contracts/USDT.sol:Usdt",
  // });

  // await hre.run("verify:verify", {
  //   address: "0xb34857DDE26739724878707c0D677E79B5aB73D4",
  //   constructorArguments: [],
  //   contract: "contracts/WBTC.sol:WrappedBTC",
  // });
  // // Dabbler 0x5FbDB2315678afecb367f032d93F642f64180aa3
  // // mkt address  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512


  // await hre.run("verify:verify", {
  //   address: "0x298E0b29C9987Ab77f6981be319324530be306E3",
  //   constructorArguments: [],
  //   contract: "contracts/Dabbler.sol:Dabbler",
  // });

  await hre.run("verify:verify", {
    address: "0x3310225Fc66f7A3e2E1EAfd19900F0868B3dDCDc",
    constructorArguments: [],
    contract: "contracts/MarketPlace.sol:MarketPlace",
  });

  // await hre.run("verify:verify", {
  //   address: "0xc4f3534D82e57A7BBA2243a205bE742225Ff2c32",//marketplace proxy
  //   constructorArguments: [],
  //   contract: "contracts/upgradeability/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  // });

  // await hre.run("verify:verify", {
  //   address: "0x38Db8fE50978bAd35C1e7c53AE0728D37Fdc01b7",//NFT proxy
  //   constructorArguments: [],
  //   contract: "contracts/upgradeability/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  // });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  // QA contracts
  // Marketplace: 0x42F794AAC9Ac1c64425750706575d7f902d4AAd5
  // NFT:0x04a53fC902d02C2dC04B9454D080eA1D30A710aB
  // MktProxy:0x36C2b9D64A45C52F3C785AF8ebC65A029C5f223B
  // NFTProxy:0xaa05e3C0Cb0eE421afbFB553979FA2d8f929d110

  // Stage contracts
  // Marketplace:0xb65024060cEeb4731696FEcA52590d3579313216 
  // NFT:0x10BF347C86Af536D621D9B67fa5b75981b20dF5D
