// Simple wallet connection without wagmi to avoid MetaMask SDK issues

export async function connectWallet(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
}

export async function getAccounts(): Promise<string[]> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return [];
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts;
  } catch (error) {
    console.error('Failed to get accounts:', error);
    return [];
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
