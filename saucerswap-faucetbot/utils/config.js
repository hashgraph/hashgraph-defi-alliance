import { getBotConfig } from "../configs/secrets.js";
import dotenv from "dotenv";
dotenv.config();

const botConfig = await getBotConfig();

export const DB = process.env.DB || botConfig.DB;
export const DB_HOST = process.env.DB_HOST || botConfig.DB_HOST;
export const DB_PASSWORD = process.env.DB_PASSWORD || botConfig.DB_PASSWORD;
export const DB_USER = process.env.DB_USER || botConfig.DB_USER;

export const EM_MULTIPLIER = (process.env.EM_MULTIPLIER || botConfig.EM_MULTIPLIER).split(',').map(e => Number(e));

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || botConfig.DISCORD_TOKEN;
export const DISCORD_CHANNEL = process.env.DISCORD_CHANNEL || botConfig.DISCORD_CHANNEL;

export const HEDERA_NETWORK = process.env.HEDERA_NETWORK || botConfig.HEDERA_NETWORK || "testnet";

export const PEC_ELECTRO_ID = process.env.PEC_ELECTRO_ID || botConfig.PEC_ELECTRO_ID;
export const PEC_GRAVITY_ID = process.env.PEC_GRAVITY_ID || botConfig.PEC_GRAVITY_ID;
export const PEC_SNUCLEAR_ID = process.env.PEC_SNUCLEAR_ID || botConfig.PEC_SNUCLEAR_ID;
export const PEC_WNUCLEAR_ID = process.env.PEC_WNUCLEAR_ID || botConfig.PEC_WNUCLEAR_ID;

export const PEC_ELECTRO_AMOUNT = process.env.PEC_ELECTRO_AMOUNT || botConfig.PEC_ELECTRO_AMOUNT;
export const PEC_GRAVITY_AMOUNT = process.env.PEC_GRAVITY_AMOUNT || botConfig.PEC_GRAVITY_AMOUNT;
export const PEC_SNUCLEAR_AMOUNT = process.env.PEC_SNUCLEAR_AMOUNT || botConfig.PEC_SNUCLEAR_AMOUNT;
export const PEC_WNUCLEAR_AMOUNT = process.env.PEC_WNUCLEAR_AMOUNT || botConfig.PEC_WNUCLEAR_AMOUNT;

export const TREASURY_ACCOUNT_ID = process.env.TREASURY_ACCOUNT_ID || botConfig.TREASURY_ACCOUNT_ID;
export const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY || botConfig.TREASURY_PRIVATE_KEY;

export const SAUCE_TOKEN_ID = process.env.SAUCE_TOKEN_ID || botConfig.SAUCE_TOKEN_ID;

// Derivative config
export const NFT_WHITELIST = [
  PEC_GRAVITY_ID,
  PEC_WNUCLEAR_ID,
  PEC_SNUCLEAR_ID,
  PEC_ELECTRO_ID,
];
export const HEDERA_MIRROR_BASE_URL =
  HEDERA_NETWORK == 'mainnet'
    ? "https://mainnet-public.mirrornode.hedera.com"
    : "https://testnet.mirrornode.hedera.com";
