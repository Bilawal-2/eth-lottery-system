const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", function () {
    let Lottery;
    let lottery;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        Lottery = await ethers.getContractFactory("Lottery");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        lottery = await Lottery.deploy();
        await lottery.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await lottery.owner()).to.equal(owner.address);
        });

        it("Should set lottery as open", async function () {
            expect(await lottery.lotteryOpen()).to.equal(true);
        });

        it("Should set correct ticket price", async function () {
            const ticketPrice = ethers.parseEther("0.01");
            expect(await lottery.ticketPrice()).to.equal(ticketPrice);
        });
    });

    describe("Buying tickets", function () {
        it("Should allow buying ticket with correct price", async function () {
            await expect(lottery.connect(addr1).buyTicket({
                value: ethers.parseEther("0.01")
            })).to.emit(lottery, "TicketPurchased")
              .withArgs(addr1.address);

            const players = await lottery.getPlayers();
            expect(players[0]).to.equal(addr1.address);
        });

        it("Should reject incorrect ticket price", async function () {
            try {
                await lottery.connect(addr1).buyTicket({
                    value: ethers.parseEther("0.02")
                });
                // If we reach here, the transaction didn't revert as expected
                expect.fail("Transaction should have reverted");
            } catch (error) {
                expect(error.message).to.include("Incorrect ticket price");
            }
        });

        it("Should reject when lottery is closed", async function () {
            await lottery.connect(owner).toggleLottery();
            try {
                await lottery.connect(addr1).buyTicket({
                    value: ethers.parseEther("0.01")
                });
                expect.fail("Transaction should have reverted");
            } catch (error) {
                expect(error.message).to.include("Lottery is closed");
            }
        });
    });

    describe("Picking winner", function () {
        beforeEach(async function () {
            await lottery.connect(addr1).buyTicket({
                value: ethers.parseEther("0.01")
            });
            await lottery.connect(addr2).buyTicket({
                value: ethers.parseEther("0.01")
            });
        });

        it("Should only allow owner to pick winner", async function () {
            try {
                await lottery.connect(addr1).pickWinner();
                expect.fail("Transaction should have reverted");
            } catch (error) {
                expect(error.message).to.include("Only owner can call this");
            }
        });

        it("Should pick winner and transfer funds", async function () {
            const lotteryAddress = await lottery.getAddress();
            const initialBalance = await ethers.provider.getBalance(lotteryAddress);
            
            // Convert to BigInt for comparison
            expect(initialBalance).to.equal(ethers.parseEther("0.02"));

            // Get initial balances of potential winners
            const addr1InitialBalance = await ethers.provider.getBalance(addr1.address);
            const addr2InitialBalance = await ethers.provider.getBalance(addr2.address);

            // Pick winner
            const tx = await lottery.connect(owner).pickWinner();
            await tx.wait();

            // Check final contract balance
            const finalBalance = await ethers.provider.getBalance(lotteryAddress);
            expect(finalBalance).to.equal(0n);
            
            // Verify players array is reset
            const players = await lottery.getPlayers();
            expect(players.length).to.equal(0);

            // Verify one of the players received the funds
            const addr1FinalBalance = await ethers.provider.getBalance(addr1.address);
            const addr2FinalBalance = await ethers.provider.getBalance(addr2.address);
            
            const someoneWon = (
                addr1FinalBalance > addr1InitialBalance ||
                addr2FinalBalance > addr2InitialBalance
            );
            expect(someoneWon).to.be.true;
        });
    });

    describe("Admin functions", function () {
        it("Should allow owner to toggle lottery status", async function () {
            await lottery.connect(owner).toggleLottery();
            expect(await lottery.lotteryOpen()).to.equal(false);

            await lottery.connect(owner).toggleLottery();
            expect(await lottery.lotteryOpen()).to.equal(true);
        });

        it("Should not allow non-owner to toggle lottery status", async function () {
            try {
                await lottery.connect(addr1).toggleLottery();
                expect.fail("Transaction should have reverted");
            } catch (error) {
                expect(error.message).to.include("Only owner can call this");
            }
        });
    });
});
