import {
  Account,
  AccountRestrictionTransaction,
  Deadline,
  MosaicId,
  MosaicRestrictionFlag,
  RepositoryFactoryHttp,
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

  const mosaicId = new MosaicId("72C0212E67A08BCE");  //この部分を2-3章で作成したmosaicのIDを指定する
  const tx = AccountRestrictionTransaction.createMosaicRestrictionModificationTransaction(
    Deadline.create(epochAdjustment),
    MosaicRestrictionFlag.BlockMosaic,
    [mosaicId],
    [],
    networkType,
  ).setMaxFee(100);
  const signedTx = restrict.sign(tx, networkGenerationHash);
  const txRepo = repositoryFactory.createTransactionRepository();

  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);

};
example().then();
