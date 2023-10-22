import {
  Account,
  AccountRestrictionTransaction,
  Deadline,
  OperationRestrictionFlag,
  RepositoryFactoryHttp,
  TransactionType,
} from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

const restrictedAccountPrivateKey = "24A345C541C38289171225EE060A7FAC7E9DF2479DA5FE0BC7XXXXXXXXX"

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await firstValueFrom(repositoryFactory.getEpochAdjustment());
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
  const networkGenerationHash = await firstValueFrom (repositoryFactory.getGenerationHash())

  const restrict = Account.createFromPrivateKey(restrictedAccountPrivateKey, networkType);

  const tx = AccountRestrictionTransaction.createOperationRestrictionModificationTransaction(
    Deadline.create(epochAdjustment),
    OperationRestrictionFlag.AllowOutgoingTransactionType,
    [TransactionType.ACCOUNT_OPERATION_RESTRICTION],
    [],
    networkType,
  ).setMaxFee(100);
  const signedTx = restrict.sign(tx, networkGenerationHash);
  const txRepo = repositoryFactory.createTransactionRepository();

  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);

};
example().then();
