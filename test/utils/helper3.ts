import { ethers } from "hardhat";

const SIGNING_DOMAIN_NAME = "Dabbler";
const SIGNING_DOMAIN_VERSION = "1";


class offerHash 
{
  public contract: any;
  public signer: any;
  public domain: any;

  constructor(data: any) {
    const { _contract, _signer } = data;
    this.contract = _contract;
    this.signer = _signer;

  }

  async createOffer(offernumber: any, tokenId: any, offerMaker: any, offerAccepter: any, offerAmount: any, askedQuantity: any){

        const offer = {offernumber,tokenId,offerMaker,offerAccepter,offerAmount,askedQuantity}

        const types = {
            makeOffer : [
                {name:"offernumber" ,type: "uint256"},
                {name:"tokenId", type: "uint256"},
                {name:"offerMaker" , type: "address"},
                {name:"offerAccepter" , type: "address"},
                {name:"offerAmount" , type: "uint256"},
                {name:"askedQuantity" , type: "uint256"}

            ]
        };
      
    const domain = await this._signingDomain();

    const signature = await this.signer._signTypedData(domain, types, offer);
    
    return {
      ...offer,
      signature,
    };

  }

    async _signingDomain() {
      if (this.domain != null) {
        return this.domain;
      }
      const chainId = 31337
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




export default offerHash ;