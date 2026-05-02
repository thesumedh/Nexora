import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

const mnemonic = 'final meat before usage mammal now turtle ritual coast weasel sorry torch';
const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'akash' });
const [account] = await wallet.getAccounts();
console.log('Your Akash address:', account.address);
