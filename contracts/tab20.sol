// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract tabb20 is ERC20Upgradeable {
    constructor() {}

    function Initialize() public initializer {
        __ERC20_init_unchained("TABBLER", "TABB");
    }

    function mintdabb(uint256 _amount) public {
        _mint(msg.sender, _amount);
    }
}
