const hre = require("hardhat");

async function main() {
  const priceWei = hre.ethers.parseEther("0.00001"); // ~0.02 USD equivalent, adjust as needed
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
