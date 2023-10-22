import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  UInt64,
  AggregateTransaction,
  MosaicId,
  MetadataTransactionService,
  KeyGenerator,
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

  // 各種リポジトリ
  const txRepo = repositoryFactory.createTransactionRepository();
  const metaRepo = repositoryFactory.createMetadataRepository();
  const mosaicRepo = repositoryFactory.createMosaicRepository();

  // メタデータサービス
  const metaService = new MetadataTransactionService(metaRepo);

  // mosaicId
  const mosaicId = new MosaicId("7DF08F144FBC8CC0");  //この部分を2-3章で作成したmosaicのIDを指定する
  const mosaicInfo = await firstValueFrom(mosaicRepo.getMosaic(mosaicId));

  const key = KeyGenerator.generateUInt64Key("key_mosaic");
  const value = "test-mosaic";

  const tx = await firstValueFrom(metaService
    .createMosaicMetadataTransaction(
      undefined!,
      networkType,
      mosaicInfo.ownerAddress,
      mosaicId,
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
  ).setMaxFeeForAggregate(100, 0);

  // 署名
  const signedTx = alice.sign(aggregateTx, networkGenerationHash);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);
};
example().then();
