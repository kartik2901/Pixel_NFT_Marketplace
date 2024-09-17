import { ethers } from "hardhat";
import {
  expandTo15Decimals,
  expandTo16Decimals,
  expandTo18Decimals,
  expandTo6Decimals,
} from "../test/utils/utilities";

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
//   let nftAddress = "0xd6Fc8f0c8C8C18cD6c6524F30cA714ea785Cd332";
  let marketplaceAddress = "0x36C2b9D64A45C52F3C785AF8ebC65A029C5f223B";
//   let ownerAddress = "0xC46d483FA31Cd67f93B7158569ACCA8678B1AAf5";
//   let USDCAddress = "0x217B74e122C1771db6521d415ec74dE04437bCCA";
//   let USDTAddress = "0x133f14E5b30BcC50c92fbF3f22c7d6D8f12D9426";
//   let factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
//   let routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
//   let wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
//   //   let getinit: CalHash;

let pairAddress =  "0x147759480D6C706466BdDFA50bEBFbFF41c9CEa2";
let tokenAddress = "0x37fd3f435d5c3Aba53F4f32d1DE722734536C2C4";

    let dabMKT = await ethers.getContractFactory("MarketPlace");
    let DAB = dabMKT.attach(marketplaceAddress);

  let pair = await ethers.getContractFactory("UniswapV2Pair");
  let pairContract =  pair.attach(pairAddress);

  sleep(4000);
  let eth = "0x0000000000000000000000000000000000000001";


    // console.log("Reserves for the weth and dab20",await pairContract.getReserves());
    console.log("get price ",await DAB.getPrice(expandTo18Decimals(1),tokenAddress));


  //   USDC = await new Usdc__factory(owner).deploy();⸻a785Cd332",
//     counter: 58,
//     seller: "0xc46d483fa31cd67f93b7158569acca8678b1aaf5",
//     sharePrice: "1000000000000000000",
//     shareSellAmount: 10,
//     signature:
//       "0x84fa3e1acbaf661f9f48c8056b389a46bba4d9228e9417605552b97678bc97a7023c093de5b90a0e7c1965ba19f395abb68ad23aa720622c541bd5c7940f87c71b",
//     tokenId: 58,
//     tokenUri:
//       "https://ipfs.io/ipfs/QmbvWyisj9J4KwDYdDevLxs3nifd3CL7F8452WNb3nMqwK",
  };

//   await marketplace.buyShare(sellerVoucher, 1, true, eth, {
//     value: expandTo16Decimals(40),
//   });
//   await sleep(5000);

//   console.log("passed");
// }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
