import { Request, Response } from 'express';
import { createWalletClient, http, zeroAddress } from "viem";
import { createMeeClient, getMeeScanLink, Instruction, mcUSDC, toMultichainNexusAccount, Trigger } from "@biconomy/abstractjs";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Helper function to encode ERC-20 transfer data.
 */
function encodeFunctionDataForERC20Transfer(to: string, amount: bigint): `0x${string}` {
    const transferMethodSignature = "0xa9059cbb"; // transfer(address,uint256)
    const paddedTo = to.toLowerCase().replace("0x", "").padStart(64, "0");
    const paddedAmount = amount.toString(16).padStart(64, "0");
    return `0x${transferMethodSignature}${paddedTo}${paddedAmount}` as `0x${string}`;
}

export const executeGaslessTransaction = async (req: Request, res: Response) => {
    try {
        const { privateKey, to, amount } = req.body;

        if (!privateKey || !to || !amount) {
            res.status(400).json({ error: "Missing required fields: privateKey, to, amount" });
            return;
        }

        // Initialize account from privateKey
        const account = privateKeyToAccount(privateKey as `0x${string}`);

        // Setup Multichain Nexus Account
        const oNexus = await toMultichainNexusAccount({
            chains: [mainnet],
            transports: [http()],
            signer: account,
        });

        const meeClient = await createMeeClient({
            account: oNexus
        });

        // Define the USDC transfer trigger (gas sponsorship)
        const trigger: Trigger = {
            amount: BigInt(amount),
            chainId: mainnet.id,
            tokenAddress: mcUSDC.addressOn(mainnet.id),
        };

        // Define the instruction (USDC transfer)
        const instruction: Instruction = {
            calls: [{
                to: to as `0x${string}`,
                value: 0n
            }],
            chainId: mainnet.id,
        };

        // Get fusion quote (gas sponsorship details)
        const fusionQuote = await meeClient.getFusionQuote({
            trigger,
            feeToken: {
                address: mcUSDC.addressOn(mainnet.id),
                chainId: mainnet.id,
            },
            instructions: [instruction],
        });

        console.log('FusionQuote:', fusionQuote);

        // Execute the transaction
        const { hash } = await meeClient.executeFusionQuote({
            fusionQuote,
        });

        const receipt = await meeClient.waitForSupertransactionReceipt({ hash });
        const meeScanLink = getMeeScanLink(hash);

        res.status(200).json({
            success: true,
            transactionHash: hash,
            meeScanLink,
            receipt,
        });
    } catch (error) {
        console.error("Error in gaslessTx:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}; 