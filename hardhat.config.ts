import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    arb: {
      url: "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: [""]
    },
  },
};



export default config;
