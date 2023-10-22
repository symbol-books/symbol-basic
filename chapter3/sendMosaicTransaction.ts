import {
  RepositoryFactoryHttp,
  Account,
  TransferTransaction,
  Deadline,
  UInt64,
  MosaicId,
  Mosaic,
  EmptyMessage,
} from "symbol-sdk";
import { firstValueFrom } from 'rxjs';
const alicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329XXXXXXXXXX";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await firstValueFrom(repositoryFactory.getEpochAdjustment());
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
  const networkGenerationHash = await firstValueFrom (repositoryFactory.getGenerationHash())
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const bob = Account.generateNewAccount(networkType);

  const tx = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    bob.address,
    [
      new Mosaic(new MosaicId("72C0212E67A08BCE"), UInt64.fromUint(10000000)),
      new Mosaic(new MosaicId("7DF08F144FBC8CC0"), UInt64.fromUint(1000)), // createMosaicTransactionで作成したモザイクIDを指定する
    ],
    EmptyMessage,
    networkType,
  ).setMaxFee(100);

  const txRepo = repositoryFactory.createTransactionRepository();

  const signedTx = alice.sign(tx, networkGenerationHash);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);
};
example().then();
