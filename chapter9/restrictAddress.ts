import {
  Account,
  AccountRestrictionTransaction,
  AddressRestrictionFlag,
  Deadline,
  RepositoryFactoryHttp,
} from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14XXXXXXXXXX";

const restrictedAccountPrivateKey =
  "24A345C541C38289171225EE060A7FAC7E9DF2479DA5FE0BC7XXXXXXXXX";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await firstValueFrom(repositoryFactory.getEpochAdjustment());
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
  const networkGenerationHash = await firstValueFrom (repositoryFactory.getGenerationHash())

  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType);
  const restrict = Account.createFromPrivateKey(
    restrictedAccountPrivateKey,
    networkType,
  );

  const tx =
    AccountRestrictionTransaction.createAddressRestrictionModificationTransaction(
      Deadline.create(epochAdjustment),
      AddressRestrictionFlag.BlockIncomingAddress,
      [bob.address],
      [],
      networkType,
    ).setMaxFee(100);
  const signedTx = restrict.sign(tx, networkGenerationHash);
  const txRepo = repositoryFactory.createTransactionRepository();

  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);

};
example().then();
