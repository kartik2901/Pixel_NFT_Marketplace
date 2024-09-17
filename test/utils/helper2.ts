import { ethers } from "ethers";

const SIGNING_DOMAIN_NAME = "marketPlace";
const SIGNING_DOMAIN_VERSION = "1";

//const chainId = 31337;
//const contractAddress = "0xa131AD247055FD2e2aA8b156A11bdEc81b9eAD95"; // Put the address here from remix
//const signer = new ethers.Wallet(
// "503f38a9c967ed597e47fe25643985f032b072db8075426a92110f82df48dfcb"
//); // private key that I use for address 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4

class primaryHash {
  public contract: any;
  public signer: any;
  public domain: any;


  constructor(data: any) {
    const { _contract, _signer } = data;
    this.contract = _contract;
    this.signer = _signer;
  }

  async createVoucher(
    nftAddress: any,
    seller: any,
    amount: any,
    tokenId: any,
    pricePerShare: any,
    counter: any,
    royaltyFee: any,
    isPrimary: any,
    tokenUri: any
  ) {
    const Voucher = {
      nftAddress,
      seller,
      amount,
      tokenId,
      pricePerShare,
      counter,
      royaltyFee,
      isPrimary,
      tokenUri,
    };
    //console.log(Voucher,"nftnft")
    const types = {
      primaryBuy: [
        { name: "nftAddress", type: "address" },
        { name: "seller", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "tokenId", type: "uint256" },
        { name: "pricePerShare", type: "uint256" },
        { name: "counter", type: "uint256" },
        { name: "royaltyFee", type: "uint96" },
        { name: "isPrimary", type: "bool" },
        { name: "tokenUri", type: "string" },
      ],
    };

    const domain = await this._signingDomain();
    const signature = await this.signer._signTypedData(domain, types, Voucher);
    //console.log(signature, typeof signature, "checking signature")
    return {
      ...Voucher,
      signature,
    };
  }


  async _signingDomain() {
    if (this.domain != null) {
      return this.domain;
    }
    const chainId = 31337;
    // const chainId = 31337;
    this.domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    };
    return this.domain;
  }
}



//async function  main() {

//    const voucher = await createVoucher(
//       5, // specify the name of the parameter
//       50,
//       "uri",
//       "0x17F6AD8Ef982297579C203069C1DbfFE4348c372",
//    ) ;
//       // the address is the address which receives the NFT
//    console.log(
//      `[${voucher.tokenID}, ${voucher.price}, "${voucher.uri}", "${voucher.buyer}", "${voucher.signature}"]`
//    );
//  }

//}

export default primaryHash;
