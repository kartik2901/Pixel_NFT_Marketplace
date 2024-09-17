import { Dabb20 } from './../typechain-types/contracts/Dabb20';
import { buyEventObject } from './../typechain-types/contracts/interface/Events';
// import { AddressZero } from 'ethers/';

import { IUniswapV2Router02 } from './../typechain-types/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02';

import { TransferNFTEvent } from './../typechain-types/contracts/MarketPlace';
import { GetARGsTypeFromFactory } from './../typechain-types/common';
import { NoRoyalty } from "./../typechain-types/contracts/NoRoyalty";
import { CalHash, CalHash__factory, IUniswapV2Factory , IUniswapV2Factory__factory  } from "./../typechain-types";


import { UniswapV2Router02 } from './../typechain-types';
import { UniswapV2Router02__factory } from './../typechain-types';
import { WETHToken, WETHToken__factory } from './../typechain-types';
// import { WETH9, WETH9__factory } from './../typechain-types';
import {UniswapV2Factory, UniswapV2Factory__factory, UniswapV2ERC20 , UniswapV2ERC20__factory , UniswapV2Pair, UniswapV2Pair__factory } from './../typechain-types';


const { expect } = require("chai");

import { ethers } from "hardhat";
import {
  Dabbler,
  MarketPlace,
  Dabbler__factory,
  MarketPlace__factory,
  NoRoyalty__factory,

  
} from "../typechain-types";
import { Dabb20 } from "../typechain-types/contracts/Dabb20";
import { Tabb20, Tabb20__factory } from './../typechain-types';
import { Dabb20__factory } from "../typechain-types/factories/contracts/Dabb20__factory";
import helper2 from "./utils/helper2";
import helper3 from "./utils/helper3";

import { expandTo16Decimals, expandTo18Decimals, expandTo6Decimals } from "./utils/utilities";
import orderhash from './utils/helper';
import { tab20Sol } from '../typechain-types/contracts';

describe("Dabbler", async() => {
  let marketPlace: MarketPlace;
  let DabblerNFT: Dabbler;
  let Dabb20: Dabb20;
  let Tabb20 : Tabb20;
  let WETHtoken : WETHToken
  //let UniV2 : IUniswapV2Factory;
  let noRoyalty: NoRoyalty;
  let owner: any;
  let signers: any;
  let alice: any;
  let bob: any;
  let tom: any;;
  let nick: any;
  let harry: any;
  let init: CalHash

  let address1: any;



   let factory : UniswapV2Factory;
   let router02 : UniswapV2Router02 ;
  

  beforeEach(async () => {
    signers = await ethers.getSigners();
    (owner = signers[0]),
      (alice = signers[1]),
      (bob = signers[2]),
      (tom = signers[3]),
      (nick = signers[4]),
      (harry = signers[5]);

    DabblerNFT = await new Dabbler__factory(owner).deploy();
    marketPlace = await new MarketPlace__factory(owner).deploy();
    Dabb20 = await new Dabb20__factory(owner).deploy();
    Tabb20 = await new Tabb20__factory(owner).deploy();
    init = await new CalHash__factory(owner).deploy()
    address1= "0x0000000000000000000000000000000000000001"
    noRoyalty = await new NoRoyalty__factory(owner).deploy();

    factory = await new UniswapV2Factory__factory(owner).deploy(owner.address);
    WETHtoken = await new WETHToken__factory(owner).deploy();
    router02 = await new UniswapV2Router02__factory(owner).deploy(factory.address,WETHtoken.address);
    //Stoken = await new SwapToken__factory(owner).deploy(router02.address,weth.address);



    console.log("Contracts are deployed", await init.getInitHash());
    

    await DabblerNFT.connect(owner).initialize(
      "token__URI",
      marketPlace.address,
      Dabb20.address,
      owner.address
    );

  //  await marketPlace.connect(owner).initialize(DabblerNFT.address);
    await marketPlace.connect(owner).initialize(DabblerNFT.address, 500, router02.address,factory.address);
    await Dabb20.connect(owner).Initialize();
    await noRoyalty.connect(owner).initialize("baseURI");


    
  
  });

  describe("ERC : 1155 ", function () 
  {
    it("balanceOf ||  it should update the balance of user ", async () => {
      const recipient = alice.address;
      const id = 1;
      const amount = 2;
      const data = "0x123456";

      await DabblerNFT.connect(owner).safeMint(recipient, id, amount, data);
      expect(await DabblerNFT.balanceOf(alice.address, id)).to.be.equal(2);
    });

    it("balance of batch  ++ || it should return correct balance of batch ", async () => {
      const recipient = alice.address;
      const id = 1;
      const amount = 1;
      const data = "0x123456";

      await DabblerNFT.connect(owner).safeMint(recipient, id, amount, data);
      await DabblerNFT.connect(owner).safeMint(recipient, 2, 4, data);

      const recepient2 = bob.address;
      await DabblerNFT.connect(owner).safeMint(recepient2, 1, 4, data);

      const balances = await DabblerNFT.balanceOfBatch(
        [alice.address, alice.address, bob.address],
        [1, 2, 1]
      );

      const expectedBalances = [1, 4, 4];
      const actualBalances = balances.map((balance) => balance.toNumber());

      expect(actualBalances).to.deep.equal(expectedBalances);
    });

    it("setApprovalforAll || it should set approval for all", async () => {
      const recipient = alice.address;
      const id = 1;
      const amount = 1;
      const data = "0x123456";

      await DabblerNFT.safeMint(recipient, id, amount, data);
      await DabblerNFT.safeMint(recipient, 2, 4, data);

      await DabblerNFT.connect(alice).setApprovalForAll(bob.address, true);

      expect(
        await DabblerNFT.connect(bob).isApprovedForAll(
          alice.address,
          bob.address
        )
      ).to.be.equal(true);
    });

    it("setApprovalforAll || it shuld not set approval for self", async () => {
      const recipient = alice.address;
      const id = 1;
      const amount = 1;
      const data = "0x123456";

      await DabblerNFT.safeMint(recipient, id, amount, data);
      await DabblerNFT.safeMint(recipient, 2, 4, data);

      await expect(
        DabblerNFT.connect(alice).setApprovalForAll(alice.address, true)
      ).to.be.revertedWith("ERC1155: setting approval status for self");
    });

    it("safeTransferFrom || it should be able to transfer  nft after approval", async () => {
      const recipient = alice.address;
      const id = 1;
      const amount = 1;
      const data = "0x123456";
      const data2 = "0x22e2d6";

      await DabblerNFT.safeMint(recipient, id, amount, data);
      await DabblerNFT.safeMint(recipient, 2, 4, data2);

      await DabblerNFT.connect(alice).setApprovalForAll(bob.address, true);

      await DabblerNFT.connect(bob).safeTransferFrom(
        alice.address,
        owner.address,
        id,
        amount,
        data
      );

      expect(
        await DabblerNFT.connect(owner).balanceOf(owner.address, id)
      ).to.be.equal(1);
    });

    it("safeTransferFrom || it should not transfer to zero address", async () => {
      const recipient = alice.address;
      const id = 1;
      const amount = 1;
      const data = "0x123456";
      const data2 = "0x22e2d6";

      await DabblerNFT.safeMint(recipient, id, amount, data);
      await DabblerNFT.safeMint(recipient, 2, 4, data2);

      await DabblerNFT.connect(alice).setApprovalForAll(bob.address, true);

      expect(
        await DabblerNFT.connect(bob).safeTransferFrom(
          alice.address,
          owner.address,
          id,
          amount,
          data
        )
      ).to.be.revertedWith("ERC1155: transfer to the zero address");
    });

    it("safeTanferFrom || it should not tranfer if called it not the token owner or approved  ", async () => {
      const recipient = alice.address;
      const id = 1;
      const amount = 1;
      const data = "0x123456";
      const data2 = "0x22e2d6";

      await DabblerNFT.connect(owner).safeMint(recipient, id, amount, data);
      await DabblerNFT.connect(owner).safeMint(recipient, 2, 4, data2);

      await DabblerNFT.connect(owner).setApprovalForAll(bob.address, true);

      await expect(
        DabblerNFT.connect(alice).safeTransferFrom(
          owner.address,
          alice.address,
          id,
          amount,
          data
        )
      ).to.be.revertedWith("ERC1155: caller is not token owner or approved");
    });

    it("SafeTranserFrom || There should be sufficient balance for transfer ", async () => {
      const recipient = alice.address;
      const id = 1;
      const amount = 1;
      const data = "0x123456";
      const data2 = "0x22e2d6";

      await DabblerNFT.safeMint(recipient, id, amount, data);
      await DabblerNFT.safeMint(recipient, 2, 4, data2);

      await DabblerNFT.connect(alice).setApprovalForAll(bob.address, true);

      await expect(
        DabblerNFT.connect(bob).safeTransferFrom(
          alice.address,
          owner.address,
          id,
          11,
          data
        )
      ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
    });

    it("SafeBatchTransferFrom || it should transfer batch of nft's ", async () => {
      await DabblerNFT.connect(owner).safeMint(owner.address, 1, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 2, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 6, 3, "0x124214");

      await DabblerNFT.connect(owner).safeBatchTransferFrom(
        owner.address,
        bob.address,
        [1, 2, 6],
        [4, 4, 3],
        "0x124214"
      );

      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 1)
      ).to.be.equal(4);
      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 2)
      ).to.be.equal(4);
      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 6)
      ).to.be.equal(3);
    });

    it("SafeBatchTransferFrom || it should not transfer if caller is not the owner or approved ", async () => {
      await DabblerNFT.connect(owner).safeMint(owner.address, 1, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 2, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 6, 3, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 1, 4, "0x124214");

      await DabblerNFT.connect(owner).setApprovalForAll(alice.address, true);
      await expect(
        DabblerNFT.connect(bob).safeBatchTransferFrom(
          owner.address,
          bob.address,
          [1, 2, 6],
          [4, 4, 3],
          "0x124214"
        )
      ).to.be.revertedWith("ERC1155: caller is not token owner or approved");
    });

    it("SafeBatchTransferFrom || ids and amount length should be same", async () => {
      await DabblerNFT.connect(owner).safeMint(owner.address, 1, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 2, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 6, 3, "0x124214");

      await expect(
        DabblerNFT.connect(owner).safeBatchTransferFrom(
          owner.address,
          bob.address,
          [1, 2, 6],
          [4, 4, 3, 4, 5],
          "0x124214"
        )
      ).to.be.revertedWith("ERC1155: ids and amounts length mismatch");
    });

    it("SafeBatchTransferFrom || it should not transfer to zero address ", async () => {
      await DabblerNFT.connect(owner).safeMint(owner.address, 1, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 2, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 6, 3, "0x124214");

      await expect(
        DabblerNFT.connect(owner).safeBatchTransferFrom(
          owner.address,
          ethers.constants.AddressZero,
          [1, 2, 6],
          [4, 4, 3],
          "0x124214"
        )
      ).to.be.revertedWith("ERC1155: transfer to the zero address");
    });

    it("SafeBatchTransferFrom || There should be sufficient balance for transfer ", async () => {
      await DabblerNFT.connect(owner).safeMint(owner.address, 1, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 2, 4, "0x124214");
      await DabblerNFT.connect(owner).safeMint(owner.address, 6, 3, "0x124214");

      await expect(
        DabblerNFT.connect(owner).safeBatchTransferFrom(
          owner.address,
          alice.address,
          [1, 2, 6],
          [4, 7, 3],
          "0x124214"
        )
      ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
    });

    it("mint || it should not mint to zero address", async () => {
      await expect(
        DabblerNFT.connect(owner).safeMint(
          ethers.constants.AddressZero,
          6,
          3,
          "0x124214"
        )
      ).to.be.revertedWith("ERC1155: mint to the zero address");
    });

  });


   
  

    describe("NFT TOKEN DEVELOPMENT ", function () 
    {
      it("It should mint the token with specified details", async () => {
        const recipient = tom.address;
        const id = 1;
        const amount = 1;
        const data = "0x123456";

        await DabblerNFT.safeMint(recipient, id, amount, data);
        expect(await DabblerNFT.balanceOf(tom.address, id)).to.be.equal(1);
      });



      it("it should revert if called by a non-ower", async () => {
        const recipient = alice.address;
        const id = 1;
        const amount = 1;
        const data = "0x123456";

        await expect(
          DabblerNFT.connect(alice).safeMint(recipient, id, amount, data)
        ).to.be.revertedWith("invalid caller");
      });

      //FUNCTION = PRICE LISTING HASH
      it("It should generate the hash correctly", async () => {
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          50,
          2,
          10,
          1,
          20,
          true,
          "www.hello.com"
        );
      });

      //lazy minting

      it("it should create a valid voucher", async () => {
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5, //amount 
          1, //tokenID
          10, // PPR
          1, //COUNTER
          250, //ROUALTYFEE
          true, //ISPRIMARY 
          "www.hello.com" //URI
        );

        let data = await marketPlace.priListingVerify(voucherData);
        expect(data).to.be.equal(owner.address);
      });
    

    //BUY FUNCTION TEST

    it("it should buy NFT with ETHER", async () => {
      const helperclass2 = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass2.createVoucher(
        DabblerNFT.address,
        owner.address,
        5,
        2,
        expandTo18Decimals(10),
        9,
        20,
        true,
        "hello.com"
      );

      const currency = "0x0000000000000000000000000000000000000001";

      await marketPlace
        .connect(bob)
        .buy(voucherData, 5,4565, currency, { value: expandTo18Decimals(60) });

        // await expect( marketPlace
        // .connect(bob)
        // .buy(voucherData, 5, currency, { value: expandTo18Decimals(60) })).to.emit(marketPlace, 'TransferNFT').withArgs(owner.address , bob.address , 2 ,"47500000000000000000");
    });

    it("It should revert when buying from Invalid NFT Address ", async () => {
      const helperclass = new helper2({
        _contract: DabblerNFT,
        _signer: owner,
      });

      let voucherData = await helperclass.createVoucher(
        ethers.constants.AddressZero,
        owner.address,
        500,
        2,
        10,
        1,
        250,
        true,
        "www.hello.com"
      );
      const currency = "0x0000000000000000000000000000000000000001";
      await expect(
        marketPlace.connect(bob).buy(voucherData, 6,989898, currency, {
          value: voucherData.pricePerShare * 6,
        })
      ).to.be.revertedWith("INA");
    });

    it("it should be a valid voucher", async () => {
      const helperclass = new helper2({
        _contract: DabblerNFT,
        _signer: alice,
      });

      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        alice.address,
        5,
        2,
        10,
        1,
        250,
        true,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(10));
      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(10)
      );
      await expect(
        marketPlace.connect(bob).buy(voucherData, 5,7575745, Dabb20.address)
      ).to.be.revertedWith("IV");
    });

    it("Buyer should have sufficient balance", async () => {


    await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );


      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });

      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        10, //amount
        2,
        expandTo18Decimals(2), //pps
        1,
        250,
        true,
        "www.hello.com"
      );

      const hashV = await marketPlace.priListingVerify(voucherData);

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(7)
      );

      const price = voucherData.pricePerShare * 4;

      await expect(
        marketPlace.connect(bob).buy(voucherData, 4,5454545, Dabb20.address)
      ).to.be.revertedWith("IB");

    });

    it("it should transfer the token to the buyer ", async () => {
  
     // const currency = "0x0000000000000000000000000000000000000001";


     await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
     await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
     await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
     await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
   
     await router02.connect(signers[8]).addLiquidityETH(
       Dabb20.address,
       expandTo18Decimals(10000),
       expandTo18Decimals(3000),
       expandTo18Decimals(1000),
       signers[8].address,
       1714521599,
       {value : expandTo18Decimals(3000)}
     );      
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        10,
        2,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(14));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(14)
      );

      await marketPlace.connect(bob).buy(voucherData, 2,18271817, Dabb20.address);

      //await marketPlace.connect(bob).buy(voucherData , 2 , currency , {value : expandTo18Decimals(30)});

      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 2)
      ).to.be.equal(2);
    });

    //----------------------------SECONDARY BUY-------------------------------------------

    it("is primary false || secondary buy ", async () => {

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
      //primary buy
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        false,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(42)
      );

      await marketPlace.connect(bob).buy(voucherData, 2,475945, Dabb20.address);

      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
      ).to.be.equal(2);

      await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(alice).approve(
        marketPlace.address,
        expandTo18Decimals(42)
      );

      await marketPlace.connect(alice).buy(voucherData2, 1,47945, Dabb20.address);
      expect(
        await DabblerNFT.connect(alice).balanceOf(alice.address, 3)
      ).to.be.equal(1);
    });

    it("isprimary false || secondary buy || insufficient Balance", async () => {

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );


      //primary buy
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3, // Amount
        2, //tokenID
        expandTo18Decimals(2), //pps
        1,
        15,
        true,
        "www.hello.com"
      );

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3, // amount
        2, //ID
        expandTo18Decimals(2), //PPS
        2,
        15,
        false,
        "www.hello.com"
      );

      //primary Buy done

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(65)
      );

   
      await marketPlace.connect(bob).buy(voucherData, 3,17543945, Dabb20.address);

      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 2)
      ).to.be.equal(3);

      //Secondary buy with alice

      await Dabb20.connect(alice).mintdabb(expandTo18Decimals(10));

      await Dabb20.connect(alice).approve(
        marketPlace.address,
        expandTo18Decimals(10)
      );
      await expect(marketPlace.connect(alice).buy(voucherData2, 1,475445, Dabb20.address)).to.be.revertedWith("IB");
    });

    it("isprimary false|| secondary buy || insufficient amount", async () => {
      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
      //primary buy
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        2,
        250,
        false,
        "www.hello.com"
      );

      //primary Buy done

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(65)
      );

      await marketPlace.connect(bob).buy(voucherData, 3,475, Dabb20.address);

      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
      ).to.be.equal(3);

      await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(alice).approve(
        marketPlace.address,
        expandTo18Decimals(65)
      );

      await expect(
        marketPlace.connect(alice).buy(voucherData2, 3,945, Dabb20.address)
      ).to.be.revertedWith("IB");
    });

    it(" secondary buy || insufficient amount", async () => {

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      const currency = "0x0000000000000000000000000000000000000001";

      const helperclass2 = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclass2.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        2,
        250,
        false,
        "www.hello.com"
      );


      await marketPlace
        .connect(bob)
        .buy(voucherData, 3,47, currency, { value: expandTo18Decimals(7) });


      await expect(
        marketPlace
          .connect(alice)
          .buy(voucherData2, 3,445, currency, { value: expandTo18Decimals(1) })
      ).to.be.revertedWith("IA");

    });

    //----------------------------------------------------------------------------------------------

    //++++++++++++++++++++++++++++++++++ETHEREUM  TOKEN++++++++++++++++++++++++++++++++++++++++

    it(" secondary buy || it should revert IA when msg.value is insufficient", async () => {

      //primary buy
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        2,
        250,
        false,
        "www.hello.com"
      );
      const currency = "0x0000000000000000000000000000000000000001";
      // Primary buy function
      await marketPlace
        .connect(bob)
        .buy(voucherData, 3,1235, currency, { value: expandTo18Decimals(8) });
      // Secondary buy function
      await expect(
        marketPlace
          .connect(alice)
          .buy(voucherData2, 3,4754334945, currency, { value: expandTo18Decimals(2) })
      ).to.be.revertedWith("IA");
    });

    it("primary buy || insufficient amount || ETH ", async () => {
      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclasss.createVoucher(
        DabblerNFT.address,
        owner.address,
        3, // amount
        3, //tokenId
        expandTo18Decimals(2), //pps
        1,
        25,
        true,
        "www.hello.com"
      );

      const currency = "0x0000000000000000000000000000000000000001";

      await expect(
        marketPlace
          .connect(alice)
          .buy(voucherData, 3,47545645, currency, { value: expandTo18Decimals(2) })
      ).to.be.revertedWith("IA");
    });
  
  });



    describe("DabblerNFT ", async () => 
    {

      it("Verify Offer listing should return correct hash || ETH", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5,
          2,
          expandTo18Decimals(2),
          1,
          5,
          true,
          "www.hello.com"
        );

        const currency = "0x0000000000000000000000000000000000000001";

        await marketPlace
          .connect(bob)
          .buy(voucherData, 3,45, currency, { value: expandTo18Decimals(10) });

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          1,
          2,
          alice.address,
          owner.address,
          expandTo18Decimals(4),
          2
        );

        expect(await DabblerNFT.verifyOfferListing(offerData)).to.be.equal(
          alice.address
        );
      });

      it("OfferLisintingHash || it should crate a valid offer || DABB20 ", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5,
          2,
          expandTo18Decimals(2),
          1,
          5,
          true,
          "www.hello.com"
        );

        const currency = "0x0000000000000000000000000000000000000001";

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,545, Dabb20.address);

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          1,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(8),
          0
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );

        await DabblerNFT.connect(alice).placeOffer(offerData, true);
      });

      it("it should not place offer it token ID is invalid", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5,
          2,
          expandTo18Decimals(2),
          1,
          5,
          true,
          "www.hello.com"
        );

        const currency = "0x0000000000000000000000000000000000000001";

        await marketPlace
          .connect(bob)
          .buy(voucherData, 3,4, currency, { value: expandTo18Decimals(13) });

        const offerClass = new helper3({ _contract: DabblerNFT, _signer: bob });

        let offerData = await offerClass.createOffer(
          1,
          0,
          bob.address,
          owner.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          DabblerNFT.address,
          expandTo18Decimals(9)
        );

        await expect(
          DabblerNFT.connect(bob).placeOffer(offerData, true)
        ).to.be.revertedWith("IT");
      });

      it("place offer || Single || insufficient NFT Balance ||Dabb20", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5,
          2,
          expandTo18Decimals(2),
          1,
          5,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(112));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(112)
        );
        await marketPlace.connect(bob).buy(voucherData, 5,56, Dabb20.address);

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          1,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          20
        );
        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(112));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(112)
        );
        await expect(
          DabblerNFT.connect(alice).placeOffer(offerData, false)
        ).to.be.revertedWith("INB");
      });

      it("it should return invalid offerer if offer is made by an invalid address", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5,
          2,
          expandTo18Decimals(2),
          1,
          5,
          true,
          "www.hello.com"
        );

        const currency = "0x0000000000000000000000000000000000000001";

        await marketPlace
          .connect(bob)
          .buy(voucherData, 3,456, currency, { value: expandTo18Decimals(13) });

        const offerClass = new helper3({ _contract: DabblerNFT, _signer: bob });

        const invalidAdd = "0x12414141254";
        let offerData = await offerClass.createOffer(
          1,
          2,
          ethers.constants.AddressZero,
          owner.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          DabblerNFT.address,
          expandTo18Decimals(9)
        );

        await expect(
          DabblerNFT.connect(bob).placeOffer(offerData, true)
        ).to.be.revertedWith("IO");
      });

      it("Buyer can place offer for single NFT", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5,
          2,
          expandTo18Decimals(2),
          1,
          5,
          true,
          "www.hello.com"
        );

        const currency = "0x0000000000000000000000000000000000000001";

        await marketPlace
          .connect(bob)
          .buy(voucherData, 3,4745, currency, { value: expandTo18Decimals(13) });

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          1,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          1
        );
        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          DabblerNFT.address,
          expandTo18Decimals(9)
        );
        await DabblerNFT.connect(bob).placeOffer(offerData, false);
      });

      //REFUND

      it("Refund || is Global ||  it should not refund invalid token ID || ", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5,
          2,
          expandTo18Decimals(2),
          1,
          5,
          true,
          "www.hello.com"
        );

        const currency = "0x0000000000000000000000000000000000000001";

        await marketPlace
          .connect(bob)
          .buy(voucherData, 3,47, currency, { value: expandTo18Decimals(13) });

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          1,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          DabblerNFT.address,
          expandTo18Decimals(9)
        );
        await DabblerNFT.connect(bob).placeOffer(offerData, false);

        await expect(
          DabblerNFT.connect(bob).refund(0, offerData.offernumber, true)
        ).to.be.revertedWith("IT");
      });

      it("Refund || is Global ||  invalid offer number || ETH", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          5,
          2,
          expandTo18Decimals(2),
          1,
          5,
          true,
          "www.hello.com"
        );

        const currency = "0x0000000000000000000000000000000000000001";

        await marketPlace
          .connect(bob)
          .buy(voucherData, 3,945, currency, { value: expandTo18Decimals(13) });

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          0,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          DabblerNFT.address,
          expandTo18Decimals(9)
        );
        await DabblerNFT.connect(bob).placeOffer(offerData, false);

        await expect(
          DabblerNFT.connect(bob).refund(2, offerData.offernumber, true)
        ).to.be.revertedWith("ION");
      });

      it("it should refund the amout || IsGlobal", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });

        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2, // AMOUNT
          2, //ID
          expandTo18Decimals(2), //PPS
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,678, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        const initialBalace = await Dabb20.connect(alice).balanceOf(
          alice.address
        );

        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await DabblerNFT.connect(alice).refund(
          offerData.tokenId,
          offerData.offernumber,
          true
        );
        expect(
          await Dabb20.connect(alice).balanceOf(alice.address)
        ).to.be.equal(expandTo18Decimals(65));
      });

      it("Refund || Single || invalid offer number", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );

        await marketPlace.connect(bob).buy(voucherData, 2,567, Dabb20.address);

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          0,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          DabblerNFT.address,
          expandTo18Decimals(9)
        );
        await DabblerNFT.connect(bob).placeOffer(offerData, false);
        await DabblerNFT.connect(bob).refund(
          offerData.tokenId,
          offerData.offernumber,
          false
        );
        await expect(
          DabblerNFT.connect(bob).refund(
            offerData.tokenId,
            offerData.offernumber,
            false
          )
        ).to.be.revertedWith("ION");
      });

      it("Refund || Global || invalid offer number", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );

        await marketPlace.connect(bob).buy(voucherData, 2,4789, Dabb20.address);

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          0,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));

        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );

        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await DabblerNFT.connect(alice).refund(
          offerData.tokenId,
          offerData.offernumber,
          true
        );
        await expect(
          DabblerNFT.connect(alice).refund(
            offerData.tokenId,
            offerData.offernumber,
            true
          )
        ).to.be.revertedWith("ION");
      });

      it("Refund || Single || Amount is refunded", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );

        await marketPlace.connect(bob).buy(voucherData, 2,89, Dabb20.address);

        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          DabblerNFT.address,
          expandTo18Decimals(9)
        );
        await DabblerNFT.connect(bob).placeOffer(offerData, false);

        await DabblerNFT.connect(bob).refund(
          offerData.tokenId,
          offerData.offernumber,
          false
        );
      });

      //ACCEPT OFFER

      it("Accept Offer || Single " , async () =>{

        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );
          const helperclass = new helper2({
            _contract: marketPlace,
            _signer: owner,
          });
          let voucherData = await helperclass.createVoucher(
            DabblerNFT.address,
            owner.address,
            2,
            2,
            expandTo18Decimals(2),
            1,
            2,
            true,
            "www.hello.com"
          );
  
          await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
          await Dabb20.connect(bob).approve(
            marketPlace.address,
            expandTo18Decimals(65)
          );
          await marketPlace.connect(bob).buy(voucherData, 2,589, Dabb20.address);

          //Place Offer
          const offerClass = new helper3({
            _contract: DabblerNFT,
            _signer: alice,
          });
  
          let offerData = await offerClass.createOffer(
            3,
            2,
            alice.address,
            bob.address,
            expandTo18Decimals(4),
            2
          );









      })

      it("Accept Offer ||  Invalid Offer Maker || global", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,50, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          owner.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await expect(
          DabblerNFT.connect(bob).acceptOffer(offerData3, true)
        ).to.be.revertedWith("IO");
      });

      it("Accept Offer || global", async () => {
      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,589, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await DabblerNFT.connect(bob).acceptOffer(offerData3, true);
      });


      it("Accept Offer || Invalid Offer Accepter || Single", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,489, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          alice.address,
          owner.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, false);

        await expect(
          DabblerNFT.connect(bob).acceptOffer(offerData3, false)
        ).to.be.revertedWith("IA");
      });

      it("Accept Offer || Insufficient NFT Amount || global", async () => {
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,767, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(2),
          2
        );
        // let offerData3 = await offerClass.createOffer(
        //   3,
        //   2,
        //   alice.address,
        //   bob.address,
        //   expandTo18Decimals(2),
        //   2
        // );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, false);

        await DabblerNFT.connect(bob).acceptOffer(offerData, false);

        await expect(
          DabblerNFT.connect(bob).acceptOffer(offerData, false)
        ).to.be.revertedWith("INA");
       });
    


    it("lazy Mint  || Error : Invalid caller ", async () => {
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        2,
        2,
        expandTo18Decimals(2),
        1,
        2,
        true,
        "www.hello.com"
      );

      await expect(
        DabblerNFT.connect(alice).lazyMint(
          voucherData.tokenId,
          voucherData.amount,
          voucherData.seller,
          alice.address,
          voucherData.royaltyFee
        )
      ).to.be.revertedWith("IC");
    });

    it("testing the lazy mint function", async () => {
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        2,
        2,
        expandTo18Decimals(2),
        1,
        2,
        true,
        "www.hello.com"
      );

      await DabblerNFT.connect(owner).lazyMint(
        voucherData.tokenId,
        voucherData.amount,
        voucherData.seller,
        alice.address,
        voucherData.royaltyFee
      );
    });

    it("Support interface  ", async () => {
      expect(await DabblerNFT.supportsInterface("0xd9b67a26")).to.be.equal(
        true
      );
    });

    it("secondary buy  || Error :  insufficient amount || ETH", async () => {
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        2,
        2,
        expandTo18Decimals(2),
        1,
        2,
        true,
        "www.hello.com"
      );

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });

      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        2,
        2,
        expandTo18Decimals(2),
        2,
        2,
        false,
        "www.hello.com"
      );
      const currency = "0x0000000000000000000000000000000000000001";

      await marketPlace
        .connect(bob)
        .buy(voucherData, 2,47543945, currency, { value: expandTo18Decimals(4) });

      await expect(
        marketPlace
          .connect(alice)
          .buy(voucherData2, 2,89, currency, { value: expandTo18Decimals(1) })
      ).to.be.revertedWith("IA");
    });
    
    it("it should not intialize", async () => {
      await expect(
        DabblerNFT.connect(alice).initialize(
          "token__URI",
          marketPlace.address,
          Dabb20.address,
          owner.address
        )
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });

  

    it("it should not intialize marketPlace", async () => {
      await expect(
        marketPlace.connect(owner).initialize(DabblerNFT.address,500,router02.address,factory.address)
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });

    it("it should not intialize marketPlace", async () => {
      await expect(Dabb20.connect(owner).Initialize()).to.be.revertedWith(
        "Initializable: contract is already initialized"
      );
    });

  

    
      it("it should upgrade the offer || Global", async () => {
        //1. Mint token || Primarybuy
        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,34, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          owner.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(20));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(20)
        );
        await DabblerNFT.connect(alice).upgradeOffer(
          2,
          3,
          expandTo18Decimals(20),
          true
        );
    });
  });




      it("it should revert with invalid token ID ", async () => {

        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,789, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          owner.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(20));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(20)
        );
        await expect(
          DabblerNFT.connect(alice).upgradeOffer(
            7,
            3,
            expandTo18Decimals(20),
            true
          )
        ).to.be.revertedWith("IT");
      });


      it("it should revert with invalid offer number || Global ", async () => {

        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,567, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          owner.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(20));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(20)
        );
        await expect(
          DabblerNFT.connect(alice).upgradeOffer(
            2,
            9,
            expandTo18Decimals(20),
            true
          )
        ).to.be.revertedWith("ION");
      });

    

    

      it("it should revertwith invalid offer price || global", async () => {

        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,987, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          owner.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(20));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(20)
        );
        await expect(
          DabblerNFT.connect(alice).upgradeOffer(
            2,
            3,
            expandTo18Decimals(2),
            true
          )
        ).to.be.revertedWith("IOP");
      });
      //+++++++++++++++++++++++++++++++++++++++++++++++++++
      it("it should transfer the correct amount || Global", async () => {

        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,343546345, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(8),
          0
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(8));

        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(8)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, true);

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(20));

        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(20)
        );
        await DabblerNFT.connect(alice).upgradeOffer(
          2,
          3,
          expandTo18Decimals(10),
          true
        );

        expect(
          await Dabb20.connect(alice).balanceOf(alice.address)
        ).to.be.equal(expandTo18Decimals(18));
      });

      //+++++++++++++++++++++++++++++++++++++++++++++++++++

      it("it should upgrade the offer || Single", async () => {

        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );


        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,456789, Dabb20.address);

       
        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          owner.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, false);

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(20));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(20)
        );
        await DabblerNFT.connect(alice).upgradeOffer(
          2,
          3,
          expandTo18Decimals(20),
          false
        );
      });

      it("it should revertWith invalid offer mumber || Single ", async () => {

        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,45678, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          owner.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, false);

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(20));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(20)
        );
        await expect(
          DabblerNFT.connect(alice).upgradeOffer(
            2,
            9,
            expandTo18Decimals(20),
            false
          )
        ).to.be.revertedWith("ION");
      });

      it("it should revertwith invalid offer price || Single", async () => {

        await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
        await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
        await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
      
        await router02.connect(signers[8]).addLiquidityETH(
          Dabb20.address,
          expandTo18Decimals(1000),
          expandTo18Decimals(300),
          expandTo18Decimals(10),
          signers[8].address,
          1714521599,
          {value : expandTo18Decimals(100)}
        );
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          2,
          2,
          expandTo18Decimals(2),
          1,
          2,
          true,
          "www.hello.com"
        );

        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
        await marketPlace.connect(bob).buy(voucherData, 2,47876845, Dabb20.address);

        //Place offer
        const offerClass = new helper3({
          _contract: DabblerNFT,
          _signer: alice,
        });

        let offerData = await offerClass.createOffer(
          3,
          2,
          alice.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );
        let offerData3 = await offerClass.createOffer(
          3,
          2,
          owner.address,
          bob.address,
          expandTo18Decimals(4),
          2
        );

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(65)
        );
        await DabblerNFT.connect(alice).placeOffer(offerData, false);

        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(20));
        await Dabb20.connect(alice).approve(
          DabblerNFT.address,
          expandTo18Decimals(20)
        );
        await expect(
          DabblerNFT.connect(alice).upgradeOffer(
            2,
            3,
            expandTo18Decimals(2),
            false
          )
        ).to.be.revertedWith("IOP");
      });
    

     it("it should set the the creater should the get royalty || Global", async () => {

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });

      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address, //seller
        2, //amount
        2, //tokenId
        expandTo18Decimals(2), //pps
        1,
        200, // royaltyFee
        true,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(65)
      );

      await marketPlace.connect(bob).buy(voucherData, 2,944565, Dabb20.address);

      const offerClass = new helper3({ _contract: DabblerNFT, _signer: alice });

      let offerData = await offerClass.createOffer(
        3,
        2,
        alice.address,
        bob.address,
        expandTo18Decimals(5),
        2 //Global Offer
      );
      await Dabb20.connect(alice).mintdabb(expandTo18Decimals(25));
      await Dabb20.connect(alice).approve(
        DabblerNFT.address,
        expandTo18Decimals(25)
      );

      await DabblerNFT.connect(alice).placeOffer(offerData, false);

      const contactbal = await Dabb20.balanceOf(DabblerNFT.address);

      await DabblerNFT.connect(bob).acceptOffer(offerData, true);

      expect(await Dabb20.connect(owner).balanceOf(owner.address)).to.be.equal(
        "100020000100000000000000000"
      );
     });

  

    //Royalty test cases
describe("MarketPlace" ,async () => {
  

    it("Royalty is transffered in secondary buy || Dabb20", async () => {

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
      //primary buy
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        200,
        true,
        "www.hello.com"
      );
  
      const helperclasss2 = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclasss2.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        2,
        200,
        false,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(65)
      );

      await marketPlace.connect(bob).buy(voucherData, 3,457805, Dabb20.address);

      

      await Dabb20.connect(alice).mintdabb(expandTo18Decimals(73));

      await Dabb20.connect(alice).approve(
        marketPlace.address,
        expandTo18Decimals(73)
      );

      await marketPlace.connect(alice).buy(voucherData2, 3,4754325, Dabb20.address);

      expect(await Dabb20.connect(owner).balanceOf(owner.address)).to.be.equal(
        "100020000000000000000000000"
      );
    });
    
    it("Royalty is transffered in secondary buy || ETH", async () => {
      //TOM OWNER , NICK  = BOB , HARRY = ALICE
      
      const currency = "0x0000000000000000000000000000000000000001";

      const helperclass = new helper2({ _contract: marketPlace, _signer: tom });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        tom.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        200,
        true,
        "www.hello.com"
      );

      const ownerInitialBAl = await ethers.provider.getBalance(tom.address);
      console.log("TOM'S INITIAL BALANCE  : " , ownerInitialBAl);

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: nick,
      });
      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        nick.address,
        3,
        3,
        expandTo18Decimals(2),
        2,
        200,
        false,
        "www.hello.com"
      );
      await marketPlace
        .connect(nick)
        .buy(voucherData, 3,455467754 ,currency, { value: expandTo18Decimals(6) });

      await marketPlace
        .connect(harry)
        .buy(voucherData2, 3,4754399999945, currency, { value: expandTo18Decimals(6) });

         
      const ownerBalance = await ethers.provider.getBalance(tom.address);
      console.log("Owner balance after selling : " , ownerBalance);
      expect(ownerBalance).to.be.equal("10005820000000000000000");



      //+10023424500000000000000
    });


    
    it("it should set the the creater should the get royalty || Single", async () => {
      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });

      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address, //seller
        2, //amount
        2, //tokenId
        expandTo18Decimals(2), //pps
        1,
        200, // royaltyFee
        true,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(65)
      );

      await marketPlace.connect(bob).buy(voucherData, 2,4754324945, Dabb20.address);

      //Place offer
      const offerClass = new helper3({ _contract: DabblerNFT, _signer: alice });

      let offerData = await offerClass.createOffer(
        3,
        2,
        alice.address,
        bob.address,
        expandTo18Decimals(10),
        2 //Global Offer
      );
      await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
      await Dabb20.connect(alice).approve(
        DabblerNFT.address,
        expandTo18Decimals(65)
      );

      await DabblerNFT.connect(alice).placeOffer(offerData, false);

      const contactbal = await Dabb20.balanceOf(DabblerNFT.address);

      await DabblerNFT.connect(bob).acceptOffer(offerData, false);

      expect(await Dabb20.connect(owner).balanceOf(owner.address)).to.be.equal(
        "100020000200000000000000000"
      );
    });

    it(" it should check if royalty is enabled", async () => {
      expect(await marketPlace.checkFunc(DabblerNFT.address)).to.be.equal(true);
    });

    it("it should check it royalty is not enabled", async () => {
      expect(await marketPlace.checkFunc(noRoyalty.address)).to.be.equal(false);
    });
  

  // it("Reverted with the reason: CU Counter Used ", async () => {
  //   //primary buy
  //   const helperclass = new helper2({
  //     _contract: marketPlace,
  //     _signer: owner,
  //   });
  //   let voucherData = await helperclass.createVoucher(
  //     DabblerNFT.address,
  //     owner.address,
  //     3,
  //     3,
  //     expandTo18Decimals(2),
  //     1,
  //     250,
  //     true,
  //     "www.hello.com"
  //   );

    
  //   const helperclasss = new helper2({
  //     _contract: marketPlace,
  //     _signer: bob,
  //   });
  //   let voucherData2 = await helperclasss.createVoucher(
  //     DabblerNFT.address,
  //     bob.address,
  //     3,
  //     3,
  //     expandTo18Decimals(2),
  //     1,
  //     250,
  //     false,
  //     "www.hello.com"
  //   );

  //   //primary Buy done

  //   await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));
  
  //   await Dabb20.connect(bob).approve(
  //     marketPlace.address,
  //     expandTo18Decimals(7)
  //   );

  //   await marketPlace.connect(bob).buy(voucherData, 3,23, Dabb20.address);
  //    .log("here we are");

    

  //   expect(await DabblerNFT.connect(bob).balanceOf(bob.address, 3)).to.be.equal(
  //     3
  //   );

  //   await Dabb20.connect(alice).mintdabb(expandTo18Decimals(5));

  //   await Dabb20.connect(alice).approve(
  //     marketPlace.address,
  //     expandTo18Decimals(5)
  //   );

  //   await expect(
  //     marketPlace.connect(alice).buy(voucherData2, 3, Dabb20.address)
  //   ).to.be.revertedWith("CU");
  // });




  
  it("It should be able to mint Nft's to multiple addresses " , async () =>{
    let airdropAdd = [tom.address , nick.address , harry.address, alice.address] ; 
    let nftAmount = [2,3,4,6] ;
    let tokenIds = [6,7,8,9] ; 
     await marketPlace.connect(owner).airDropNft(airdropAdd , tokenIds , nftAmount) ;

     expect(await DabblerNFT.balanceOf(tom.address,6)).to.be.equal(2);
     expect(await DabblerNFT.balanceOf(nick.address,7)).to.be.equal(3);
     expect(await DabblerNFT.balanceOf(harry.address,8)).to.be.equal(4);
     expect(await DabblerNFT.balanceOf(alice.address,9)).to.be.equal(6);
  });

  it("It should be revert if address and amounts length mismatch " , async () =>{
    let airdropAdd = [tom.address , nick.address , harry.address] ; 
    let nftAmount = [2,3,4,6] ;
    let tokenIds = [6,7,8,9] ; 
   await expect( marketPlace.connect(owner).airDropNft(airdropAdd , tokenIds , nftAmount)).to.be.revertedWith("Length mismatch") ;

  });

  it("it should not mint with 0 nft amount", async () =>{
    let airdropAdd = [tom.address , nick.address , harry.address, alice.address] ; 
    let nftAmount = [65,7,9,70] ;
    let tokenIds = [0,0,0,0] ; 
     await expect( marketPlace.connect(owner).airDropNft(airdropAdd , tokenIds , nftAmount)).to.be.revertedWith("Token ID cannot be zero") ;


  });



  it("It should be revert if tokenID and amounts length mismatch " , async () =>{
    let airdropAdd = [tom.address , nick.address , harry.address,alice.address] ; 
    let nftAmount = [2,3,4,6] ;
    let tokenIds = [6,7,8] ; 
   await expect( marketPlace.connect(owner).airDropNft(airdropAdd , tokenIds , nftAmount)).to.be.revertedWith("Length mismatch") ;

  });
  

  it("airdrop function should be called by the owner" , async () =>{

    let airdropAdd = [tom.address , nick.address , harry.address, alice.address] ; 
    let nftAmount = [2,3,4,6] ;
    let tokenIds = [6,7,8,9] ; 
     await expect (marketPlace.connect(tom).airDropNft(airdropAdd , tokenIds , nftAmount)).to.be.revertedWith('Ownable: caller is not the owner') ;

  });

  it("it should not transfer nft's to zero address"  , async () =>{
    let airdropAdd = [tom.address , nick.address , harry.address, ethers.constants.AddressZero] ; 
    let nftAmount = [2,5,4,6] ;
    let tokenIds = [1,3,8,9] ; 
     await expect (marketPlace.connect(owner).airDropNft(airdropAdd , tokenIds , nftAmount)).to.be.revertedWith('ZA') ;
  });

  it("it should revert if token ID is 0" , async () =>{
    let airdropAdd = [tom.address , nick.address , harry.address, ethers.constants.AddressZero] ; 
    let nftAmount = [0,0,4,6] ;
    let tokenIds = [0,3,8,9] ; 
     await expect (marketPlace.connect(owner).airDropNft(airdropAdd , tokenIds , nftAmount)).to.be.revertedWith('Token ID cannot be zero') ;
    
  });

  it("it should revert if NFT Amount is 0" , async () =>{
    let airdropAdd = [tom.address , nick.address , harry.address, ethers.constants.AddressZero] ; 
    let nftAmount = [1,0,4,6] ;
    let tokenIds = [4,3,8,9] ; 
     await expect (marketPlace.connect(owner).airDropNft(airdropAdd , tokenIds , nftAmount)).to.be.revertedWith('NFT cannot be zero') ;
    
  });

  it("it should check if the counter is available" , async () =>{

    await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );
    const helperclass = new helper2({
      _contract: marketPlace,
      _signer: owner,
    });
    let voucherData = await helperclass.createVoucher(
      DabblerNFT.address,
      owner.address,
      3,
      3,
      expandTo18Decimals(2),
      1,
      250,
      true,
      "www.hello.com"
    );

    const helperclasss2 = new helper2({
      _contract: marketPlace,
      _signer: bob,
    });
    let voucherData2 = await helperclasss2.createVoucher(
      DabblerNFT.address,
      bob.address,
      3,
      3,
      expandTo18Decimals(2),
      1,
      250,
      false,
      "www.hello.com"
    );

    await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

    await Dabb20.connect(bob).approve(
      marketPlace.address,
      expandTo18Decimals(65)
    );

    await marketPlace.connect(bob).buy(voucherData, 3,4567890, Dabb20.address);



    expect(
      await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
    ).to.be.equal(3);

    await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));

    await Dabb20.connect(alice).approve(
      marketPlace.address,
      expandTo18Decimals(65)
    );
    
    await expect(marketPlace.connect(alice).buy(voucherData, 1,2345678, Dabb20.address)).to.be.revertedWith("CU");
  });

  it("Primary voucher should not be reused", async () => {
    const helperclass2 = new helper2({
      _contract: marketPlace,
      _signer: owner,
    });
    let voucherData = await helperclass2.createVoucher(
      DabblerNFT.address,
      owner.address,
      5,
      2,
      expandTo18Decimals(10),
      9,
      20,
      true,
      "hello.com"
    );

    const currency = "0x0000000000000000000000000000000000000001";

    await marketPlace
      .connect(bob)
      .buy(voucherData, 5,4565, currency, { value: expandTo18Decimals(60) });

      await expect( marketPlace.connect(alice).buy(voucherData, 5,465, currency, { value: expandTo18Decimals(60) })).to.be.revertedWith("CU");
    });

    it("CheckFunc should check for NFT's with non royalty" , async () =>{
      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
      const data = "0x1234";
       
    
         await noRoyalty.connect(owner).mint(bob.address,3,3,data);
       
         const helperclasss = new helper2({
          _contract: marketPlace,
          _signer: bob,
        });

        let voucherData2 = await helperclasss.createVoucher(
          noRoyalty.address,
          bob.address,
          3,
          3,
          expandTo18Decimals(2),
          1,
          250,
          false,
          "www.hello.com"
        );
  
    ;
  
        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));
  
        await Dabb20.connect(alice).approve(
          marketPlace.address,
          expandTo18Decimals(65)
        );
  
        await marketPlace.connect(alice).buy(voucherData2, 1,4777, Dabb20.address);
      
 
    });

  })


  
    it("Chekout Check " , async () =>{
     
      const currency = "0x0000000000000000000000000000000000000001";


      const ownerInitial = await ethers.provider.getBalance(owner.address);
  

      const aliceBalance1 =  await ethers.provider.getBalance(alice.address );
 

      const helperclass2 = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass2.createVoucher(
        DabblerNFT.address, //nft address
        owner.address, //seller 
        5, //amount
        2, //tokenId
        expandTo18Decimals(5), //pps
        1, //counter 
        20, //royalty fee
        true, // isPrimary 
        "www.hello.com"
      );

      //Primary Buy voucher 
      // this has to be bought primarily

   //   await marketPlace.connect(bob).buy(voucherData,5, currency,{value : expandTo18Decimals(25)});

      //primary buy done ++ bob has the nft brought from the owner 

     
     
      

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });

      let voucherData2 = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        2,
        250,
        true,
        "www.hello.com"
      );

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData3 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        3,
        250,
        false,
        "www.hello.com"
      );


     //owner --> bob --> alice 
     await marketPlace.connect(bob).buy(voucherData2 , 3,88888 , currency,{value : expandTo18Decimals(8)});
     
   


     //another primary buy voucher 
     const helperclass4= new helper2({
      _contract: marketPlace,
      _signer: owner,
    });
    let voucherData4= await helperclass4.createVoucher(
      DabblerNFT.address, //nft address
      owner.address, //seller 
      2, //amount
      2, //tokenId
      expandTo18Decimals(5), //pps
      4, //counter 
      20, //royalty fee
      true, // isPrimary 
      "www.hello.com"
    );
    

    //Creating another seconday buy 
    const helperclass5= new helper2({
      _contract: marketPlace,
      _signer: harry,
    });
    let voucherData5= await helperclass5.createVoucher(
      DabblerNFT.address, //nft address
      harry.address, //seller 
      2, //amount
      2, //tokenId
      expandTo18Decimals(5), //pps
      6, //counter 
      20, //royalty fee
      true, // isPrimary 
      "www.hello.com"
    );
    //+++++++

   await marketPlace.connect(nick).buy(voucherData5,2,999,currency , {value: expandTo18Decimals(10)});
  
   //+++++++++++++
    //primary buy of nick is complete 
    

   
    const helperclasss6 = new helper2({
      _contract: marketPlace,
      _signer: nick,
    });
    let voucherData6 = await helperclasss6.createVoucher(
      DabblerNFT.address,
      nick.address,
      1,
      2,
      expandTo18Decimals(2),
      7,
      20,
      false,
      "www.hello.com"
    );

    //seconday buy voucher of nick


      
    

      let voucherArr = [voucherData , voucherData3, voucherData4, voucherData6] ;
      let amountsArr = [5,3,2,1];

 
 
    await marketPlace.connect(owner).setAdmin(tom.address);
      

    await marketPlace.connect(alice).checkout(voucherArr , amountsArr,99905 , currency , {value :  expandTo18Decimals(43) });

     const aliceBalance = await ethers.provider.getBalance(alice.address );
     
     const ownerBalance = await ethers.provider.getBalance(owner.address) ;
     

     const tomBalance = await ethers.provider.getBalance(tom.address);
        
      expect(await DabblerNFT.connect(alice).balanceOf(alice.address , 2) ).to.be.equal(8);
      expect(await DabblerNFT.connect(alice).balanceOf(alice.address , 3) ).to.be.equal(3);

      const harryBalance = await ethers.provider.getBalance(harry.address);
       
     




    });


    //Event test cases 
    it("EVENT : it should buy NFT with ETHER", async () => {
      const helperclass2 = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass2.createVoucher(
        DabblerNFT.address,
        owner.address,
        5,
        2,
        expandTo18Decimals(10),
        9,
        20,
        true,
        "hello.com"
      );

      const currency = "0x0000000000000000000000000000000000000001";

      // await marketPlace
      //   .connect(bob)
      //   .buy(voucherData, 5, currency, { value: expandTo18Decimals(60) });

        await expect( marketPlace
        .connect(bob)
        .buy(voucherData, 5, 123,currency, { value: expandTo18Decimals(60) })).to.emit(marketPlace, 'TransferNFT').withArgs(owner.address , bob.address , 123,"50000000000000000000", currency ,5, 9, 2);
    });


    it("EVENT : it should buy NFT with ETHER with secondary ", async () => {
      const currency = "0x0000000000000000000000000000000000000001";
      
      //primary buy
     

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      
      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        2,
        250,
        false,
        "www.hello.com"
      );

   
      await marketPlace.connect(bob).buy(voucherData, 2, 123,currency, {value :  expandTo18Decimals(6)} );

      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
      ).to.be.equal(2);

  

      // await marketPlace.connect(alice).buy(voucherData2, 1,125, currency, {value : expandTo18Decimals(6)});
      // expect(
      //   await DabblerNFT.connect(alice).balanceOf(alice.address, 3)
      // ).to.be.equal(1);



      expect( await 
         marketPlace.connect(alice).buy(voucherData2, 1 , 125 ,currency , {value : expandTo18Decimals(6)})).to.emit(marketPlace , 'TransferNFT').withArgs(bob.address , alice.address , expandTo18Decimals(2),125,1 , 2 ,3 );


 
    });


    // it("Event : Accept Offer || Ether " , async () =>{

    
    // //   const currency = "0x0000000000000000000000000000000000000001";

    // //   const helperclass = new helper2({
    // //     _contract: marketPlace,
    // //     _signer: owner,
    // //   });
    // //   let voucherData = await helperclass.createVoucher(
    // //     DabblerNFT.address,
    // //     owner.address,
    // //     2,
    // //     2,
    // //     expandTo18Decimals(2),
    // //     1,
    // //     2,
    // //     true,
    // //     "www.hello.com"
    // //   );
  
    // //   await marketPlace.connect(bob).buy(voucherData , 2 ,19835, currency , {value : expandTo18Decimals(5)});

      
    // //   //Place offer
    // //   const offerClass = new helper3({
    // //     _contract: DabblerNFT,
    // //     _signer: alice,
    // //   });

    // //   let offerData = await offerClass.createOffer(
    // //     3,
    // //     2,
    // //     alice.address,
    // //     bob.address,
    // //     expandTo18Decimals(4),
    // //     2
    // //   );

    // //   let offerData3 = await offerClass.createOffer(
    // //     3,
    // //     2,
    // //     alice.address,
    // //     bob.address,
    // //     expandTo18Decimals(4),
    // //     2
    // //   );

      
     
      
    // //   await DabblerNFT.connect(alice).placeOffer(offerData, true);

    // //   await DabblerNFT.connect(bob).acceptOffer(offerData3, true);
 

  

    // // });


    it("OrderID : Primay sale || It should buy with unique order ID" , async () =>{

      const currency = "0x0000000000000000000000000000000000000001";
      
      //primary buy
     

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      
      
   
      await marketPlace.connect(bob).buy(voucherData , 2 ,124, currency ,  {value : expandTo18Decimals(6) })


      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
      ).to.be.equal(2);

  
 
    }) 


    it("OrderID : Primay sale || It should revert if the order ID is already used ++" , async () =>{

      const currency = "0x0000000000000000000000000000000000000001";
      
      //primary buy
     

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      
      
   
      await marketPlace.connect(bob).buy(voucherData , 2 ,189, currency ,  {value : expandTo18Decimals(6) }) ; 


      //primary buy
     

      const helperclass2 = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData2 = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        7,
        250,
        true,
        "www.hello.com"
      );


      await expect (marketPlace.connect(bob).buy(voucherData2 , 2 ,189, currency ,  {value : expandTo18Decimals(6) })).to.be.revertedWith("UID") ; 


    });



    it("OrderID : Secondary Sale || it should revert if the orderID is already used", async () =>{

      const currency = "0x0000000000000000000000000000000000000001";
      
      //primary buy
     

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      
      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        2,
        250,
        false,
        "www.hello.com"
      );

   
      await marketPlace.connect(bob).buy(voucherData, 2, 12378,currency, {value :  expandTo18Decimals(6)} );

      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
      ).to.be.equal(2);

  
    ;
      await expect( marketPlace.connect(alice).buy(voucherData2, 1,12378, currency, {value : expandTo18Decimals(6)})).to.be.revertedWith("UID");
     




    })





    it("OrderID : Secondary Sale || it should buy if the orderID is unique", async () =>{

      const currency = "0x0000000000000000000000000000000000000001";
      
      //primary buy
     

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      
      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        2,
        3,
        expandTo18Decimals(2),
        3,
        250,
        false,
        "www.hello.com"
      );

   
      await marketPlace.connect(bob).buy(voucherData, 2, 123,currency,{value :  expandTo18Decimals(6)} );

      expect(
         await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
      ).to.be.equal(2);
 
  
 
      await  marketPlace.connect(alice).buy(voucherData2, 1 ,12343, currency, {value : expandTo18Decimals(6)});
     
      expect(await DabblerNFT.connect(alice).balanceOf(alice.address , 3)).to.be.equal(1);
      
     


  



      

    });


    it("it should be able to buy NFT even if the amount is not same as the voucher" , async () =>{

      const currency = "0x0000000000000000000000000000000000000001";

 
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address, //NFT Address
        owner.address, // seller 
        3, // amount
        3, //tokenID
        expandTo18Decimals(2), //Price per NFT
        1,  ///counter
        250, //royaltty
        true, //primary buy
        "www.hello.com" //tokenURI 
      );

      await marketPlace.connect(alice).buy(voucherData,2,34,currency,{ value : expandTo18Decimals(4)}  ) ;
    
 

    }) ;


    it.only("Updated Dabbler test : Primary Buy flow" , async () =>{
  
      const currency = "0x0000000000000000000000000000000000000001";
   
  
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: harry,
      });

      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        harry.address,
        6,
        2,
        expandTo18Decimals(2),
        1,
        5,
        true,
        "www.hello.com"
      );

      
      let voucherArr = [voucherData] ;
      let amountsArr = [3];


      await marketPlace.connect(bob).checkout(voucherArr,amountsArr,45678,address1,{value: expandTo18Decimals(20)});

        expect(await DabblerNFT.balanceOf(harry.address,2)).to.be.eq(3);
        expect(await DabblerNFT.totalSupply(2)).to.be.eq(6);
        expect(await DabblerNFT.balanceOf(bob.address,2)).to.be.eq(3);

        

      await marketPlace.connect(alice).checkout(voucherArr,amountsArr,456758,address1,{value: expandTo18Decimals(20)});

        expect(await DabblerNFT.balanceOf(harry.address,2)).to.be.eq(0);
        expect(await DabblerNFT.balanceOf(alice.address,2)).to.be.eq(3);
        expect(await DabblerNFT.totalSupply(2)).to.be.eq(6);

        

    });


    it("Updated Dabbler Test : Secodary buy " , async() =>{

      const currency = "0x0000000000000000000000000000000000000001";

  
 

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: tom,
      });

      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        tom.address,
        10,
        2,
        expandTo18Decimals(2),
        1,
        5,
        true,
        "www.hello.com"
      );


      await marketPlace
         .connect(bob)
        .buy(voucherData, 3,55, currency, { value: expandTo18Decimals(20) });
 
        

        expect(await DabblerNFT.balanceOf(bob.address,2)).to.be.equal(3);
        expect(await DabblerNFT.balanceOf(tom.address,2)).to.be.equal(7);


      
        //Primary Buy done


        const helperclass2 = new helper2({
          _contract: marketPlace,
          _signer: bob,
        
        });

        
  
        let voucherData2 = await helperclass2.createVoucher(
          DabblerNFT.address,
          bob.address,
          3,
          2,
          expandTo18Decimals(3),
          2,
          5,
          false,
          "www.hello.com"
        );
  
        

        await marketPlace.connect(alice).buy(voucherData2,3,567,currency, {value : expandTo18Decimals(10)});
        
        expect(await DabblerNFT.balanceOf(alice.address,2)).to.be.equal(3);
        expect(await DabblerNFT.balanceOf(bob.address,2)).to.be.equal(0);
 


        //alice bought 3 nft's from bob


        const helperclass3 = new helper2({
          _contract: marketPlace,
          _signer: tom,
        
        });

        
  
        let voucherData3 = await helperclass3.createVoucher(
          DabblerNFT.address,
          tom.address,
          3,
          2,
          expandTo18Decimals(3),
          3,
          5,
          false,
          "www.hello.com"
        );   

      
        await marketPlace.connect(harry).buy(voucherData3 ,2 , 23 , currency , {value : expandTo18Decimals(25)});

       

        expect(await DabblerNFT.connect(harry).balanceOf(harry.address , 2)).to.be.equal(2);
        expect(await DabblerNFT.connect(tom).balanceOf(tom.address , 2)).to.be.equal(5);


        });




        it.only("DABBLER UPDATED : Test updated checkout " , async() =>{ const currency = "0x0000000000000000000000000000000000000001";


        const ownerInitial = await ethers.provider.getBalance(owner.address);
 
  
        const aliceBalance1 =  await ethers.provider.getBalance(alice.address );
    
  
        const helperclass2 = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass2.createVoucher(
          DabblerNFT.address, //nft address
          owner.address, //seller 
          5, //amount
          2, //tokenId
          expandTo18Decimals(5), //pps
          1, //counter 
          20, //royalty fee
          true, // isPrimary 
          "www.hello.com"
        );
  
        // Primary Buy voucher 
        // this has to be bought primarily
  
     //   await marketPlace.connect(bob).buy(voucherData,5, currency,{value : expandTo18Decimals(25)});
  
        //primary buy done ++ bob has the nft brought from the owner 
  
       
       
        
  
        const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
  
        let voucherData2 = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          10,
          3,
          expandTo18Decimals(2),
          2,
          250,
          true,
          "www.hello.com"
        );
  
        const helperclasss = new helper2({
          _contract: marketPlace,
          _signer: bob,
        });
        let voucherData3 = await helperclasss.createVoucher(
          DabblerNFT.address,
          bob.address,
          3,
          3,
          expandTo18Decimals(2),
          3,
          250,
          false,
          "www.hello.com"
        );
  
        
       //owner --> bob --> alice 
       await marketPlace.connect(bob).buy(voucherData2 , 3 ,34, currency , {value : expandTo18Decimals(21)});
 
  
       //another primary buy voucher 
       const helperclass4= new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData40= await helperclass4.createVoucher(
        DabblerNFT.address, //nft address
        owner.address, //seller 
        4, //amount
        20, //tokenId
        expandTo18Decimals(5), //pps
        4, //counter 
        20, //royalty fee
        true, // isPrimary 
        "www.hello.com"
      );
      
  
      // //Creating another seconday buy 
      // const helperclass5= new helper2({
      //   _contract: marketPlace,
      //   _signer: harry,
      // });
      // let voucherData5= await helperclass5.createVoucher(
      //   DabblerNFT.address, //nft address
      //   harry.address, //seller 
      //   7, //amount
      //   2, //tokenId
      //   expandTo18Decimals(5), //pps
      //   6, //counter 
      //   20, //royalty fee
      //   true, // isPrimary 
      //   "www.hello.com"
      // );
      // //+++++++
 
    let voucherArr1 = [voucherData] ;
        let amountsArr1 = [3];  
        // await marketPlace.connect(nick).buy(voucherData5,2,12,currency , {value: expandTo18Decimals(10)});
        await marketPlace.connect(nick).checkout(voucherArr1,amountsArr1,4567,address1,{value: expandTo18Decimals(16)});
     //+++++++++++++
      //primary buy of nick is complete 
      
  
 
      const helperclasss6 = new helper2({
        _contract: marketPlace,
        _signer: nick,
      });
      let voucherData6 = await helperclasss6.createVoucher(
        DabblerNFT.address,
        nick.address,
        2,
        2,
        expandTo18Decimals(2),
        7,
        20,
        false,
        "www.hello.com"
      );
  
      //seconday buy voucher of nick
  
  
  
  
  
        
   
  console.log("nft",await DabblerNFT.totalSupply(2));
        let voucherArr = [voucherData , voucherData3, voucherData40, voucherData6] ;
        let amountsArr = [2,3,2,1];
  
   
   
      await marketPlace.connect(owner).setAdmin(tom.address);
        
  console.log("test");
      await marketPlace.connect(alice).checkout(voucherArr , amountsArr , 98,currency , {value :  expandTo18Decimals(43) });
    

      expect (await DabblerNFT.connect(owner).balanceOf(owner.address,2)).to.be.equal(0);
      expect (await DabblerNFT.connect(owner).balanceOf(owner.address,3)).to.be.equal(7);

      expect(await DabblerNFT.connect(bob).balanceOf(bob.address,3)).to.be.equal(0);
      // expect(await DabblerNFT.connect(harry).balanceOf(harry.address,2)).to.be.equal(5);
      expect(await DabblerNFT.connect(nick).balanceOf(nick.address,2)).to.be.equal(2);
  






       const aliceBalance = await ethers.provider.getBalance(alice.address );
    
  
       const ownerBalance = await ethers.provider.getBalance(owner.address) ;
 
  
       const tomBalance = await ethers.provider.getBalance(tom.address);
 
        expect(await DabblerNFT.connect(alice).balanceOf(alice.address , 2) ).to.be.equal(3);
        expect(await DabblerNFT.connect(alice).balanceOf(alice.address , 3) ).to.be.equal(3);
  
        const harryBalance = await ethers.provider.getBalance(harry.address);
    


  
      
    } );


    //Testing Uniswap 
    it("It should create liquidity pool" , async () =>{

      
      await Tabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    
      await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(5000));
    
    
    
      await router02.connect(owner).addLiquidityETH(
        Tabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(0),
        expandTo18Decimals(50),
        owner.address,
        1714521599,
        {value : expandTo18Decimals(1000)}
      );
    })


    it("Uniswap || ERC20 || it should be able to primary buy " , async()=>{

      // await Tabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Tabb20.connect(harry).mintdabb(expandTo18Decimals(20000));
    // await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
     await Tabb20.connect(harry).approve(router02.address, expandTo18Decimals(20000));
      
     await router02.connect(harry).addLiquidityETH(
       Tabb20.address,
       expandTo6Decimals(3000),
       expandTo18Decimals(3000),
       expandTo18Decimals(100),
       harry.address,
       1754521599,
       {value : expandTo18Decimals(1000)}
     );



      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );

      

      
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: harry,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        harry.address,
        10,
        2,
        expandTo18Decimals(1),
        1,
        250,
        true,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(10000));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(10000)
      );

      await marketPlace.connect(owner).setAdmin(tom.address);
      await marketPlace.connect(bob).buy(voucherData, 2,4556654, Dabb20.address);

     
      

    });


    it("Uniswap || ERC20 || The Seller should get correct amount"  , async () =>{

      // await Tabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Tabb20.connect(harry).mintdabb(expandTo18Decimals(20000));
    // await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
     await Tabb20.connect(harry).approve(router02.address, expandTo18Decimals(20000));
      
     await router02.connect(harry).addLiquidityETH(
       Tabb20.address,
       expandTo6Decimals(3000),
       expandTo18Decimals(3000),
       expandTo18Decimals(100),
       harry.address,
       1754521599,
       {value : expandTo18Decimals(1000)}
     );

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );

      let initialBalanceOfSeller = await ethers.provider.getBalance(harry.address);
      
      
    
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer:harry,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        harry.address,
        10,
        2,
        expandTo18Decimals(1),
        1,
        250,
        true,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(10000));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(10000)
      );

      await marketPlace.connect(owner).setAdmin(tom.address);
      await marketPlace.connect(bob).buy(voucherData, 2,45, Dabb20.address);

      // expect( await ethers.provider.getBalance(harry.address)).to.be.equal("10003772159029789200667")

      
    });



    // it("Uniswap || ERC20 || The admint  should get correct platform fee"  , async () =>{

    //   // await Tabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    // await Tabb20.connect(harry).mintdabb(expandTo18Decimals(20000));
    // // await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    //  await Tabb20.connect(harry).approve(router02.address, expandTo18Decimals(20000));
      
    //  await router02.connect(harry).addLiquidityETH(
    //    Tabb20.address,
    //    expandTo6Decimals(3000),
    //    expandTo18Decimals(3000),
    //    expandTo18Decimals(100),
    //    harry.address,
    //    1754521599,
    //    {value : expandTo18Decimals(1000)}
    //  );

    //   await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    // await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    // await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    // await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    // await router02.connect(signers[8]).addLiquidityETH(
    //   Dabb20.address,
    //   expandTo18Decimals(1000),
    //   expandTo18Decimals(300),
    //   expandTo18Decimals(10),
    //   signers[8].address,
    //   1714521599,
    //   {value : expandTo18Decimals(100)}
    // );

    //   let initialBalanceOfSeller = await ethers.provider.getBalance(tom.address);
      
      
    
    //   const helperclass = new helper2({
    //     _contract: marketPlace,
    //     _signer:harry,
    //   });
    //   let voucherData = await helperclass.createVoucher(
    //     DabblerNFT.address,
    //     harry.address,
    //     10,
    //     2,
    //     expandTo18Decimals(1),
    //     1,
    //     250,
    //     true,
    //     "www.hello.com"
    //   );

    //   await Dabb20.connect(bob).mintdabb(expandTo18Decimals(10000));

    //   await Dabb20.connect(bob).approve(
    //     marketPlace.address,
    //     expandTo18Decimals(10000)
    //   );

    //   await marketPlace.connect(owner).setAdmin(tom.address);
    //   await marketPlace.connect(bob).buy(voucherData, 2,45, Dabb20.address);

    //   expect( await ethers.provider.getBalance(tom.address)).to.be.equal("10000100000000000000000");

      
    // });



    it("Uniswap || ERC20 || Secondary Buy" , async() =>{

      // await Tabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Tabb20.connect(harry).mintdabb(expandTo18Decimals(20000));
    // await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
     await Tabb20.connect(harry).approve(router02.address, expandTo18Decimals(20000));
      
     await router02.connect(harry).addLiquidityETH(
       Tabb20.address,
       expandTo6Decimals(3000),
       expandTo18Decimals(3000),
       expandTo18Decimals(100),
       harry.address,
       1754521599,
       {value : expandTo18Decimals(1000)}
     );

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );
         //primary buy
         const helperclass = new helper2({
          _contract: marketPlace,
          _signer: owner,
        });
        let voucherData = await helperclass.createVoucher(
          DabblerNFT.address,
          owner.address,
          3,
          3,
          expandTo18Decimals(1),
          1,
          250,
          true,
          "www.hello.com"
        );
  
        const helperclasss = new helper2({
          _contract: marketPlace,
          _signer: bob,
        });
        let voucherData2 = await helperclasss.createVoucher(
          DabblerNFT.address,
          bob.address,
          3,
          3,
          expandTo18Decimals(1),
          1,
          250,
          false,
          "www.hello.com"
        );
  
        await Dabb20.connect(bob).mintdabb(expandTo18Decimals(10000));
  
        await Dabb20.connect(bob).approve(
          marketPlace.address,
          expandTo18Decimals(10000)
        );
  
        await marketPlace.connect(bob).buy(voucherData, 2,34, Dabb20.address);
  
        expect(
          await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
        ).to.be.equal(2);
  
        await Dabb20.connect(alice).mintdabb(expandTo18Decimals(9000));
  
        await Dabb20.connect(alice).approve(
          marketPlace.address,
          expandTo18Decimals(9000)
        );
  
        await marketPlace.connect(alice).buy(voucherData2, 1,55678906, Dabb20.address);
        expect(
          await DabblerNFT.connect(alice).balanceOf(alice.address, 3)
        ).to.be.equal(1);
    });



    it("Uniswap || Chekout Check " , async () =>{

      // await Tabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Tabb20.connect(harry).mintdabb(expandTo18Decimals(20000));
    // await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
     await Tabb20.connect(harry).approve(router02.address, expandTo18Decimals(20000));
      
     await router02.connect(harry).addLiquidityETH(
       Tabb20.address,
       expandTo6Decimals(3000),
       expandTo18Decimals(3000),
       expandTo18Decimals(100),
       harry.address,
       1754521599,
       {value : expandTo18Decimals(1000)}
     );

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );
    //  const currency = "0x0000000000000000000000000000000000000001";


      const ownerInitial = await ethers.provider.getBalance(owner.address);
 

      const aliceBalance1 =  await ethers.provider.getBalance(alice.address );
    

      const helperclass2 = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass2.createVoucher(
        DabblerNFT.address, //nft address
        owner.address, //seller 
        5, //amount
        2, //tokenId
        expandTo18Decimals(1), //pps
        1, //counter 
        20, //royalty fee
        true, // isPrimary 
        "www.hello.com"
      );

      //Primary Buy voucher 
      // this has to be bought primarily

   //   await marketPlace.connect(bob).buy(voucherData,5, currency,{value : expandTo18Decimals(25)});

      //primary buy done ++ bob has the nft brought from the owner 

     
     
      

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });

      let voucherData2 = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(5),
        2,
        250,
        true,
        "www.hello.com"
      );

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData3 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(5),
        3,
        250,
        false,
        "www.hello.com"
      );


     //owner --> bob --> alice 
       await Dabb20.connect(bob).mintdabb(expandTo18Decimals(8000));
       await Dabb20.connect(bob).approve(marketPlace.address,expandTo18Decimals(8000));
     await marketPlace.connect(bob).buy(voucherData2 , 3, 56, Dabb20.address);
     
 


     //another primary buy voucher 
     const tomBalance = await ethers.provider.getBalance(tom.address);
  
     const helperclass4= new helper2({
      _contract: marketPlace,
      _signer: owner,
    });
    let voucherData4= await helperclass4.createVoucher(
      DabblerNFT.address, //nft address
      owner.address, //seller 
      2, //amount
      2, //tokenId
      expandTo18Decimals(5), //pps
      4, //counter 
      20, //royalty fee
      true, // isPrimary 
      "www.hello.com"
    );
    

    //Creating another seconday buy 
    const helperclass5= new helper2({
      _contract: marketPlace,
      _signer: harry,
    });
    let voucherData5= await helperclass5.createVoucher(
      DabblerNFT.address, //nft address
      harry.address, //seller 
      2, //amount
      2, //tokenId
      expandTo18Decimals(5), //pps
      6, //counter 
      20, //royalty fee
      true, // isPrimary 
      "www.hello.com"
    );
    //+++++++
 

   await Dabb20.connect(nick).mintdabb(expandTo18Decimals(10000));
   await Dabb20.connect(nick).approve(marketPlace.address,expandTo18Decimals(12000));

   await marketPlace.connect(nick).buy(voucherData5,2,34, Dabb20.address);
 
   //+++++++++++++
    //primary buy of nick is complete 
    

     
    
    const helperclasss6 = new helper2({
      _contract: marketPlace,
      _signer: nick,
    });
    let voucherData6 = await helperclasss6.createVoucher(
      DabblerNFT.address,
      nick.address,
      1,
      2,
      expandTo18Decimals(2),
      7,
      20,
      false,
      "www.hello.com"
    );

    //seconday buy voucher of nick




      let voucherArr = [voucherData3, voucherData6] ;
      let amountsArr = [3,1];

  
   
    await Dabb20.connect(alice).mintdabb(expandTo18Decimals(5000));
    await Dabb20.connect(alice).approve(marketPlace.address,expandTo18Decimals(5000));
    await marketPlace.connect(owner).setAdmin(tom.address);
      

    await marketPlace.connect(alice).checkout(voucherArr , amountsArr , 9345670,Dabb20.address,{value: expandTo18Decimals(17)});

   
      expect(await DabblerNFT.connect(alice).balanceOf(alice.address , 2) ).to.be.equal(1);
      expect(await DabblerNFT.connect(alice).balanceOf(alice.address , 3) ).to.be.equal(3);

     
    
    });

    it.only("Get price should return correct price after convetrsion" , async()=>{

      // await Tabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Tabb20.connect(harry).mintdabb(expandTo18Decimals(20000));
    // await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
     await Tabb20.connect(harry).approve(router02.address, expandTo18Decimals(20000));
      
     await router02.connect(harry).addLiquidityETH(
       Tabb20.address,
       expandTo6Decimals(3000),
       expandTo18Decimals(3000),
       expandTo18Decimals(100),
       harry.address,
       1754521599,
       {value : expandTo18Decimals(1000)}
     );

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );
       let price = marketPlace.getPrice(expandTo16Decimals(5), Dabb20.address);
       expect(await price).to.be.equal("501755391236239986");
    }
    );


    it.only("Decimal 6 || Get price should return correct price after convetrsion" , async()=>{

      // await Tabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Tabb20.connect(harry).mintdabb(expandTo18Decimals(20000));
    // await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
     await Tabb20.connect(harry).approve(router02.address, expandTo18Decimals(20000));
      
     await router02.connect(harry).addLiquidityETH(
       Tabb20.address,
       expandTo6Decimals(3000),
       expandTo18Decimals(3000),
       expandTo18Decimals(100),
       harry.address,
       1754521599,
       {value : expandTo18Decimals(1000)}
     );

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );
      let price = marketPlace.getPrice(expandTo6Decimals(13), Tabb20.address);
      expect(await price).to.be.equal("1");
   }
   );


   it("SetPlatformFee || Owner should be able to set the platformFee" , async () =>{
    await marketPlace.connect(owner).setPlatformFee(200);

    expect(await marketPlace.platformFee()).to.be.equal(200);

    
   });

   it("SetPlatformFee || Only Owner should be able to set the platformFee" , async () =>{
    await expect ( marketPlace.connect(alice).setPlatformFee(200)).to.be.revertedWith("Ownable: caller is not the owner");

   
   });

   it("SetPlatformFee || new platform fee should be greater than zero" , async () =>{
    await expect ( marketPlace.connect(owner).setPlatformFee(0)).to.be.revertedWith("exceeding limit");

   
   });


   it("setAdmin || only owner should be able to set the admin" , async () =>{
     await expect( marketPlace.connect(alice).setAdmin(tom.address)).to.be.revertedWith("Ownable: caller is not the owner");
   });

   it("setAdmin || new admin should not be zero address" , async() =>{

    await expect( marketPlace.connect(owner).setAdmin(ethers.constants.AddressZero)).to.be.revertedWith("Zero Address");

   });

   it("revert case for checkout insufficient balance", async()=>{
    

    await Tabb20.connect(harry).mintdabb(expandTo18Decimals(20000));
    // await Tabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
     await Tabb20.connect(harry).approve(router02.address, expandTo18Decimals(20000));
      
     await router02.connect(harry).addLiquidityETH(
       Tabb20.address,
       expandTo6Decimals(3000),
       expandTo18Decimals(3000),
       expandTo18Decimals(100),
       harry.address,
       1754521599,
       {value : expandTo18Decimals(1000)}
     );

      await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
    await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
    await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
  
    await router02.connect(signers[8]).addLiquidityETH(
      Dabb20.address,
      expandTo18Decimals(1000),
      expandTo18Decimals(300),
      expandTo18Decimals(10),
      signers[8].address,
      1714521599,
      {value : expandTo18Decimals(100)}
    );
     const currency = "0x0000000000000000000000000000000000000001";


      const ownerInitial = await ethers.provider.getBalance(owner.address);
 

      const aliceBalance1 =  await ethers.provider.getBalance(alice.address );
    

      const helperclass2 = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass2.createVoucher(
        DabblerNFT.address, //nft address
        owner.address, //seller 
        5, //amount
        2, //tokenId
        expandTo18Decimals(1), //pps
        1, //counter 
        20, //royalty fee
        true, // isPrimary 
        "www.hello.com"
      );

      //Primary Buy voucher 
      // this has to be bought primarily

   //   await marketPlace.connect(bob).buy(voucherData,5, currency,{value : expandTo18Decimals(25)});

      //primary buy done ++ bob has the nft brought from the owner 

     
     
      

      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });

      let voucherData2 = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(5),
        2,
        250,
        true,
        "www.hello.com"
      );

      const helperclasss = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData3 = await helperclasss.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(5),
        3,
        250,
        false,
        "www.hello.com"
      );


     //owner --> bob --> alice 
       await Dabb20.connect(bob).mintdabb(expandTo18Decimals(8000));
       await Dabb20.connect(bob).approve(marketPlace.address,expandTo18Decimals(8000));
     await marketPlace.connect(bob).buy(voucherData2 , 3, 56, Dabb20.address);
     
 


     //another primary buy voucher 
     const tomBalance = await ethers.provider.getBalance(tom.address);
  
     const helperclass4= new helper2({
      _contract: marketPlace,
      _signer: owner,
    });
    let voucherData4= await helperclass2.createVoucher(
      DabblerNFT.address, //nft address
      owner.address, //seller 
      2, //amount
      2, //tokenId
      expandTo18Decimals(5), //pps
      4, //counter 
      20, //royalty fee
      true, // isPrimary 
      "www.hello.com"
    );
    

    //Creating another seconday buy 
    const helperclass5= new helper2({
      _contract: marketPlace,
      _signer: harry,
    });
    let voucherData5= await helperclass5.createVoucher(
      DabblerNFT.address, //nft address
      harry.address, //seller 
      2, //amount
      2, //tokenId
      expandTo18Decimals(5), //pps
      6, //counter 
      20, //royalty fee
      true, // isPrimary 
      "www.hello.com"
    );
    //+++++++
 

   await Dabb20.connect(nick).mintdabb(expandTo18Decimals(10000));
   await Dabb20.connect(nick).approve(marketPlace.address,expandTo18Decimals(12000));

   await marketPlace.connect(nick).buy(voucherData5,2,34, Dabb20.address);
 
   //+++++++++++++
    //primary buy of nick is complete 
    

     
    
    const helperclasss6 = new helper2({
      _contract: marketPlace,
      _signer: nick,
    });
    let voucherData6 = await helperclasss6.createVoucher(
      DabblerNFT.address,
      nick.address,
      1,
      2,
      expandTo18Decimals(2),
      7,
      20,
      false,
      "www.hello.com"
    );

    //seconday buy voucher of nick




      let voucherArr = [voucherData3, voucherData6] ;
      let amountsArr = [3,1];

  
   
    await Dabb20.connect(alice).mintdabb(expandTo18Decimals(50));
    await Dabb20.connect(alice).approve(marketPlace.address,expandTo18Decimals(5000));
    await marketPlace.connect(owner).setAdmin(tom.address);
      
   
    await Dabb20.connect(signers[6]).mintdabb(expandTo18Decimals(5000));
    await Dabb20.connect(signers[6]).approve(marketPlace.address,expandTo18Decimals(5000));

   
    await Dabb20.connect(signers[7]).mintdabb(expandTo18Decimals(5000));
    await Dabb20.connect(signers[7]).approve(marketPlace.address,expandTo18Decimals(5000));

    await marketPlace.connect(signers[7]).checkout(voucherArr , amountsArr , 9345670,Dabb20.address);
    await expect(marketPlace.connect(alice).checkout(voucherArr , amountsArr , 9345670,Dabb20.address)).to.be.revertedWith("IF");
    

    await expect(marketPlace.connect(signers[6]).checkout(voucherArr , amountsArr , 9345670,Dabb20.address)).to.be.revertedWith("UID");
     
    
   });

   it("Revert case for primary sale for invalid NFT address and Invalid voucher", async()=>{
    const AddressZero = "0x0000000000000000000000000000000000000000";

    const helperclass2 = new helper2({
      _contract: marketPlace,
      _signer: owner,
    });
    let voucherData = await helperclass2.createVoucher(
      AddressZero,
      owner.address,
      5,
      2,
      expandTo18Decimals(10),
      9,
      20,
      true,
      "hello.com"
    );
    const helperclass = new helper2({
      _contract: marketPlace,
      _signer: signers[2],
    });
    let voucherData2 = await helperclass.createVoucher(
      DabblerNFT.address,
      owner.address,
      5,
      2,
      expandTo18Decimals(10),
      9,
      20,
      true,
      "hello.com"
    );


    const currency = "0x0000000000000000000000000000000000000001";

    await expect(marketPlace
      .connect(bob)
      .buy(voucherData, 5,4565, currency, { value: expandTo18Decimals(60) })).to.be.revertedWith("INA");
      

      await expect(marketPlace
        .connect(bob)
        .buy(voucherData2, 5,4565, currency, { value: expandTo18Decimals(60) })).to.be.revertedWith("IV");
    

        await expect(marketPlace
          .connect(bob)
          .buy(voucherData, 5,4565, Dabb20.address)).to.be.revertedWith("INA");
          
    
          await expect(marketPlace
            .connect(bob)
            .buy(voucherData2, 5,4565, Dabb20.address)).to.be.revertedWith("IV");

   })


   it("Revert case for secondary sale fro Invalid NFT address and Invalid Voucher",async()=>{

    const AddressZero = "0x0000000000000000000000000000000000000000";
    const currency = "0x0000000000000000000000000000000000000001";


    await Dabb20.connect(owner).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).mintdabb(expandTo18Decimals(20000));
      await Dabb20.connect(owner).approve(router02.address, expandTo18Decimals(20000));
      await Dabb20.connect(signers[8]).approve(router02.address, expandTo18Decimals(20000));
    
      await router02.connect(signers[8]).addLiquidityETH(
        Dabb20.address,
        expandTo18Decimals(1000),
        expandTo18Decimals(300),
        expandTo18Decimals(10),
        signers[8].address,
        1714521599,
        {value : expandTo18Decimals(100)}
      );
      //primary buy
      const helperclass = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData = await helperclass.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        true,
        "www.hello.com"
      );

      const helperclass2 = new helper2({
        _contract: marketPlace,
        _signer: bob,
      });
      let voucherData2 = await helperclass2.createVoucher(
        AddressZero,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        false,
        "www.hello.com"
      );

      const helperclass3 = new helper2({
        _contract: marketPlace,
        _signer: signers[7],
      });
      let voucherData3 = await helperclass3.createVoucher(
        DabblerNFT.address,
        bob.address,
        3,
        3,
        expandTo18Decimals(2),
        1,
        250,
        false,
        "www.hello.com"
      );
      const helperclass4 = new helper2({
        _contract: marketPlace,
        _signer: owner,
      });
      let voucherData4= await helperclass4.createVoucher(
        DabblerNFT.address,
        owner.address,
        3,
        35,
        expandTo18Decimals(2),
        1,
        250,
        false,
        "www.hello.com"
      );

      await Dabb20.connect(bob).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(bob).approve(
        marketPlace.address,
        expandTo18Decimals(42)
      );

      await marketPlace.connect(bob).buy(voucherData, 2,475945, Dabb20.address);

      expect(
        await DabblerNFT.connect(bob).balanceOf(bob.address, 3)
      ).to.be.equal(2);

      await Dabb20.connect(alice).mintdabb(expandTo18Decimals(65));

      await Dabb20.connect(alice).approve(
        marketPlace.address,
        expandTo18Decimals(42)
      );

      await Dabb20.connect(alice).mintdabb(expandTo18Decimals(50));
      await Dabb20.connect(alice).approve(marketPlace.address,expandTo18Decimals(5000));
      await marketPlace.connect(owner).setAdmin(tom.address);
        
     
      await Dabb20.connect(signers[6]).mintdabb(expandTo18Decimals(5000));
      await Dabb20.connect(signers[6]).approve(marketPlace.address,expandTo18Decimals(5000));
  
     
      await Dabb20.connect(signers[7]).mintdabb(expandTo18Decimals(5000));
      await Dabb20.connect(signers[7]).approve(marketPlace.address,expandTo18Decimals(5000));
      
      await expect(marketPlace.connect(alice).buy(voucherData4, 1,47945, Dabb20.address)).to.revertedWith("INFT");

      await expect(marketPlace.connect(alice).buy(voucherData2, 1,47945, Dabb20.address)).to.revertedWith("INA");
      await expect(marketPlace.connect(alice).buy(voucherData3, 1,47945, Dabb20.address)).to.revertedWith("IV");

      await expect(marketPlace.connect(alice).buy(voucherData2, 1,47945, currency,{value:expandTo18Decimals(56)})).to.be.revertedWith("INA");
      await expect(marketPlace.connect(alice).buy(voucherData3, 1,47945, currency,{value:expandTo18Decimals(56)})).to.be.revertedWith("IV");



   });


















  });
