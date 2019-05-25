import {Injectable} from '@angular/core';
import contract from 'truffle-contract';
import {Subject} from 'rxjs';
declare let require: any;
const Web3 = require('web3');


declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts: string[];
  public ready = false;

  public accountsObservable = new Subject<string[]>();

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public async bootstrapWeb3() {
    // Modern dapp browsers..
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.log('Cannot send the transaction');
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(this.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    setInterval(() => this.refreshAccounts(), 1000);
  }

  public async artifactsToContract(artifacts) {
    if (!window.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(window.web3.currentProvider);
    return contractAbstraction;

  }

  private refreshAccounts() {
    window.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }
}
