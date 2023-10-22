import { RepositoryFactoryHttp, Account, TransactionGroup } from "symbol-sdk";
import { firstValueFrom } from 'rxjs';
const alicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329XXXXXXXXXX";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const txRepo = repositoryFactory.createTransactionRepository(); 
  const result = await firstValueFrom(txRepo 
    .search({
      group: TransactionGroup.Confirmed,
      embedded: true,
      address: alice.address,
    })) 
  console.log(result);
};
example().then();
