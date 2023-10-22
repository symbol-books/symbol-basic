import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  NamespaceId,
  AliasTransaction,
  AliasAction,
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
  const txRepo = repositoryFactory.createTransactionRepository();

  const namespaceId = new NamespaceId("matsumoto012345"); //この部分をご自身で考えたユニークな文字列にする（例 matsumoto012345）
  // トランザクションの作成
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const tx = AliasTransaction.createForAddress(
    Deadline.create(epochAdjustment),
    AliasAction.Link,
    namespaceId,
    alice.address,
    networkType,
  ).setMaxFee(100);
  const signedTx = alice.sign(tx, networkGenerationHash);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);
};
example().then();
