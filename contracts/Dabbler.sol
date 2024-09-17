// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./library/structs.sol";

contract Dabbler is
    EIP712Upgradeable,
    ERC1155URIStorageUpgradeable,
    OwnableUpgradeable,
    ERC2981Upgradeable
{  
    
    //Address for native currency
    address currency;
    //Address for admin
    address public admin;
    // Address for marketPlace Contract
    address public marketplace;
    // Address for USDC token
    address USDC;
  
    //Struct for the mappings to store single and global offers offered amounts
    struct offer {
        mapping(uint256 => uint256) globalOffer;
        mapping(uint256 => uint256) singleOffer;
    }

    // tokenMinted Mapping is for keeping track of all minted nfts
    mapping(uint256 => uint256) public tokenMinted;
    
    // offers Mapping is for  keeping track of the suggested amount  against the user's Address
    mapping(address => offer) private offers;

    event acceptOfferEvent(uint256 indexed _offernumber, uint256 indexed _tokenID , address _offerMaker , address _offerAccepter , uint256 _offerAmount , uint256 _askedQuantity , string _offerType , address _royaltyReceiver , uint256 _royaltyAmount);
    event placeOfferEvent(uint256 indexed _offernumber, uint256 indexed _tokenID , address _offerMaker , address _offerAccepter, uint256 _offerAmount , uint256 _askedQuantity , string offerType);
    event upgradeOfferEvent(uint indexed _offernumber,uint indexed _tokenID, address _upgraderAddress , uint256 _newPrice , string _offerType);
    event refundEvent(uint256 indexed _offernumber,  uint256 indexed _tokenID , address _refundCaller , uint256 _refundPrice , string _offerType );
    /**
     * Constructor function for disabling the initialization of the implementation.

    // constructor() {
    //     // _disableInitializers();
    // }

    /**
     * @dev Initializes the contract by passing `uri`,`admin`,`marketplace`,`USDC` for the nft contract
     * @param _uri is the base uri required to initialize the ERC1155 contract
     * @param _marketplace is address for the marketPlace for thr NFT contract
     * @param _USDC is address for the ERC20 token for the Dabbler token contract
     */

    function initialize(
        string memory _uri,
        address _marketplace,
        address _USDC,
        address _admin
    ) public initializer {
      //  require(msg.sender == _admin, "IC"); // InValid Caller
        __ERC1155_init(_uri);
        __ERC1155URIStorage_init();
        __Ownable_init_unchained();
        __ERC2981_init_unchained();
        marketplace = _marketplace;
        USDC = _USDC;
        __EIP712_init_unchained("Dabbler", "1");
        admin=_admin;
    }


    /**
     * @notice This function will mint the NFTS
     * @param recipient is the address for recipient
     * @param id is the token id to be minted
     * @param amount is the number of shares to be minted
     */

    function safeMint(
        address recipient,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        require(
            msg.sender == admin || msg.sender == marketplace,
            "invalid caller"
        );
        _mint(recipient, id, amount, data);
        tokenMinted[id] = amount;
    }

    // function safemintbatch(
    //     address recipient,
    //     uint256[] memory _tokenIds,
    //     uint256[] memory nftamounts
        
    // ) public  {
    //     require(
    //         recipient == admin,
    //         "invalid caller"
    //     );
       
    //     _mintBatch(recipient, _tokenIds, nftamounts, "");
    // }



    /** function safeBatchTransfer(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external {
        _safeBatchTransferFrom(from, to, ids, amounts, data);
    }

     * @notice This function will be used to mint the NFT as per the details
     * @param _tokenId is the unique token ID for the NFT
     * @param _amount is the amount of shares to be minted
     * @param _seller address of the seller of NFT shares
     * @param _royaltyfee Royalty fees for the minted NFT
     */
    function lazyMint(
        uint256 _tokenId,
        uint256 _amount,
        address _seller,
        uint96 _royaltyfee
    ) public {
        require(msg.sender == marketplace || msg.sender == admin, "IC"); //INVALID CALLER

        _mint(_seller, _tokenId, _amount, "");

        _setTokenRoyalty(_tokenId, _seller, _royaltyfee);
        _setApprovalForAll(_seller, marketplace, true);
        tokenMinted[_tokenId] += _amount;

    }

    /**
     * @dev Safe Transfer will transfer the NFT
     * @param _tokenId is the TokenID that will be transfer
     * @param _amount is the amount of shares to be transfered
     * @param _seller  address of seller of NFT
     * @param _buyer address of buyer of NFT
     */
    function safeTransferFrom(
        uint256 _tokenId,
        uint256 _amount,
        address _seller,
        address _buyer
    ) external {
        _safeTransferFrom(_seller, _buyer, _tokenId, _amount, "");
    }

    /**
     *@notice Retrieves the royalty information for a given token and sale price.
     *@dev This function overrides the royaltyInfo function from the ERC2981Upgradeable contract.
     *@param tokenId The identifier of the token.
     *@param salePrice The price at which the token is being sold.
     *@return The address of the royalty recipient and the royalty fee amount.
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    )
        public
        view
        virtual
        override(ERC2981Upgradeable)
        returns (address, uint256)
    {
        return super.royaltyInfo(tokenId, salePrice);
    }

    // function burnNft(
    //     address from,
    //     uint256 id,
    //     uint256 amount
    // ) public onlyOwner {
    //     require(from != address(0), "ZA"); //Zero address
    //     require(amount > 0, "IA"); // Invalid Amount
    //     require(id > 0, "II"); //Invalid Id
    //     _burn(from, id, amount);
    // }

    /**
     * @notice Returns a hash of the given offer, prepared using EIP712 typed data hashing rules.
     * @param voucher is a offer to hash.
     */

    function offerListingHash(
        structs.makeOffer memory voucher
    ) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "makeOffer(uint256 offernumber,uint256 tokenId,address offerMaker,address offerAccepter,uint256 offerAmount,uint256 askedQuantity)"
                        ),
                        voucher.offernumber,
                        voucher.tokenId,
                        voucher.offerMaker,
                        voucher.offerAccepter,
                        voucher.offerAmount,
                        voucher.askedQuantity
                    )
                )
            );
    }

    /**
     * @notice Verifies the signature for a given offer, returning the address of the signer.
     * @dev Will revert if the signature is invalid.
     * @param voucher is a offer describing the NFT to be sold
     */

    function verifyOfferListing(
        structs.makeOffer memory voucher
    ) public view returns (address) {
        bytes32 digest = offerListingHash(voucher);
        return ECDSAUpgradeable.recover(digest, voucher.signature);
    }

    /**
     * @dev `offerdetails` and will be used at the time of making offer
     * @param offerDetail is a offer describing the NFT to be sold
     * @param _isGlobal is a boolean value indicating whether the offer is global or single
     */

    function placeOffer(
        structs.makeOffer memory offerDetail,
        bool _isGlobal
    ) external {
        require(offerDetail.tokenId > 0, "IT"); //Invalid tokenID
        require(
            offerDetail.offerMaker == verifyOfferListing(offerDetail),
            "IO"
        ); // Invalid Offerer
        if (_isGlobal) {
            IERC20(USDC).transferFrom(
                msg.sender,
                address(this),
                offerDetail.offerAmount
            );

            offers[msg.sender].globalOffer[
                offerDetail.offernumber
            ] = offerDetail.offerAmount; //UPDATED  : ADDED *  tokenMinted[offerDetail.tokenId]

            emit placeOfferEvent(offerDetail.offernumber, offerDetail.tokenId, msg.sender, offerDetail.offerAccepter, offerDetail.offerAmount, offerDetail.askedQuantity,"Global Offer");
        } else {
            require(
                balanceOf(offerDetail.offerAccepter, offerDetail.tokenId) >=
                    offerDetail.askedQuantity,
                "INB"
            ); //Insufficient NFT balance

            IERC20(USDC).transferFrom(
                msg.sender,
                address(this),
                offerDetail.offerAmount * offerDetail.askedQuantity
            );

            offers[msg.sender].singleOffer[offerDetail.offernumber] =
                offerDetail.offerAmount *
                offerDetail.askedQuantity; //UPDATED  : ADDED *  tokenMinted[offerDetail.tokenId]
        }

         emit placeOfferEvent(offerDetail.offernumber, offerDetail.tokenId, msg.sender, offerDetail.offerAccepter, offerDetail.offerAmount, offerDetail.askedQuantity,"Single Offer ");
        
    }

    /**
     * @notice This function will be used to refund the locked funds if the offer is not fullfilled or rejected
     * @param _tokenId is the unique token ID for the NFT
     * @param _offerNumber is the offer number for the offer to be refunded
     * @param _isGlobal is a boolean value indicating whether the offer is global or single
     */
    function refund(
        uint256 _tokenId,
        uint256 _offerNumber,
        bool _isGlobal
    ) external {
        require(tokenMinted[_tokenId] > 0, "IT"); // Invalid Token
        if (_isGlobal) {
            require(offers[msg.sender].globalOffer[_offerNumber] > 0, "ION"); // Invalid Offer Number //check
            uint256 paidPrice = offers[msg.sender].globalOffer[_offerNumber];
            uint256 aquiredSharePrice = balanceOf(msg.sender, _tokenId) *
                (paidPrice / tokenMinted[_tokenId]);
            uint256 refundPrice = paidPrice - aquiredSharePrice;
            offers[msg.sender].globalOffer[_offerNumber] = 0;
            IERC20(USDC).transfer(msg.sender, refundPrice);

            emit refundEvent(_offerNumber, _tokenId, msg.sender, refundPrice, "Global Offer");

        } else {
            require(offers[msg.sender].singleOffer[_offerNumber] != 0, "ION"); // Invalid Offer Number

            uint256 refundPrice = offers[msg.sender].singleOffer[_offerNumber];
            offers[msg.sender].singleOffer[_offerNumber] = 0;
            IERC20(USDC).transfer(msg.sender, refundPrice);

              emit refundEvent(_offerNumber, _tokenId, msg.sender, refundPrice, "Single Offer");
        }
    }

    /**
     * @notice this function will be used to transfer shares at the time of accepting offer
     * @param voucher is a offer describing the NFT to be sold
     * @param _isGlobal is a boolean value indicating whether the offer is global or single
     */
    function acceptOffer(
        structs.makeOffer memory voucher,
        bool _isGlobal
    ) external {
        require(voucher.offerMaker == verifyOfferListing(voucher), "IO"); // Invalid Offer maker
        uint256 transferAmount;
        uint256 tokenTransfer;
        address royaltyReceiver;
        uint256 royaltyFee;
        if (_isGlobal) {
            transferAmount = balanceOf(msg.sender, voucher.tokenId);
            tokenTransfer =
                (voucher.offerAmount * transferAmount) /
                tokenMinted[voucher.tokenId];

            (address royaltyKeeper, uint256 royaltyAmount) = royaltyInfo(
                voucher.tokenId,
                voucher.offerAmount
            );
            royaltyReceiver = royaltyKeeper;
            royaltyFee = royaltyAmount;

            IERC20(USDC).transfer(
                voucher.offerAccepter,
                (tokenTransfer - royaltyFee)
            );

            IERC20(USDC).transfer(royaltyReceiver, royaltyFee);

            emit acceptOfferEvent(voucher.offernumber, voucher.tokenId, voucher.offerMaker, msg.sender, transferAmount, tokenTransfer, "Global Offer" , royaltyReceiver , royaltyFee);


        } else {
            require(msg.sender == voucher.offerAccepter, "IA"); // Invalid Offer Accepter

            require(balanceOf(msg.sender, voucher.tokenId) > 0, "INA"); //Insufficient NFT Amount

            transferAmount = voucher.askedQuantity;
            tokenTransfer =
                (voucher.offerAmount * transferAmount) /
                tokenMinted[voucher.tokenId];
            (address royaltyKeeper, uint256 royaltyAmount) = royaltyInfo(
                voucher.tokenId,
                voucher.offerAmount
            );
            royaltyReceiver = royaltyKeeper;
            royaltyFee = royaltyAmount;

            IERC20(USDC).transfer(
                voucher.offerAccepter,
                (tokenTransfer - royaltyFee)
            );

            IERC20(USDC).transfer(royaltyReceiver, royaltyFee);
        }

        _safeTransferFrom(
            msg.sender,
            voucher.offerMaker,
            voucher.tokenId,
            transferAmount,
            ""
        );

          emit acceptOfferEvent(voucher.offernumber, voucher.tokenId, voucher.offerMaker, msg.sender, transferAmount, tokenTransfer, "Single Offer" , royaltyReceiver , royaltyFee);

    }

    /**
     * @dev `tokenId`, `offerNumber`,  `_newOfferedPrice` and  `_isGlobal` will be used at the time of upgrading the offer
     * @param _tokenId is the unique token ID for the NFT for which the offer is to be upgraded
     * @param _offerNumber is the offer number for the offer to be upgraded
     * @param _newOfferedPrice is the new offered amount from the offerer
     * @param _isGlobal is a boolean value indicating whether the offer is global or single
     */
    function upgradeOffer(
        uint256 _tokenId,
        uint256 _offerNumber,
        uint256 _newOfferedPrice,
        bool _isGlobal
    ) external {
        require(tokenMinted[_tokenId] > 0, "IT"); //Invalid Token
      
        if (_isGlobal) {
            require(offers[msg.sender].globalOffer[_offerNumber] != 0, "ION"); //Invalid Offer No.
            uint256 previousPrice = offers[msg.sender].globalOffer[
                _offerNumber
            ];

            require(_newOfferedPrice > previousPrice, "IOP"); //Invalid Offered Price
            offers[msg.sender].globalOffer[_offerNumber] = _newOfferedPrice;

            IERC20(USDC).transferFrom(
                msg.sender,
                address(this),
                (_newOfferedPrice - previousPrice)
            );

            emit upgradeOfferEvent(_offerNumber,_tokenId, msg.sender, _newOfferedPrice, "Global Offer");
        } else {
            
            require(offers[msg.sender].singleOffer[_offerNumber] != 0, "ION"); //Invalid Offer No.
            uint256 previousPrice = offers[msg.sender].singleOffer[
                _offerNumber
            ];

            require(_newOfferedPrice > previousPrice, "IOP"); //Invalid Offered Price
            offers[msg.sender].singleOffer[_offerNumber] = _newOfferedPrice;
            IERC20(USDC).transferFrom(
                msg.sender,
                address(this),
                (_newOfferedPrice - previousPrice)
            );

             emit upgradeOfferEvent(_offerNumber,_tokenId, msg.sender, _newOfferedPrice, "Single Offer");
        }
    }

    function totalSupply(uint256 _tokenId) external view returns(uint){
        return tokenMinted[_tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC2981Upgradeable, ERC1155Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981Upgradeable).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
