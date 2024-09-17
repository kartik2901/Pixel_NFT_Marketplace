// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract dabb20 is ERC20Upgradeable {
    constructor() {}

    function Initialize() public initializer {
        __ERC20_init_unchained("DABBLER", "DABB");
        _mint(msg.sender,100000000*10**18);
    }

    function mintdabb(uint256 _amount) public {
        _mint(msg.sender, _amount);
    }


     function decimals() public view virtual override(ERC20Upgradeable) returns (uint8) {
		return 18;
	}


}
