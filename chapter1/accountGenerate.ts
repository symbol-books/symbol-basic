import { RepositoryFactoryHttp, Account } from "symbol-sdk";
import { firstValueFrom } from 'rxjs'; 
const example = async (): Promise<void> => { // ------①
const nodeUrl = "http://sym-test-01.opening-line.jp:3000"; // ------②
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
const alice = Account.generateNewAccount(networkType); // ------③
console.log(alice); // ------④
console.log(`address: ${alice.address.plain()}`);
console.log(`publicKey ${alice.publicKey}`);
console.log(`privateKey ${alice.privateKey}`);
};
example().then(); // ------⑤