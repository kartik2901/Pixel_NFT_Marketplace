// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;


import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./library/structs.sol";
import "./interface/IDEBNFT.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "hardhat/console.sol";



contract MarketPlace is EIP712Upgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    // Address for admin
    address public admin;
    // Address for USDC contract
    address private usdc;
    // Address for NFT contract
    address NFT;
    //Platform fee
    uint256 public platformFee;


    address UniswapV2Router02 ;
    address UniswapFactory;


    // Mapping for used Listing vouchers
    mapping(uint256 => bool) public usedListingCounters;
    // Mapping of the counter to the amount left in voucher
    mapping(uint256 => uint256) private amountLeft;
    // Mapping used to check the order ID
    mapping(uint256 => bool) private usedOrderID;

    bytes4 private constant FUNC_Selector =
        bytes4(keccak256("royaltyInfo(uint256 ,uint256)"));

    event TransferNFT(
        address _fromAddress,
        address _toAddress,
        uint256 _orderId,
        uint256 _totalPrice,
        address _currency,
        uint256 _askedQty,      
        uint256 _counter,
        uint256 _tokenID

    );

    

    /**
     * Constructor function for disabling the initialization of the implementation.
     */
    constructor() {
        // _disableInitializers();
    }

    /**
     * @dev Initializes the marketplace contract with initial values.
     * @param _NFT The address of the NFT contract.
     * @param _defaultPlatformfee The default platform fee in wei.
     * @param _UniswapV2Router02 The address of the Uniswap V2 Router contract.
     * @param _UniswapFactory The address of the Uniswap Factory contract.
     */

    function initialize(
        address _NFT,
        uint256 _defaultPlatformfee,
         address _UniswapV2Router02,
         address _UniswapFactory
    ) public initializer {
        __Ownable_init_unchained();
        __EIP712_init_unchained("marketPlace", "1");
        __ReentrancyGuard_init();
        NFT = _NFT;
        admin = msg.sender;
        platformFee = _defaultPlatformfee;
        UniswapV2Router02 = _UniswapV2Router02;
        UniswapFactory = _UniswapFactory;
        

    }


    /**
    * @dev Sets a new platform fee percentage.
    * @param _newFee The new platform fee to be set, expressed as a percentage.
    * Must be greater than 0 
    * @notice Only the owner of the contract can call this function.
    */
    function setPlatformFee(uint256 _newFee) public onlyOwner {
        require(_newFee > 0, "exceeding limit");
        platformFee = (_newFee);
    }
 
    /**
    * @dev Sets a new admin address.
    * @param _newAdmin The new admin address to be set.
    * @notice Only the owner of the contract can call this function.
    * @param _newAdmin The new admin address to be set.
    * The new admin address must not be the zero address.
    */
    
    function setAdmin(address _newAdmin) public onlyOwner {
        require(_newAdmin != address(0), "Zero Address");
        admin = _newAdmin;
    }


    /**
     * @notice Returns a hash of the given shareSeller, prepared using EIP712 typed data hashing rules.
     * @param voucher is a shareSeller to hash.
     */

    function priListingHash(
        structs.primaryBuy memory voucher
    ) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "primaryBuy(address nftAddress,address seller,uint256 amount,uint256 tokenId,uint256 pricePerShare,uint256 counter,uint96 royaltyFee,bool isPrimary,string tokenUri)"
                        ),
                        voucher.nftAddress,
                        voucher.seller,
                        voucher.amount,
                        voucher.tokenId,
                        voucher.pricePerShare,
                        voucher.counter,
                        voucher.royaltyFee,
                        voucher.isPrimary,
                        keccak256(bytes(voucher.tokenUri))
                    )
                )
            );
    }

    /**
     * @notice Verifies the signature for a given shareSeller, returning the address of the signer.
     * @dev Will revert if the signature is invalid. Does not verify that the signer is owner of the NFT.
     * @param voucher is a shareSeller describing the NFT to be sold
     */
    function priListingVerify(
        structs.primaryBuy memory voucher
    ) public view returns (address) {
        bytes32 digest = priListingHash(voucher);
        return ECDSAUpgradeable.recover(digest, voucher.signature);
    }

    /**      
     *@notice Checks whether the given NFT contract at the specified address supports the IERC2981Upgradeable interface.
     *@param nftAddress The address of the NFT contract to check.
     *@return A boolean indicating whether the NFT contract supports the IERC2981Upgradeable interface.
     */
    function checkFunc(address nftAddress) public view returns (bool) {
        bool success;
        bytes4 interfaceId = type(IERC2981Upgradeable).interfaceId;

        success = IDEBNFT(nftAddress).supportsInterface(interfaceId);
        return (success);
    }
  
      /**
    * @dev Internal function for swapping tokens on Uniswap and transferring the result to the contract.
    * @param _amountsOut The desired amount of tokens to receive from the swap.
    * @param _currency The address of the token to be swapped.
    * @notice This function is used internally and should only be called from within the contract.
    * The token transfer from the caller to this contract must succeed.
    * Approval for spending the input tokens by UniswapRouter must succeed.
    * @notice The actual amount to be swapped may differ from _amountsIn due to slippage.
    * @dev Defines the token swap path using UniswapRouter's WETH as the intermediate token.
    * @dev Executes the token swap on UniswapRouter for the exact amount of ETH desired.
    * @dev Emits the Swap event with details about the swap transaction.
    */

       function swapandTransfer(uint256 _amountsOut,uint256 _amountsIn , address _currency) internal {
        
        // Ensure the token transfer from the caller to this contract succeeds
        require(IERC20(_currency).transferFrom(msg.sender , address(this), _amountsIn) , "Transfer Failed");

        // Ensure approval for spending the input tokens by UniswapRouter succeeds
        require(IERC20(_currency).approve(address(UniswapV2Router02), _amountsIn), 'Approve failed');
 
        // Calculate the maximum amount of input tokens based on the desired output
        uint256 amountInMax = getPrice(_amountsOut, _currency);
    
        
        // Define the token swap path
        address[] memory path = new address[](2);
        path[0] = address(_currency);
        path[1] = IUniswapV2Router01(UniswapV2Router02).WETH();

    
        // Perform the token swap on UniswapRouter for the exact amount of ETH desired
        IUniswapV2Router02(UniswapV2Router02).swapTokensForExactETH(_amountsOut,amountInMax, path , address(this) , block.timestamp);


    }

    /**
    * @dev Handles the purchase of NFTs in both primary and secondary markets.
    * @param voucher The struct containing information about the NFT being purchased.
    * @param amountToBuy The quantity of NFTs to be purchased.
    * @param orderID The unique order ID associated with the purchase.
    * @param currency The address of the currency used for the purchase.
    * @notice This function is used to buy NFTs from both primary and secondary markets.
    * The NFT address in the voucher must be a valid address.
    * The signature verification using priListingVerify must return the correct signer.
    * The signer must be the seller specified in the voucher.
    * The order ID must not have been used before.
    * @dev Calls primarySale or secondarySale based on whether the sale is primary or secondary.
    * @dev Mints new tokens if it's a primary sale and transfers ownership using safeTransfer.
    */

   

    function buy(
        structs.primaryBuy memory voucher,
        uint256 amountToBuy,
        uint256  orderID,
        address currency
    ) public payable nonReentrant{

        // Ensure the NFT address in the voucher is valid
        require(voucher.nftAddress != address(0), "INA");
            
        // Verify the signature and get the signer address
        address signer = priListingVerify(voucher);
     

        // Ensure the signer is the same as the seller in the voucher
        require(signer == voucher.seller, "IV"); //Invalid voucher

       
        // Ensure the order ID has not been used before
        require(!usedOrderID[orderID], "UID"); // used order ID

        // Set counter based on the voucher information
        setCounter(voucher, amountToBuy);
    

    
        // Check if it's a primary sale
        if (voucher.isPrimary) {

            // Handle primary sale
            primarySale(voucher, amountToBuy, currency,orderID);



            // Mint new tokens for the buyer
            IDEBNFT(NFT).lazyMint(
                voucher.tokenId,
                voucher.amount,
                voucher.seller,
                voucher.royaltyFee
            );

            
            // Transfer NFT ownership from the seller to the buyer
            IDEBNFT(voucher.nftAddress).safeTransferFrom(voucher.tokenId, amountToBuy, voucher.seller, msg.sender);


            

        } else {
            

            // Handle secondary sale
            secondarySale(voucher, amountToBuy, currency, orderID);

        
            // Transfer NFT ownership from the seller to the buyer
            IDEBNFT(voucher.nftAddress).safeTransferFrom(
                voucher.tokenId,
                amountToBuy,
                voucher.seller,
                msg.sender
            );
            
        }


        usedOrderID[orderID] = true ;

    }


    /**
   * @dev Internal function to calculate the total amount required for purchasing multiple NFTs.
   * @param voucher An array of structs containing information about the NFTs to be purchased.
   * @param amounts An array specifying the quantity of each NFT to be purchased.
   * @return The total amount required for the purchase.
   * @notice This function calculates the total cost of purchasing the specified quantity of each NFT.
   * @dev The calculation is based on the price per share specified in each voucher.
   */

    function _checkBalance(
        structs.primaryBuy[] memory voucher,
        uint256[] memory amounts
    ) internal pure returns (uint256) {
        uint256 vouchersLength = voucher.length;
        uint256 totalAmount;

    // Calculate the total amount based on the currency type

     
            for (uint8 i = 0; i < vouchersLength; i++) {
                
            // Multiply the price per share by the quantity of NFTs
            totalAmount += voucher[i].pricePerShare * amounts[i];
            }
            return totalAmount;
      
         
    }

    /**
    * @dev Handles the checkout process for purchasing multiple NFTs.
    * @param voucher An array of structs containing information about the NFTs to be purchased.
    * @param amounts An array specifying the quantity of each NFT to be purchased.
    * @param orderID The unique order ID associated with the purchase.
    * @param _currency The address of the currency used for the purchase.
    * @notice This function is used to buy NFTs from both primary and secondary markets.
    * The total value sent or available in the specified currency must be greater than or equal to the total cost.
    * The order ID must not have been used before.
    * @dev Calls primarySale or secondarySale based on whether the sale is primary or secondary.
    * @dev Mints new tokens if it's a primary sale and transfers ownership using safeTransfer.
    */

    function checkout(
        structs.primaryBuy[] memory voucher,
        uint256[] memory amounts,
        uint256 orderID,
        address _currency
        
    ) external payable nonReentrant{
        uint256 voucherLength = voucher.length;
        uint256 total = _checkBalance(voucher, amounts);
     
         // Ensure that the total value sent or available in the specified currency is sufficient

        require(msg.value >= total || IERC20(_currency).balanceOf(msg.sender) >=getPrice(total,_currency), "IF");
        
        
        // Ensure the order ID has not been used before 
        require(!usedOrderID[orderID], "UID"); // used order ID
        
        // Iterate through each voucher and perform the purchase
        for (uint i = 0; i < voucherLength; i++) {
           

           setCounter(voucher[i], amounts[i]);
           
               // Handle primary sale
               if (voucher[i].isPrimary) {
                
                primarySale(voucher[i], amounts[i], _currency, orderID);
     
               if(IDEBNFT(voucher[i].nftAddress).totalSupply(voucher[i].tokenId)==0){ 

                    // Mint new tokens for the buyer
                    IDEBNFT(voucher[i].nftAddress).lazyMint(
                    voucher[i].tokenId,
                    voucher[i].amount,
                    voucher[i].seller,
                    voucher[i].royaltyFee
                );

                IDEBNFT(voucher[i].nftAddress).safeTransferFrom(voucher[i].tokenId, amounts[i], voucher[i].seller, msg.sender);
               }
               else{
                require(IDEBNFT(voucher[i].nftAddress).balanceOf(voucher[i].seller,voucher[i].tokenId)>= amounts[i],"INB");
                IDEBNFT(voucher[i].nftAddress).safeTransferFrom(voucher[i].tokenId, amounts[i], voucher[i].seller, msg.sender);
               }
               
            } else {

               

                // Handle secondary sale
              
  console.log("counter", voucher[i].counter);
                // Transfer NFT ownership from the seller to the buyer
                secondarySale(voucher[i], amounts[i], _currency , orderID  );
              

              

                // Transfer NFT ownership from the seller to the buyer
                IDEBNFT(voucher[i].nftAddress).safeTransferFrom(
                    voucher[i].tokenId,
                    amounts[i],
                    voucher[i].seller,
                    msg.sender
                );
            }
        }

        usedOrderID[orderID] = true ;
    }

    /**
     * @dev Handles the primary sale of NFTs with support for both ETH and ERC-20 currencies.
    * @param _voucher The struct containing information about the NFT being purchased.
    * @param _amountToBuy The quantity of NFTs to be purchased.
    * @param _currency The address of the currency used for the purchase.
    * @param _orderId The unique order ID associated with the purchase.
    * @notice This function is used for the primary sale of NFTs, supporting both ETH and ERC-20 currencies.
    * The currency type must be valid (ETH or ERC-20).
    * The total amount to be paid must be sent with the transaction for ETH purchases.
    * The NFT address in the voucher must be a valid address.
    * The signature verification using priListingVerify must return the correct signer.
    * The signer must be the seller specified in the voucher.
    * The contract must receive the correct amount for the NFTs.
    * The platform fee must be transferred to the admin successfully.
    * @dev Emits a TransferNFT event with details about the purchase transaction.
    */


    function primarySale(
        structs.primaryBuy memory _voucher,
        uint256 _amountToBuy,
        address _currency,
        uint256 _orderId
    ) internal {
        // Check if the sale is in ETH

        uint256 nftSellAmount;

        if (_currency == address(1)) {

           
            // Calculate the total amount to be paid in ETH
             nftSellAmount = _voucher.pricePerShare * _amountToBuy; 
          
            // Calculate the platform fee amount
            uint256 platformFeeamount = ((_amountToBuy*_voucher.pricePerShare) * platformFee) / 10000;
          
            // Ensure the total value sent is sufficient
            require(msg.value >= nftSellAmount, "IA");

            // Ensure the NFT address in the voucher is valid
            require(_voucher.nftAddress != address(0), "INA"); // Invalid NFT Address



            // Ensure the signer is the same as the seller in the voucher
            require(priListingVerify(_voucher) == _voucher.seller, "IV"); //invalid voucher


           
            // Transfer the amount (excluding platform fee) to the seller
            (bool success1, ) = payable(_voucher.seller).call{
                value: (nftSellAmount - platformFeeamount)
            }("");


            // Transfer the platform fee to the admin
            (bool success, ) = payable(admin).call{value: platformFeeamount}(
                ""
            );

            // Ensure both transfers are successful
            require(success && success1, "ETF"); //ETH Transfer Failed


            
   


        } else {

            //ERC20 Currency

            require(_voucher.nftAddress != address(0), "INA"); // Invalid NFT Address
            require(priListingVerify(_voucher) == _voucher.seller, "IV"); //invalid voucher
             uint256 amount = _voucher.pricePerShare * _amountToBuy;
        

             nftSellAmount = getPrice((_voucher.pricePerShare * _amountToBuy),_currency);
            
            
            require(IERC20(_currency).balanceOf(msg.sender) >= nftSellAmount, "IB");

          
            swapandTransfer(amount,nftSellAmount, _currency);


            uint256 platformFeeamount = (amount*platformFee)/10000;

           
            require(address(this).balance >= amount , "IBC");
       
           (bool success4, ) = admin.call{ value:  platformFeeamount}("");
           (bool success3, ) = _voucher.seller.call{ value:  amount - platformFeeamount}("");


            require(success3 && success4, "ETF"); //ETH Transfer Failed



        }
                     emit TransferNFT(
                    _voucher.seller,
                    msg.sender,
                    _orderId,
                    nftSellAmount,
                    _currency,
                    _amountToBuy,
                    _voucher.counter,
                    _voucher.tokenId
                   
                );
    }

    /**
    * @dev Checks if the specified NFT contract supports the `royaltyInfo` function and retrieves royalty information.
    * @param _nftAddress The address of the NFT contract.
    * @param _tokenId The ID of the NFT.
    * @param _nftAmount The quantity of the NFT.
    * @return royaltyKeeperAddress The address of the royalty keeper.
    * @return royaltyKeeperAmount The amount of royalty to be paid.
    * @notice This function checks if the specified NFT contract supports the `royaltyInfo` function.
    * @dev If supported, it calls `royaltyInfo` and returns the royalty information.
    */


    function _checkRoyalty(address _nftAddress, uint256 _tokenId , uint256 _nftAmount ) view internal returns(address royaltyKeeperAddress, uint256 royaltyKeeperAmount){
        if (checkFunc((_nftAddress))) {
                (royaltyKeeperAddress,  royaltyKeeperAmount) = IDEBNFT(
                    _nftAddress
                ).royaltyInfo(_tokenId, _nftAmount);
            return (royaltyKeeperAddress, royaltyKeeperAmount);
            
    }

    }

    /**
    * @dev Handles the secondary sale of NFTs with support for both ETH and ERC-20 currencies.
    * @param _voucher The struct containing information about the NFT being purchased.
    * @param _amountToBuy The quantity of NFTs to be purchased.
    * @param _currency The address of the currency used for the purchase.
    * @param _orderId The unique order ID associated with the purchase.
    * @notice This function is used for the secondary sale of NFTs, supporting both ETH and ERC-20 currencies.
    * The currency type must be valid (ETH or ERC-20).
    * The user should not list nft's more than his balance
    * @dev Emits a TransferNFT event with details about the purchase transaction.
        */



    function secondarySale(
        structs.primaryBuy memory _voucher,
        uint256 _amountToBuy,
        address _currency,
        uint256 _orderId
    ) internal 
{


    require(IDEBNFT(_voucher.nftAddress).balanceOf(_voucher.seller, _voucher.tokenId) >=_amountToBuy, "INFT"); //Insufficient NFT to list


        uint256 nftAmount;
        if (_currency == address(1)) 
        {
            require(_voucher.nftAddress != address(0), "INA"); // Invalid NFT Address

            require(priListingVerify(_voucher) == _voucher.seller, "IV"); //invalid voucher

             nftAmount = _amountToBuy * _voucher.pricePerShare;
            uint256 platformFeeamountGlobal = (nftAmount * platformFee) / 10000;


            require(msg.value >= nftAmount, "IA");
            (address royaltyKeeper, uint256 royaltyAmount) = _checkRoyalty(_voucher.nftAddress , _voucher.tokenId , nftAmount);

             
          
               
            
                (bool success, ) = payable(admin).call{
                    value: platformFeeamountGlobal
                }("");
                
                (bool success_1, ) = payable(royaltyKeeper).call{
                    value: royaltyAmount
                }(""); 

                require(success && success_1, "RTF"); //Royalty Transfer Failed

                (bool successful, ) = _voucher.seller.call{
                    value: nftAmount - (royaltyAmount + platformFeeamountGlobal)
                }(""); //Amount - royalty fee - platformFeeamountGlobal

                

                require(successful, "ATF"); //Amount Transfer


        } 
        else {
            
       
            
            require(_voucher.nftAddress != address(0), "INA"); // Invalid NFT Address
 
            require(priListingVerify(_voucher) == _voucher.seller, "IV"); //invalid voucher
    
             uint256 amount = (_voucher.pricePerShare * _amountToBuy);

             nftAmount = getPrice(amount,_currency);

            


            require(IERC20(_currency).balanceOf(msg.sender) >= nftAmount, "IB");
            
            swapandTransfer(amount,nftAmount, _currency);
             
            require(address(this).balance >= amount , "IBC");

            
            uint256 platformFeeamount = (amount*platformFee)/10000;
            
           (address royaltyKeeper,uint256 royaltyAmount) = _checkRoyalty(_voucher.nftAddress, _voucher.tokenId, amount);
               
               
                (bool success4, ) = _voucher.seller.call{
                    value:   amount -(royaltyAmount+platformFeeamount)
                }("");
    
                (bool success5, ) = admin.call{
                    value:   platformFeeamount
                  }("");

                (bool success6, ) = royaltyKeeper.call{
                    value:   royaltyAmount
                }("");

                
                require(success4 && success5 && success6 ,"ETF"); //ETH transfer failed



             


        }
                    emit TransferNFT(
                    _voucher.seller,
                    msg.sender,
                    _orderId,
                    nftAmount,
                    _currency,
                    _amountToBuy,
                    _voucher.counter,
                    _voucher.tokenId
                   
                );

   }



        


    /**
     * @notice This is the internal function used to set the counter for the seller
     * @param _nftListing is a shareSeller describing the NFT to be sold
     * @param amountToBuy is amount of shares of NFT to be bought
     */
    function setCounter(
        structs.primaryBuy memory _nftListing,
        uint256 amountToBuy
    ) internal {
        //Counter used
        require(!usedListingCounters[_nftListing.counter], "CU"); //counter used

        uint256 leftCounter = amountLeft[_nftListing.counter];

        if (leftCounter == 0) {
            leftCounter = _nftListing.amount - amountToBuy;
        } else {
            require(leftCounter>=amountToBuy,"NEQ");//Not enough quantity
            leftCounter = leftCounter - amountToBuy;
        }
        require(leftCounter >= 0, "ALZ"); //Amount left less than zero

        amountLeft[_nftListing.counter] = leftCounter;
        if (leftCounter == 0) usedListingCounters[_nftListing.counter] = true;
    }

    /**
     * @notice This function is used to airDrop the minted nfts to multiple address
     * @param addresses is the list of addresses
     * @param nftAmount is the list of nfts
     * @param tokenId is the token id to be minted and transfered
     */
    function airDropNft(
        address[] memory addresses,
        uint8[] memory tokenId,
        uint256[] memory nftAmount
    ) public onlyOwner {
        require(
            addresses.length == nftAmount.length &&
                nftAmount.length == tokenId.length,
            "Length mismatch"
        );


        for (uint8 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "ZA"); //Zero Address
            require(tokenId[i] != 0, "Token ID cannot be zero");
            require(nftAmount[i] != 0, "NFT cannot be zero");

            IDEBNFT(NFT).safeMint(msg.sender, tokenId[i], nftAmount[i], "");

            IDEBNFT(NFT).safeTransferFrom(
                tokenId[i],
                nftAmount[i],
                msg.sender,
                addresses[i]
            );
        }
    }

    /**
    * @dev Calculates the input amount required to obtain a specified output amount
    * using the UniswapV2Router02 contract.
    * @param amountOut The desired output amount.
    * @param token The address of the token for which the input amount is calculated.
    * @return amountIn The calculated input amount needed to achieve the desired output.
     */


       function getPrice(
        uint256 amountOut,
        address token
    ) public view returns (uint256 amountIn) {

       
       address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = IUniswapV2Router01(UniswapV2Router02).WETH();
        uint[] memory amounts = new uint[](2);

        amounts =  IUniswapV2Router02(UniswapV2Router02).getAmountsIn(amountOut, path);
        
        return amounts[0];
    }

        receive() external payable {}


}
