import {
  RepositoryFactoryHttp,
  Account,
  Address,
  TransferTransaction,
  Deadline,
  PlainMessage,
  UInt64,
} from "symbol-sdk"; // ---- ①
import { firstValueFrom } from 'rxjs';
const alicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329XXXXXXXXXX"; // ---- ②
const bobAddress = "TBH3OVV3AFONJZSYOMUILGERPNYY77AISF54C4Q"; // ---- ②

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000"; // ---- ③
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl); // ---- ④
  const epochAdjustment = await firstValueFrom(repositoryFactory.getEpochAdjustment()); // ---- ⑤
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType()); // ---- ⑤
  const networkGenerationHash = await firstValueFrom (repositoryFactory.getGenerationHash()) // ---- ⑤
  const recipientAddress = Address.createFromRawAddress(bobAddress); // ---- ⑥
  const transferTransaction = TransferTransaction.create( // ---- ⑦
    Deadline.create(epochAdjustment), // 有効期限
    recipientAddress, // 受取人のアドレス
    [], // 送信するモザイクとその数量
    PlainMessage.create("This is a test message"), // メッセージ
    networkType, // ネットワークタイプ
    UInt64.fromUint(2000000) // 手数料
  );

  const account = Account.createFromPrivateKey(alicePrivateKey, networkType); // ---- ⑧
  const signedTransaction = account.sign( // ---- ⑨
    transferTransaction,
    networkGenerationHash
  );
  console.log(signedTransaction.hash, "hash");
  console.log("--------------------------------")
  console.log(signedTransaction.payload, "payload");
  const transactionRepository = repositoryFactory.createTransactionRepository(); // ---- ⑩
  const response = await firstValueFrom (transactionRepository.announce(signedTransaction))
  console.log(response);
};
example().then();
