// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NoRoyalty is Initializable, ERC1155Upgradeable, OwnableUpgradeable {
    function initialize(string memory baseURI) public initializer {
        __ERC1155_init(baseURI);
        __Ownable_init();
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) external onlyOwner {
        _mint(account, id, amount, data);
    }

    function safeTransfer(uint256 id , uint256 amount , address _seller , address _buyer) external{
        _safeTransferFrom(_seller, _buyer, id, amount,"");

   }
   

    
    }
