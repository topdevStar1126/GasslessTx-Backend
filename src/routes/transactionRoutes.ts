import express from 'express';
import { executeGaslessTransaction } from '../controllers/transactionController';

const router = express.Router();

// Endpoint to execute a gasless USDC transfer using Biconomy MEE
router.post('/gaslessTx', executeGaslessTransaction);

export default router; 