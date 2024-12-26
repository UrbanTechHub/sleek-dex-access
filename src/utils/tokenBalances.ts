import Web3 from 'web3';
import { toast } from 'sonner';

interface TokenBalances {
  ETH: string;
  USDT: string;
  USDC: string;
}

export const getTokenBalances = async (address: string): Promise<TokenBalances | null> => {
  try {
    if (!window.ethereum) {
      throw new Error('No Web3 provider found');
    }

    // Ethereum balance
    const ethBalanceResult = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });

    const ethBalance = ethBalanceResult ? (parseInt(ethBalanceResult.toString(), 16) / 1e18).toString() : "0";

    // Token contract addresses
    const tokenContracts = {
      USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    };

    const balances: TokenBalances = {
      ETH: ethBalance,
      USDT: '0',
      USDC: '0',
    };

    const web3 = new Web3(window.ethereum);
    const minABI = [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
    ];

    for (const [token, contractAddress] of Object.entries(tokenContracts)) {
      try {
        const contract = new web3.eth.Contract(minABI, contractAddress);
        const balance = await contract.methods.balanceOf(address).call();
        balances[token as keyof TokenBalances] = (parseInt(balance.toString()) / 1e6).toString();
      } catch (error) {
        console.error(`Error fetching ${token} balance:`, error);
      }
    }

    return balances;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return null;
  }
};