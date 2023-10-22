import {
  RepositoryFactoryHttp,
  Account,
  TransferTransaction,
  Deadline,
  UInt64,
  Mosaic,
  EmptyMessage,
  NamespaceId,
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
  const txRepo = repositoryFactory.createTransactionRepository();

  const namespaceIdMosaic = new NamespaceId("matsumoto.tomato"); //この部分をご自身で考えたユニークな文字列にする（例 matsumoto012345.tomato）
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType);
  // トランザクションの作成
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const tx = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    bob.address,
    [new Mosaic(namespaceIdMosaic, UInt64.fromUint(100))],
    EmptyMessage,
    networkType,
  ).setMaxFee(100);

  // 署名
  const signedTx = alice.sign(tx, networkGenerationHash);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);
};
example().then();
