import { ethers } from 'ethers';

export interface TipTransaction {
  hash: string;
  to: string;
  amount: string;
  token: 'ETH' | 'EMARK';
  timestamp: number;
}

export class BotWalletService {
  private wallet: ethers.Wallet;
  private provider: ethers.Provider;
  private emarkTokenAddress: string;

  constructor() {
    const privateKey = process.env.BOT_PRIVATE_KEY;
    const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
    this.emarkTokenAddress = process.env.NEXT_PUBLIC_EMARK_TOKEN_ADDRESS || '';

    if (!privateKey) {
      throw new Error('BOT_PRIVATE_KEY environment variable is required');
    }

    if (!this.emarkTokenAddress) {
      throw new Error('NEXT_PUBLIC_EMARK_TOKEN_ADDRESS environment variable is required');
    }

    // Connect to Base network
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Get bot wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get ETH balance of the bot wallet
   */
  async getEthBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get EMARK token balance of the bot wallet
   */
  async getEmarkBalance(): Promise<string> {
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];

    const tokenContract = new ethers.Contract(this.emarkTokenAddress, erc20Abi, this.provider);
    const balance = await tokenContract.balanceOf(this.wallet.address);
    const decimals = await tokenContract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  }

  /**
   * Send ETH tip to a user
   */
  async sendEthTip(toAddress: string, amountEth: string): Promise<TipTransaction> {
    try {
      const tx = await this.wallet.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amountEth),
        gasLimit: 21000
      });

      await tx.wait();

      return {
        hash: tx.hash,
        to: toAddress,
        amount: amountEth,
        token: 'ETH',
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to send ETH tip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send EMARK token tip to a user
   */
  async sendEmarkTip(toAddress: string, amountEmark: string): Promise<TipTransaction> {
    try {
      const erc20Abi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)'
      ];

      const tokenContract = new ethers.Contract(this.emarkTokenAddress, erc20Abi, this.wallet);
      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits(amountEmark, decimals);

      const tx = await tokenContract.transfer(toAddress, amount);
      await tx.wait();

      return {
        hash: tx.hash,
        to: toAddress,
        amount: amountEmark,
        token: 'EMARK',
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to send EMARK tip: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate if an address is a valid Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
}