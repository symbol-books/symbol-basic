import {
  RepositoryFactoryHttp,
  Account,
  TransferTransaction,
  Deadline,
  PlainMessage,
  UInt64,
  AggregateTransaction,
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
  const alicePublicAccount = alice.publicAccount;
  const bob = Account.generateNewAccount(networkType);
  const carol = Account.generateNewAccount(networkType);

  const innerTx1 = TransferTransaction.create(
    undefined!,
    bob.address,
    [],
    PlainMessage.create("tx1"),
    networkType,
  );

  const innerTx2 = TransferTransaction.create(
    undefined!,
    carol.address,
    [],
    PlainMessage.create("tx2"),
    networkType,
  );

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      innerTx1.toAggregate(alicePublicAccount),
      innerTx2.toAggregate(alicePublicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(1000000)
  );
  const txRepo = repositoryFactory.createTransactionRepository();

  const signedTx = alice.sign(aggregateTx, networkGenerationHash);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await firstValueFrom(txRepo.announce(signedTx));
  console.log(response);
};
example().then();
