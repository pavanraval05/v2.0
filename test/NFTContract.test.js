const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployMockContract } = require("@ethereum-waffle/mock-contract");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFTContract", function () {
  let nftContract;
  let erc721Mock;
  let seller;
  let buyer;

  const reservePrice = ethers.utils.parseEther("1");
  const numBlocksAuctionOpen = 10;
  const offerPriceDecrement = ethers.utils.parseEther("0.1");
  const tokenId = 1;

  beforeEach(async function () {
	[seller, buyer] = await ethers.getSigners();

	const ERC721Mock = await ethers.getContractFactory("ERC721Mock");
	erc721Mock = await ERC721Mock.deploy("MyNFT", "NFT");

	const NFTDutchAuction = await ethers.getContractFactory("NFTDutchAuction");
	nftContract = await NFTDutchAuction.deploy(
  	erc721Mock.address,
  	tokenId,
  	reservePrice,
  	numBlocksAuctionOpen,
  	offerPriceDecrement
	);
  });

  it("Should initialize the contract with correct values", async function () {
	expect(await nftContract.seller()).to.equal(seller.address);
	expect(await nftContract.nftToken()).to.equal(erc721Mock.address);
	expect(await nftContract.nftTokenId()).to.equal(tokenId);
	expect(await nftContract.reservePrice()).to.equal(reservePrice);
	expect(await nftContract.numBlocksAuctionOpen()).to.equal(numBlocksAuctionOpen);
	expect(await nftContract.offerPriceDecrement()).to.equal(offerPriceDecrement);
	expect(await nftContract.initialPrice()).to.equal(
  	reservePrice.add(offerPriceDecrement.mul(numBlocksAuctionOpen - 1))
	);
	expect(await nftContract.currentPrice()).to.equal(
  	reservePrice.add(offerPriceDecrement.mul(numBlocksAuctionOpen - 1))
	);
	expect(await nftContract.auctionEnded()).to.be.false;
  });

it("should allow a bidder to place a bid and transfer the NFT", async function () {
	const bidAmount = reservePrice.add(offerPriceDecrement.mul(numBlocksAuctionOpen - 1));
		expect(await nftContract.getCurrentPrice()).to.equal(ethers.utils.parseEther("1.9"));
	await erc721Mock.connect(buyer).mint(nftContract.address);

	await ethers.provider.send("evm_mine");

	await nftContract.connect(buyer).bid({ value: bidAmount });
	expect(nftContract.connect(buyer).bid({ value: bidAmount })).to.be.revertedWith("Auction has already ended");


	expect(await erc721Mock.ownerOf(tokenId)).to.equal(buyer.address);
	expect(await nftContract.auctionEnded()).to.be.true;
  });

   it("Should allow the seller to cancel the auction before it ends", async function () {
    await erc721Mock.connect(seller).mint(nftContract.address);

    await ethers.provider.send("evm_mine");

    await nftContract.connect(seller).cancelAuction();

    expect(await nftContract.auctionEnded()).to.be.true;
    expect(await erc721Mock.ownerOf(tokenId)).to.equal(seller.address);
  });

  it("Should not allow a bidder to place a bid below the current price", async function () {
	const bidAmount = reservePrice.add(offerPriceDecrement.mul(numBlocksAuctionOpen - 5));

	await erc721Mock.connect(buyer).mint(nftContract.address);

	await ethers.provider.send("evm_mine");

	expect(await nftContract.connect(buyer).bid({ value: bidAmount })).to.be.revertedWith("Bid amount is less than the current price");
  });

it("Buyer cannot cancel the aution", async function () {
	const bidAmount = reservePrice.add(offerPriceDecrement.mul(numBlocksAuctionOpen - 2));

	await erc721Mock.connect(buyer).mint(nftContract.address);

	await ethers.provider.send("evm_mine");

	await expect(nftContract.connect(buyer).cancelAuction()).to.be.revertedWith("Only the seller can cancel the auction");
  });

 it("Cannot the cancel auction After the Auction is already ended", async function () {
  await erc721Mock.connect(seller).mint(nftContract.address);
	const bidAmount = reservePrice.add(offerPriceDecrement.mul(numBlocksAuctionOpen - 1));
  await ethers.provider.send("evm_mine");
	await nftContract.connect(buyer).bid({ value: bidAmount });
  expect(await nftContract.auctionEnded()).to.be.true;

  await expect(nftContract.connect(seller).cancelAuction()).to.be.revertedWith("Auction has already ended")

  expect(await nftContract.auctionEnded()).to.be.true;
  await expect(nftContract.connect(seller).cancelAuction()).to.be.revertedWith("Auction has already ended");
});

 it("When 20 blocks are mined the auction should not let anyone to bid", async function () {
 mine(20);
  expect(await nftContract.getCurrentPrice()).to.equal(ethers.utils.parseEther("1"));
  await expect(nftContract.connect(buyer).bid({ value: ethers.utils.parseEther("1.1") })).to.be.revertedWith("Auction has exceeded the maximum number of blocks");
});



});


