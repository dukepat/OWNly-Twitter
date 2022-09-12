const { assert, expect } = require("chai")
const { network, deployments, ethers } = require('hardhat')
const { developmentChains } = require("../../helper-hardhat-config")
const { storeImage, storeTokenUriMetadata } = require("../../utils/uploadToPinata")
const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("TwitterNft", function () {
        let deployerTwitterNft
        let contentCreatorTwitterNft
        let followerTwitterNft
        let deployer
        let contentCreator
        let follower
        beforeEach(async () => {
            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            contentCreator = accounts[1]
            follower = accounts[2]
            // Deploy all contracts tagged with phrase 'all'
            //await deployments.fixture(['all'])
            twitterNftFactory = await ethers.getContractFactory("TwitterNft")
            deployerTwitterNft = await twitterNftFactory.deploy()
            contentCreatorTwitterNft = deployerTwitterNft.connect(contentCreator)
            followerTwitterNft = deployerTwitterNft.connect(follower)
            initialBalance = ethers.utils.parseEther('0.01')
            console.log(10)
            let tx = {
                to: deployerTwitterNft.address,
                // Convert currency unit from ether to wei
                value: initialBalance
            }
            // Send a transaction
            let txObj = await contentCreator.sendTransaction(tx)
            console.log(txObj)
            txObj = await follower.sendTransaction(tx)
            console.log(txObj)

        })

        describe("constructor", function () {
            it("deploys ERC721 correctly", async () => {
                expected = {
                    name: "OWNly Tweet NFT",
                    symbol: "OTT"
                }
                const tokenName = await deployerTwitterNft.name()
                const tokenSymbol = await deployerTwitterNft.symbol()
                assert.equal(tokenName.toString(), expected.name)
                assert.equal(tokenSymbol.toString(), expected.symbol)
            })
        })

        describe("deployNftParams", function () {
            it("deploys ERC721 parameters customized by the content creator once the deployFee is set", async () => {
                //Arrange
                const deployFee = await ethers.utils.parseEther('0.001')
                const transferable = true
                const transferLimit = 2
                const tweetId = 2221
                const mintFee = await ethers.utils.parseEther('0.001')
                const maxMintableAmount = 10

                //Act
                await deployerTwitterNft.setDeployFee(+deployFee)
                await contentCreatorTwitterNft.deployNftParams(transferable,
                    transferLimit,
                    tweetId,
                    +mintFee,
                    maxMintableAmount
                ) //from: contentCreator,
                await followerTwitterNft.mintToken(tweetId) //from: follower,
                await followerTwitterNft.setTokenURI(0, "TestURI")

                const receivedTweetId = await followerTwitterNft.getTweeIdByTokenId(0)
                const receivedDeployFee = await followerTwitterNft.getDeployFee()
                const receivedTransferable = await followerTwitterNft.getTransferabilityOfToken(0)
                const receivedTransferLimit = await followerTwitterNft.getTransferLimitOfToken(0)
                const receivedMintFee = await followerTwitterNft.getMintFeeByTweetId(tweetId)

                //Assert
                assert.equal(tweetId.toString(), receivedTweetId.toString())
                assert.equal(deployFee.toString(), receivedDeployFee.toString())
                assert.equal(transferable.toString(), receivedTransferable.toString())
                assert.equal(transferLimit.toString(), receivedTransferLimit.toString())
                assert.equal(mintFee.toString(), receivedMintFee.toString())

            })

            it("prevents from deployment with fewer ETH", async () => {
                const deployFee = await ethers.utils.parseEther('0.001')
                const transferable = false

                await deployerTwitterNft.setDeployFee(+deployFee)
                await expect(deployerTwitterNft.deployNftParams( // has no ETH in VAULT
                    transferable,
                    0,
                    2,
                    0,
                    3
                )).to.be.revertedWith("Need more ETH")
            })

            it("prevents from deployment of the Nft already deployed", async () => {
                const transferable = false
                const deployFee = await ethers.utils.parseEther('0.001')
                await deployerTwitterNft.setDeployFee(+deployFee)
                contentCreatorTwitterNft.deployNftParams(
                    transferable,
                    0,
                    2,
                    0,
                    3
                )
                await expect(contentCreatorTwitterNft.deployNftParams(
                    transferable,
                    0,
                    2,
                    0,
                    3
                )).to.be.revertedWith("This tweet is already deployed")
            })
        })
        describe("ERC721 transfers", function () {
            it("transfers token and increment counter", async () => {
                //Arrange
                const deployFee = await ethers.utils.parseEther('0.001')
                const transferable = true
                const transferLimit = 2
                const tweetId = 2221
                const mintFee = await ethers.utils.parseEther('0.001')
                const maxMintableAmount = 10

                //Act
                await deployerTwitterNft.setDeployFee(+deployFee)
                await contentCreatorTwitterNft.deployNftParams(transferable,
                    transferLimit,
                    tweetId,
                    +mintFee,
                    maxMintableAmount
                )
                let tx = await followerTwitterNft.mintToken(
                    tweetId
                )
                console.log(tx)
                tx.wait()
                tx = await followerTwitterNft.setTokenURI(0, "TestURI")
                let followerBalance = await followerTwitterNft.balanceOf(follower.address)
                let transferCounterOfToken = await followerTwitterNft.getTransferCounterOfToken(0)
                console.log("Follower's balance: %s", followerBalance)
                console.log(followerTwitterNft)
                await followerTwitterNft.transferFrom(follower.address, contentCreator.address, 0)
                followerBalance = await followerTwitterNft.balanceOf(follower.address)
                contentCreatorBalance = await followerTwitterNft.balanceOf(contentCreator.address)
                transferCounterOfToken = await followerTwitterNft.getTransferCounterOfToken(0)
                assert.equal(followerBalance.toString(), "0")
                assert.equal(contentCreatorBalance.toString(), "1")
                assert.equal(transferCounterOfToken.toString(), "1")
            })
            it("not transfers token for non-transefable tokens", async () => {
                //Arrange
                const deployFee = await ethers.utils.parseEther('0.001')
                const transferable = false
                const transferLimit = 2
                const tweetId = 2221
                const mintFee = await ethers.utils.parseEther('0.001')
                const maxMintableAmount = 10

                //Act
                await deployerTwitterNft.setDeployFee(+deployFee)
                await contentCreatorTwitterNft.deployNftParams(transferable,
                    transferLimit,
                    tweetId,
                    +mintFee,
                    maxMintableAmount
                )
                await followerTwitterNft.mintToken(tweetId)
                await followerTwitterNft.setTokenURI(0, "TestURI")
                let followerBalance = await followerTwitterNft.balanceOf(follower.address)
                let transferCounterOfToken = await followerTwitterNft.getTransferCounterOfToken(0)
                console.log("Follower's balance: %s", followerBalance)
                await expect(followerTwitterNft.transferFrom(follower.address, contentCreator.address, 0)).to.be.revertedWith("TwitterNft__TransferNotPossible")
                followerBalance = await followerTwitterNft.balanceOf(follower.address)
                contentCreatorBalance = await followerTwitterNft.balanceOf(contentCreator.address)
                transferCounterOfToken = await followerTwitterNft.getTransferCounterOfToken(0)
                assert.equal(followerBalance.toString(), "1")
                assert.equal(contentCreatorBalance.toString(), "0")
                assert.equal(transferCounterOfToken.toString(), "0")
            })
            it("transfers token up to the limit and then reverts transaction", async () => {
                //Arrange
                const deployFee = await ethers.utils.parseEther('0.001')
                const transferable = 1
                const transferLimit = 2
                const tweetId = 2221
                const mintFee = await ethers.utils.parseEther('0.001')
                const maxMintableAmount = 10

                //Act
                await deployerTwitterNft.setDeployFee(+deployFee)
                await contentCreatorTwitterNft.deployNftParams(transferable,
                    transferLimit,
                    tweetId,
                    +mintFee,
                    maxMintableAmount
                )
                await followerTwitterNft.mintToken(tweetId)
                await followerTwitterNft.setTokenURI(0, "TestURI")
                let followerBalance = await followerTwitterNft.balanceOf(follower.address)
                let transferCounterOfToken = await followerTwitterNft.getTransferCounterOfToken(0)

                await followerTwitterNft.transferFrom(follower.address, contentCreator.address, 0)
                console.log("Token counter: %s", await followerTwitterNft.getTransferCounterOfToken(0))
                await contentCreatorTwitterNft.transferFrom(contentCreator.address, follower.address, 0)
                console.log("Token counter: %s", await followerTwitterNft.getTransferCounterOfToken(0))
                await expect(followerTwitterNft.transferFrom(follower.address, contentCreator.address, 0)).to.be.revertedWith("TwitterNft__TransferNotPossible")
                followerBalance = await followerTwitterNft.balanceOf(follower.address)
                contentCreatorBalance = await followerTwitterNft.balanceOf(contentCreator.address)
                transferCounterOfToken = await followerTwitterNft.getTransferCounterOfToken(0)
                assert.equal(followerBalance.toString(), "1")
                assert.equal(contentCreatorBalance.toString(), "0")
                assert.equal(transferCounterOfToken.toString(), "2")
            })
            it("mints token up to the limit and then reverts transaction", async () => {
                //Arrange
                const deployFee = await ethers.utils.parseEther('0.001')
                const transferable = true
                const transferLimit = 2
                const tweetId = 2221
                const mintFee = await ethers.utils.parseEther('0.001')
                const maxMintableAmount = 2

                //Act
                await deployerTwitterNft.setDeployFee(+deployFee)
                await contentCreatorTwitterNft.deployNftParams(transferable,
                    transferLimit,
                    tweetId,
                    +mintFee,
                    maxMintableAmount
                )
                await followerTwitterNft.mintToken(tweetId)
                await followerTwitterNft.mintToken(tweetId)
                const tokenIdsByTweetId = await followerTwitterNft.getTokenIdsByTweetId(tweetId)
                assert.equal(tokenIdsByTweetId.length.toString(), maxMintableAmount.toString())
                await expect(followerTwitterNft.mintToken(tweetId)).to.be.revertedWith("Max number of tokens to mint exceeded")

            })
        })

        describe("withdrawal", function () {
            let deployFee, tokenFeature, transferLimit, tweetId, mintFee
            beforeEach(async () => {
                deployFee = await ethers.utils.parseEther('0.001')
                transferLimit = 2
                transferable = true
                tweetId = 2221
                mintFee = await ethers.utils.parseEther('0.001')
                maxMintableAmount = 2
            })
            it("allows only Owner to Withdraw", async function () {
                await deployerTwitterNft.setDeployFee(deployFee)
                await contentCreatorTwitterNft.deployNftParams(
                    transferable, transferLimit, tweetId, mintFee, maxMintableAmount
                )
                await followerTwitterNft.mintToken(tweetId)
                await expect(followerTwitterNft.withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
            })
        })

        describe("ERC721 URI", function () {
            it("mint NFT with proper token URI", async () => {
                //Arrange
                const deployFee = await ethers.utils.parseEther('0.001')
                const transferable = true
                const transferLimit = 2
                const tweetId = 2221
                const mintFee = await ethers.utils.parseEther('0.001')
                const imagesFilePath = "./images"
                const fullImagesPath = path.resolve(imagesFilePath) // absolute path 
                const files = fs.readdirSync(fullImagesPath)
                const maxMintableAmount = 10
                let metadata = {
                    title: "",
                    type: "",
                    properties: {
                        tweetId: "",
                        contentCreator: "",
                        image: "",
                        timestamp: "",
                        attributes: [
                            {
                                numberOfLikes: 0,
                                numberOfShares: 0,
                            }
                        ]
                    }
                }
                let response = await storeImage(fullImagesPath + "/" + files[0])
                console.log("Response: %s", response)
                metadata.title = files[0].replace(".png", "")
                metadata.tweetId = tweetId
                metadata.contentCreator = `twitter user name`
                metadata.image = `ipfs://${response.IpfsHash}`
                metadata.timestamp = response.timestamp
                const metadataUploadResponse = await storeTokenUriMetadata(metadata)
                console.log("Upload response: %s", metadataUploadResponse)
                const pinataTokenUri = `ipfs://${metadataUploadResponse.IpfsHash}`

                //Act
                await deployerTwitterNft.setDeployFee(+deployFee)
                await contentCreatorTwitterNft.deployNftParams(transferable,
                    transferLimit,
                    tweetId,
                    +mintFee,
                    maxMintableAmount
                )
                console.log(metadata)
                console.log(JSON.stringify(metadata))
                await followerTwitterNft.mintToken(tweetId)
                await followerTwitterNft.setTokenURI(0, JSON.stringify(pinataTokenUri))
                let followerBalance = await followerTwitterNft.balanceOf(follower.address)

                let nftTokenUri = await followerTwitterNft.tokenURI(0)

                assert.equal(JSON.stringify(pinataTokenUri), nftTokenUri.toString())
            })
        })
    })
