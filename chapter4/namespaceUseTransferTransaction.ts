import {
  RepositoryFactoryHttp,
  Account,
  TransferTransaction,
  Deadline,
  EmptyMessage,
  NamespaceId,
} from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

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

  const namespaceId = new NamespaceId("matsumoto"); //この部分をご自身で考えたユニークな文字列にする（例 matsumoto012345）
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType);
  // トランザクションの作成
  const tx = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    namespaceId,
    [],
    EmptyMessage,
    networkType,
  ).setMaxFee(100);

  // 署名
  const signedTx = bob.sign(tx, networkGenerationHash);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);
};
example().then();
