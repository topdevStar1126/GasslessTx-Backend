"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionController_1 = require("../controllers/transactionController");
const router = express_1.default.Router();
// Endpoint to execute a gasless USDC transfer using Biconomy MEE
router.post('/gaslessTx', transactionController_1.executeGaslessTransaction);
exports.default = router;
