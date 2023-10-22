import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  UInt64,
  AggregateTransaction,
  MetadataTransactionService,
  KeyGenerator,
} from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

const alicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329XXXXXXXXXX";

const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14XXXXXXXXXX";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await firstValueFrom(repositoryFactory.getEpochAdjustment());
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
  const networkGenerationHash = await firstValueFrom (repositoryFactory.getGenerationHash())
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType);
  // トランザクションの作成
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const metaRepo = repositoryFactory.createMetadataRepository();
  const metaService = new MetadataTransactionService(metaRepo);

  const key = KeyGenerator.generateUInt64Key("key_account");
  const value = "test-bob";

  const tx = await firstValueFrom(metaService
    .createAccountMetadataTransaction(
      undefined!,
      networkType,
      bob.address,
      key,
      value,
      alice.address,
      UInt64.fromUint(0)
  )) 

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [tx.toAggregate(alice.publicAccount)],
    networkType,
    []
  ).setMaxFeeForAggregate(100, 1);
  const txRepo = repositoryFactory.createTransactionRepository();

  // 署名
  const signedTx = alice.signTransactionWithCosignatories(
    aggregateTx,
    [bob],
    networkGenerationHash
  );
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);
};
example().then();

// next 5 モザイク
