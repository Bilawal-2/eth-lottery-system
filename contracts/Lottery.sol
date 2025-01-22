// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public owner;
    address[] public players;
    uint256 public ticketPrice = 0.01 ether;
    bool public lotteryOpen;
    
    event TicketPurchased(address player);
    event WinnerPicked(address winner, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        lotteryOpen = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    function buyTicket() public payable {
        require(lotteryOpen, "Lottery is closed");
        require(msg.value == ticketPrice, "Incorrect ticket price");
        
        players.push(msg.sender);
        emit TicketPurchased(msg.sender);
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function pickWinner() public onlyOwner {
        require(players.length > 0, "No players in lottery");
        require(lotteryOpen, "Lottery is closed");
        
        uint256 index = _generateRandomNumber() % players.length;
        address winner = players[index];
        uint256 prizeAmount = address(this).balance;
        
        payable(winner).transfer(prizeAmount);
        emit WinnerPicked(winner, prizeAmount);
        
        // Reset lottery
        players = new address[](0);
    }
    
    function _generateRandomNumber() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            players
        )));
    }
    
    function toggleLottery() public onlyOwner {
        lotteryOpen = !lotteryOpen;
    }
    
    function getPlayers() public view returns (address[] memory) {
        return players;
    }
}
