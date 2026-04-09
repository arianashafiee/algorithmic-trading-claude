/**
 * Wallet Vault Service
 * Generate, import, export, and persist multiple wallet records
 */

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';
import bs58 from 'bs58';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class WalletVaultService {
    constructor() {
        this.wallets = new Map(); // In-memory wallet storage
        this.walletsDir = path.join(os.homedir(), '.cc-trading-terminal', 'wallets');
        this.walletFile = path.join(this.walletsDir, 'wallets.json');
        this.initialized = false;
        this.ensureWalletsDir().then(() => this.loadWallets()).then(() => {
            this.initialized = true;
        });
    }

    /**
     * Ensure wallets directory exists
     */
    async ensureWalletsDir() {
        try {
            await fs.mkdir(this.walletsDir, { recursive: true });
        } catch (error) {
            console.warn('Could not create wallets directory:', error.message);
        }
    }

    /**
     * Load wallets from persistent storage
     */
    async loadWallets() {
        try {
            const data = await fs.readFile(this.walletFile, 'utf-8');
            const walletsData = JSON.parse(data);
            // Don't clear existing wallets - merge with persisted ones
            for (const [address, wallet] of Object.entries(walletsData)) {
                this.wallets.set(address, wallet);
            }
        } catch (error) {
            // File doesn't exist or is empty - that's okay
        }
    }

    /**
     * Save wallets to persistent storage
     */
    async saveWallets() {
        try {
            const walletsData = Object.fromEntries(this.wallets);
            await fs.writeFile(this.walletFile, JSON.stringify(walletsData, null, 2));
        } catch (error) {
            console.warn('Could not save wallets:', error.message);
        }
    }

    /**
     * Generate new Solana wallet
     */
    generateSolanaWallet() {
        const keypair = Keypair.generate();
        const privateKey = bs58.encode(keypair.secretKey);
        const publicKey = keypair.publicKey.toString();

        return {
            type: 'solana',
            privateKey,
            publicKey,
            address: publicKey
        };
    }

    /**
     * Generate new Ethereum wallet
     */
    generateEthereumWallet() {
        const wallet = ethers.Wallet.createRandom();
        
        return {
            type: 'ethereum',
            privateKey: wallet.privateKey,
            publicKey: wallet.publicKey,
            address: wallet.address
        };
    }

    /**
     * Import Solana wallet from private key
     */
    async importSolanaWallet(privateKey, name = null) {
        try {
            let secretKey;
            
            // Handle different private key formats
            if (privateKey.length === 128) {
                // Hex format
                secretKey = new Uint8Array(Buffer.from(privateKey, 'hex'));
            } else if (privateKey.length === 88 || privateKey.length === 87) {
                // Base58 format (87 or 88 characters)
                secretKey = bs58.decode(privateKey);
            } else if (Array.isArray(privateKey)) {
                // Array format
                secretKey = new Uint8Array(privateKey);
            } else {
                throw new Error(`Invalid private key format. Length: ${privateKey.length}, expected 87-88 (base58) or 128 (hex)`);
            }

            const keypair = Keypair.fromSecretKey(secretKey);
            const publicKey = keypair.publicKey.toString();
            
            const walletData = {
                type: 'solana',
                privateKey: bs58.encode(keypair.secretKey),
                publicKey,
                address: publicKey,
                name: name || `Solana-${publicKey.slice(0, 8)}`,
                imported: true,
                importedAt: new Date().toISOString()
            };

            // Store in memory
            this.wallets.set(publicKey, walletData);
            await this.saveWallets();

            return {
                success: true,
                wallet: walletData,
                message: 'Solana wallet imported successfully'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to import Solana wallet'
            };
        }
    }

    /**
     * Import Ethereum wallet from private key
     */
    async importEthereumWallet(privateKey, name = null) {
        try {
            // Ensure private key starts with 0x
            if (!privateKey.startsWith('0x')) {
                privateKey = '0x' + privateKey;
            }

            const wallet = new ethers.Wallet(privateKey);
            
            const walletData = {
                type: 'ethereum',
                privateKey: wallet.privateKey,
                publicKey: wallet.publicKey,
                address: wallet.address,
                name: name || `Ethereum-${wallet.address.slice(0, 8)}`,
                imported: true,
                importedAt: new Date().toISOString()
            };

            // Store in memory
            this.wallets.set(wallet.address.toLowerCase(), walletData);
            await this.saveWallets();

            return {
                success: true,
                wallet: walletData,
                message: 'Ethereum wallet imported successfully'
            };

        } catch (error) {
            return {
