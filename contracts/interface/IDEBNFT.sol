//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

interface IDEBNFT is IERC2981Upgradeable {
    function initialize(
        string memory _uri,
        address _admin,
        uint96 _defaultRoyalty,
        address _marketPlace
    ) external;

    // IDEBNFT(voucher.nftAddress).lazyMinting(voucher.tokenId, amountToBuy, voucher.seller, msg.sender, voucher.royaltyFee);

    function lazyMint(
        uint256 _tokenId,
        uint256 _amount,
        address _seller,
        uint96 _royaltyFee
    ) external;
 
 function balanceOf(address account, uint256 id) external returns (uint256);
  

 function safeMint(
        address recipient,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

//     function safemintbatch(
//         address  recipient,
//         uint256[] memory _tokenIds,
//         uint256[] memory nftamounts
//     ) external;
 
//  function safeBatchTransfer(
//         address from,
//         address to,
//         uint256[] memory ids,
//         uint256[] memory amounts,
//         bytes memory data
//     ) external;

    function safeTransferFrom(
        uint256 _tokenId,
        uint256 _amount,
        address _seller,
        address _buyer
    ) external;

    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address, uint256);

function totalSupply(uint256 _tokenId) external view returns(uint);

    function supportsInterface(
        bytes4 interfaceId
    ) external view override returns (bool);
}
