import { Dabbler } from './../typechain-types/contracts/Dabbler';
import { MarketPlace } from './../typechain-types/contracts/MarketPlace';

import { SignerWithAddress } from "../node_modules/@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import {
  expandTo18Decimals,
  expandTo6Decimals,
} from "../test/utils/utilities";

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
let owner = "0xC46d483FA31Cd67f93B7158569ACCA8678B1AAf5"
async function main() {
  // We get the contract to deploy
  // const usdc = await ethers.getContractFactory("Usdc");
  // const USDC = await usdc.deploy();
  // await sleep(4000);
  // console.log("usdc", USDC.address);

  // const usdt = await ethers.getContractFactory("Usdt")
  // const USDT = await usdt.deploy();
  // await sleep(4000);
  // console.log("usdt", USDT.address);

  // const test = await ethers.getContractFactory("WrappedBTC")
  // const TEST = await test.deploy();
  // await TEST.deployed();
  // await sleep(4000);
  // console.log("WBTC", TEST.address);


  // const DabNFT = await ethers.getContractFactory("Dabbler");
  // const dab = await DabNFT.deploy();
  // await sleep(4000);
  // console.log("Dabbler", dab.address);


  const MarketPlace = await ethers.getContractFactory("MarketPlace");
  const MKT = await MarketPlace.deploy();
  await sleep(4000);
  console.log("mkt address " , MKT.address);

  

  // const CNFT = await ethers.getContractFactory("ChronNFT");
  // const NFT = await CNFT.deploy();
  // await sleep(4000);
  // console.log("NFT Deployed", NFT.address);

  // const upgradeability = await ethers.getContractFactory(
  //   "OwnedUpgradeabilityProxy"
  // );
  // const proxy = await upgradeability.deploy();
  // await sleep(4000);
  // const proxy2 = await upgradeability.deploy();
  // await sleep(4000);
//   console.log("Proxy deployed", proxy.address);
//   console.log("Proxy2 deployed", proxy2.address);

//   await proxy.upgradeTo(MKT.address);
//   await sleep(3000);
//   console.log("______________________");
//   await sleep(3000);
  // await proxy2.upgradeTo(dab.address);
  // await sleep(3000);
  // console.log("upgradeTo done");

//   await sleep(5000);
//   let Proxy1 = await MarketPlace.attach(proxy.address);
//   console.log(Proxy1.address, "Proxy1");
  // await sleep(5000);
  // let Proxy2 = await DabNFT.attach(proxy2.address);
  // console.log(Proxy2.address, "Proxy2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
