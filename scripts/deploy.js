const hre = require("hardhat");

async function main() {
  try {
    // Get network information
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance));

    // Get the contract factory
    const Lottery = await hre.ethers.getContractFactory("Lottery");
    console.log("Deploying Lottery contract...");
    
    // Deploy the contract
    const lottery = await Lottery.deploy();
    await lottery.waitForDeployment();
    
    const lotteryAddress = await lottery.getAddress();
    
    console.log("\nDeployment successful!");
    console.log("--------------------");
    console.log("Lottery contract address:", lotteryAddress);
    console.log("Transaction hash:", lottery.deploymentTransaction().hash);
    console.log("\nNetwork: localhost (Ganache)");
    console.log("Chain ID:", (await deployer.provider.getNetwork()).chainId);
    
    // Save the contract address for future use
    console.log("\nYou can now interact with the contract using:");
    console.log(`npx hardhat console --network localhost`);
    console.log("const Lottery = await ethers.getContractFactory('Lottery')");
    console.log(`const lottery = await Lottery.attach('${lotteryAddress}')`);

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });