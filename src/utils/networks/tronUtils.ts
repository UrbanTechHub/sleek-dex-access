import TronWeb from 'tronweb';

const TRON_FULL_NODE = 'https://api.trongrid.io';
const TRON_SOLIDITY_NODE = 'https://api.trongrid.io';
const TRON_EVENT_SERVER = 'https://api.trongrid.io';

// USDT TRC20 contract address on mainnet
const USDT_CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const getTronWeb = (privateKey?: string) => {
  // Create TronWeb instance using the constructor function
  const tronWeb = new (TronWeb as any)(
    TRON_FULL_NODE,
    TRON_SOLIDITY_NODE,
    TRON_EVENT_SERVER,
    privateKey || undefined
  );
  return tronWeb;
};

export const generateTronWallet = async () => {
  try {
    const tronWeb = getTronWeb();
    const account = await tronWeb.createAccount();
    console.log('Generated USDT-TRC20 wallet:', account.address.base58);
    return {
      address: account.address.base58,
      privateKey: account.privateKey,
    };
  } catch (error) {
    console.error('Error generating USDT-TRC20 wallet:', error);
    throw error;
  }
};

export const getTronBalance = async (address: string): Promise<string> => {
  try {
    console.log('Fetching USDT-TRC20 balance for:', address);
    const tronWeb = getTronWeb();
    
    // Get USDT contract instance
    const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
    
    // Get balance
    const balance = await contract.balanceOf(address).call();
    const formattedBalance = tronWeb.fromSun(balance.toString());
    
    console.log('USDT-TRC20 balance:', formattedBalance);
    return formattedBalance;
  } catch (error) {
    console.error('Error fetching USDT-TRC20 balance:', error);
    return "0.00";
  }
};

export const validateTronAddress = (address: string): boolean => {
  try {
    const tronWeb = getTronWeb();
    return tronWeb.isAddress(address);
  } catch {
    return false;
  }
};

export const sendTronTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  privateKey: string
): Promise<boolean> => {
  try {
    console.log('Initiating USDT-TRC20 transaction:', { fromAddress, toAddress, amount });
    
    if (!validateTronAddress(toAddress)) {
      console.error('Invalid USDT-TRC20 address');
      return false;
    }

    const tronWeb = getTronWeb(privateKey);
    const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
    
    // Convert amount to sun (smallest unit)
    const amountInSun = tronWeb.toSun(amount);
    
    // Send USDT
    const transaction = await contract.transfer(
      toAddress,
      amountInSun
    ).send({
      feeLimit: 100000000,
      callValue: 0,
      shouldPollResponse: true
    });
    
    console.log('USDT-TRC20 Transaction successful:', transaction);
    return true;
  } catch (error) {
    console.error('USDT-TRC20 transaction error:', error);
    return false;
  }
};