"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeGaslessTransaction = void 0;
const viem_1 = require("viem");
const abstractjs_1 = require("@biconomy/abstractjs");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
/**
 * Helper function to encode ERC-20 transfer data.
 */
function encodeFunctionDataForERC20Transfer(to, amount) {
    const transferMethodSignature = "0xa9059cbb"; // transfer(address,uint256)
    const paddedTo = to.toLowerCase().replace("0x", "").padStart(64, "0");
    const paddedAmount = amount.toString(16).padStart(64, "0");
    return `0x${transferMethodSignature}${paddedTo}${paddedAmount}`;
}
const executeGaslessTransaction = async (req, res) => {
    try {
        const { privateKey, to, amount } = req.body;
        if (!privateKey || !to || !amount) {
            res.status(400).json({ error: "Missing required fields: privateKey, to, amount" });
            return;
        }
        // Initialize account from privateKey
        const account = (0, accounts_1.privateKeyToAccount)(privateKey);
        // Setup Multichain Nexus Account
        const oNexus = await (0, abstractjs_1.toMultichainNexusAccount)({
            chains: [chains_1.mainnet],
            transports: [(0, viem_1.http)()],
            signer: account,
        });
        const meeClient = await (0, abstractjs_1.createMeeClient)({
            account: oNexus
        });
        // Define the USDC transfer trigger (gas sponsorship)
        const trigger = {
            amount: BigInt(amount),
            chainId: chains_1.mainnet.id,
            tokenAddress: abstractjs_1.mcUSDC.addressOn(chains_1.mainnet.id),
        };
        // Define the instruction (USDC transfer)
        const instruction = {
            calls: [{
                    to: to,
                    value: 0n
                }],
            chainId: chains_1.mainnet.id,
        };
        // Get fusion quote (gas sponsorship details)
        const fusionQuote = await meeClient.getFusionQuote({
            trigger,
            feeToken: {
                address: abstractjs_1.mcUSDC.addressOn(chains_1.mainnet.id),
                chainId: chains_1.mainnet.id,
            },
            instructions: [instruction],
        });
        console.log('FusionQuote:', fusionQuote);
        // Execute the transaction
        const { hash } = await meeClient.executeFusionQuote({
            fusionQuote,
        });
        const receipt = await meeClient.waitForSupertransactionReceipt({ hash });
        const meeScanLink = (0, abstractjs_1.getMeeScanLink)(hash);
        res.status(200).json({
            success: true,
            transactionHash: hash,
            meeScanLink,
            receipt,
        });
    }
    catch (error) {
        console.error("Error in gaslessTx:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.executeGaslessTransaction = executeGaslessTransaction;
