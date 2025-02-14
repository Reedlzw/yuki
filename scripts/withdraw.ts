import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { BigNumberish } from "ethers";
import { formatUnits } from "@ethersproject/units";

// 设置触发提现的余额阈值（USDC的6位小数）
const THRESHOLD = BigNumber.from("5000000"); // 5 USDC (6位小数)

async function checkBalance() {
    const [caller] = await ethers.getSigners();
    // console.log("Checking balance with account:", caller.address);
    
    // USDC合约地址
    const usdcAddress = "0xaf88d065e77c8cc2239327c5edb3a432268e5831"; // ARB主网USDC地址
    const waterAddress = "0x9045ae36f963b7184861bdce205ea8b08913b48c";
    
    const usdc = await ethers.getContractAt("IERC20", usdcAddress);
    const balance = await usdc.balanceOf(waterAddress);
    
    // 确保返回的是 BigNumber
    const balanceBN = BigNumber.from(balance.toString());
    console.log(`Current USDC balance: ${formatUnits(balanceBN, 6)} USDC`);
    return balanceBN;
}

async function withdrawAll(balance: BigNumberish) {
    const [caller] = await ethers.getSigners();
    console.log("Attempting to withdraw with account:", caller.address);

    const waterAddress = "0x9045ae36f963b7184861bdce205ea8b08913b48c";
    const water = await ethers.getContractAt("IWater", waterAddress);

    try {
        // 调用withdraw函数提现全部余额
        const tx = await water.withdraw(balance, caller.address, caller.address);
        await tx.wait();
        
        console.log("Withdrawal successful!");
        console.log("Transaction hash:", tx.hash);
    } catch (error) {
        console.error("Error during withdrawal:", error);
    }
}

async function isNearHour() {
    const now = new Date();
    const minutes = now.getMinutes();
    return minutes === 59 || minutes <= 3;
}

async function main() {
    console.log("Starting balance monitoring...");
    console.log(`Withdrawal threshold set to: ${THRESHOLD.div(BigNumber.from("1000000"))} USDC`);
    
    // 每10秒检查一次是否在目标时间范围内
    setInterval(async () => {
        try {
            const nearHour = await isNearHour();
            if (nearHour) {
                console.log("In target time window (59th or 0-3rd minute), checking balance...");
                const balance = await checkBalance();
                
                // 检查余额是否超过阈值
                if (balance.gt(THRESHOLD)) {
                    console.log("Balance exceeds threshold, initiating withdrawal...");
                    await withdrawAll(balance.toString());
                } else {
                    console.log("Balance below threshold, no action needed.");
                }
            } else {
                console.log("Not in target time window, skipping...");
                // const balance = await checkBalance();
                
                // // 检查余额是否超过阈值
                // if (balance.gt(THRESHOLD)) {
                //     console.log("Balance exceeds threshold, initiating withdrawal...");
                //     await withdrawAll(balance.toString());
                // } else {
                //     console.log("Balance below threshold, no action needed.");
                // }
            }
        } catch (error) {
            console.error("Error during monitoring:", error);
        }
    }, 10000); // 10秒间隔
}

// 防止程序退出
process.on('SIGINT', () => {
    console.log('Monitoring stopped');
    process.exit();
});

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
