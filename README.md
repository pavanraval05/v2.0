# v2.0

Version 2.0
Read the ERC721 EIP and OpenZeppellin implementation.\
Create a new directory in your Github repo called v2.0 and initialize a new hardhat project.\
Copy over any files you can reuse from the previous versions of this project into the directory for this version.\
Understand how the ERC721 contract works by downloading an off-the-shelf version from OpenZeppellin, and write test cases so you understand how to create NFT contracts, how to mint NFTs, and how to transfer them. ERC721 is the official name for Ethereum’s NFT contract specification.\  
To add contracts from OpenZeppellin into your project, definitely use npm to download them. The OpenZeppellin contracts have a lot of dependencies, and thus copying and pasting them will 1) take a lot of time, 2) will make it hard to upgrade to newer versions, 3) increase the vulnerability scope of your project, and 4) make it more likely for those contracts to get changed by you or your team.\
Create a new contract called NFTDutchAuction.sol. It should have the same functionality as BasicDutchAuction.sol but it sells an NFT instead of a physical item. The constructor for the NFTDutchAuction.sol should be:\
constructor(address erc721TokenAddress, uint256 _nftTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement)\
Write test cases to thoroughly test your contracts. Generate a Solidity coverage report and commit it to your repository under this version’s directory.
