const hre = require("hardhat");

async function main() {
  const priceWei = hre.ethers.parseEther("0.00002"); // 2x previous (0.00001 -> 0.00002 ETH per tile)
  const GreenWorld = await hre.ethers.getContractFactory("GreenWorld");
  const gw = await GreenWorld.deploy(priceWei);
  await gw.waitForDeployment();
  const addr = await gw.getAddress();
  console.log("GreenWorld deployed to:", addr);
  console.log("Price (wei):", priceWei.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
