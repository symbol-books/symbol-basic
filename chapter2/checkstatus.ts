import { RepositoryFactoryHttp } from "symbol-sdk";
import { firstValueFrom } from 'rxjs';
const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const tsRepo = repositoryFactory.createTransactionStatusRepository();
  const transactionStatus = await firstValueFrom(tsRepo
    .getTransactionStatus(
      "E90C84A670F83E19410675BE5CD0FBDB0AB467EADC2ED6910F47A27D1BB96F64" //この部分をaggregateTransaction.ts実行結果のTransaction Hashの値に置き換えて下さい
    )) 
  console.log(transactionStatus);
};
example().then();
