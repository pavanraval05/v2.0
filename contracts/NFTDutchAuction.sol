// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract NFTDutchAuction {
    address payable public seller;
    IERC721 public nftToken;
    uint256 public nftTokenId;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public initialPrice;
    uint256 public auctionStartTime;
    uint256 public auctionEndTime;
    uint256 public currentPrice;
    bool public auctionEnded;

    constructor(
        address _nftTokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        seller = payable(msg.sender);
        nftToken = IERC721(_nftTokenAddress);
        nftTokenId = _nftTokenId;
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

        auctionStartTime = block.number;
        auctionEndTime = auctionStartTime + numBlocksAuctionOpen;

        initialPrice = reservePrice + offerPriceDecrement * (numBlocksAuctionOpen - 1);
        currentPrice = initialPrice;
        auctionEnded = false;
    }
    
    function getCurrentPrice() external view returns (uint256) {
	    uint256 blocksPassed = block.number - auctionStartTime;
	    if (blocksPassed >= numBlocksAuctionOpen) {
		return reservePrice;
	    } else {
		return initialPrice - blocksPassed * offerPriceDecrement;
	    }
	}

	    function bid() external payable {
	    require(!auctionEnded, "Auction has already ended");
        require(block.number <= auctionEndTime, "Auction has exceeded the maximum number of blocks");
	    require(msg.value >= initialPrice - (block.number - auctionStartTime + 1)*offerPriceDecrement, "Bid amount is less than the current price");

	    seller.transfer(msg.value);
	    nftToken.safeTransferFrom(address(this), msg.sender, nftTokenId);

	    auctionEnded = true;
	}

    function cancelAuction() external {
        require(msg.sender == seller, "Only the seller can cancel the auction");
	
        require(!auctionEnded, "Auction has already ended");

        auctionEnded = true;
        nftToken.safeTransferFrom(address(this), seller, nftTokenId);
    }
}

