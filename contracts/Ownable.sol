// SPDX-License-Identifier: MIT

pragma solidity >=0.4.21 <0.7.0;

/*
 * Ownable
 *
 * Base contract with an owner.
 * Provides onlyOwner modifier, which prevents function from running if it is called by anyone other than the owner.
 */
contract Ownable {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }


    modifier onlyOwner() {
        if (msg.sender == owner)
            _; //run the function body
    }

    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner != address(0)) owner = newOwner;
    }




}
