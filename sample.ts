import { RepositoryFactoryHttp, Account } from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
  const alice = Account.generateNewAccount(networkType!);
  console.log(alice);
  console.log(alice.address);
  console.log(alice.privateKey);
  console.log(alice.publicKey);
};
example().then();
