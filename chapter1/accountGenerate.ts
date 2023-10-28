import { RepositoryFactoryHttp, Account } from "symbol-sdk";
import { firstValueFrom } from 'rxjs';
const example = async (): Promise<void> => { //   
const nodeUrl = "http://sym-test-01.opening-line.jp:3000"; //   2 
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
const alice = Account.generateNewAccount(networkType); //   3 
  console.dir(alice,{depth: null}); //   4
  console.log(`address: ${alice.address.plain()}`);
  console.log(`publicKey ${alice.publicKey}`);
  console.log(`privateKey ${alice.privateKey}`);
};
example().then(); //   5

