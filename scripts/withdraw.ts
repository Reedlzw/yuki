import { ethers } from "hardhat";
import { formatUnits } from "@ethersproject/units";

// 设置触发提现的余额阈值（USDC的6位小数）
const THRESHOLD = 5; // 5 USDC (6位小数)
const USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831"; // ARB主网USDC地址
const WATER = "0x9045ae36f963b7184861bdce205ea8b08913b48c";

async function withdrawMax() {
    const [caller] = await ethers.getSigners();
    console.log("Attempting to withdraw with account:", caller.address);

    const water = await ethers.getContractAt("IWater", WATER);
    const usdc = await ethers.getContractAt("IERC20", USDC);

    let maxWithdraw = await water.maxWithdraw(caller.address);
    const waterBalance = await usdc.balanceOf(WATER);
    console.log(`Water balance: ${formatUnits(waterBalance, 6)} USDC`);
    console.log(`Max withdraw: ${formatUnits(maxWithdraw, 6)} USDC`);

    if (waterBalance < maxWithdraw) {
        maxWithdraw = waterBalance;
    }

    if (maxWithdraw > THRESHOLD * 10 ** 6) {
        try {
            // 调用withdraw函数提现全部余额
            // const previewRedeem = await water.previewRedeem(maxWithdraw);
            // console.log("previewRedeem:", previewRedeem);
            const tx = await water.withdraw(maxWithdraw, caller.address, caller.address);
            await tx.wait();
            
            console.log("Withdrawal successful!");
            console.log("Transaction hash:", tx.hash);
        } catch (error) {
            console.error("Error during withdrawal:", error);
        } 
    }
    else {
        console.log("Balance below threshold, no action needed.");
    }

}

async function isNearHour() {
    const now = new Date();
    const minutes = now.getMinutes();
    return minutes === 59 || minutes <= 4;
}

async function main() {
    console.log("Starting balance monitoring...");
    console.log(`Withdrawal threshold set to: ${THRESHOLD} USDC`);
    
    // 启动时立即执行一次查询
    try {
        console.log("Performing initial balance check...");
        await withdrawMax();

    } catch (error) {
        console.error("Error during initial check:", error);
    }
    
    // 每10秒检查一次是否在目标时间范围内
    setInterval(async () => {
        try {
            const nearHour = await isNearHour();
            if (nearHour) {
                console.log("In target time window (59th or 0-3rd minute), checking balance...");
                await withdrawMax();
            } else {
                console.log("Not in target time window, skipping...");
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
