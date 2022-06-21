pragma solidity >=0.4.21 <0.7.0;

import './Ownable.sol';

contract Storychain is Ownable {

  struct Book {
     string recordHash;
     string authorName;
     string title;
     string email;
    uint timestamp;
    bool isDocExists;
  }

  mapping( string => Book) public documentdata;

  event _NewBookAuth( string indexed recordHash,  string authorName,  string title,  string email, uint256 timestamp, bool isDocExists);

  function authNewBook( string calldata recordHash,  string calldata authorName,  string calldata title,  string calldata email) external {

    // I could use StringUtils here, but this is simpler
    require(keccak256( abi.encodePacked(recordHash)) != keccak256(""));

    Storychain.Book storage bookdata = documentdata[recordHash];
    bookdata.recordHash = recordHash;
    bookdata.authorName = authorName;
    bookdata.title = title;
    bookdata.email = email;
    bookdata.timestamp = block.timestamp;
    bookdata.isDocExists = true;

    emit _NewBookAuth(recordHash, authorName, title, email, block.timestamp, true);
  }


  function exists( string memory record) view public returns(bool) {
    return documentdata[record].isDocExists;
  }

  function getBookDetailFromHash( string memory record) view public returns (  string memory, string memory, string memory,uint256) {
    return  ( documentdata[record].authorName , documentdata[record].title, documentdata[record].email, documentdata[record].timestamp );
  }

}