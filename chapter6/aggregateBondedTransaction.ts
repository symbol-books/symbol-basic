// 仕様
/**
 * HashLockTransactionをネットワークにアナウンス（これが取り込まれないとアグリゲートボンデットトランザクションは
 * 一生取り込まれない
 * 取り込まれたのちにアグリゲートボンデットトランザクションをアナウンス
 * 今回はsetTimeoutで対応
 * ボンデットトランザクションがネットワークに到着したらトランザクションを取得
 * bobの秘密鍵で署名してアナウンス（セットタイムアウトで30秒ほどまつ（ブロック生成期間として）
 * すると自動的にアグリゲートトランザクションが承認される
 */

import {
  RepositoryFactoryHttp,
  Account,
  TransferTransaction,
  Deadline,
  PlainMessage,
  UInt64,
  TransactionGroup,
  AggregateTransaction,
  Mosaic,
  EmptyMessage,
  NamespaceId,
  HashLockTransaction,
  CosignatureTransaction,
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
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType);

  // アグリゲートボンデットトランザクションの作成
  // ２つのトランザクション
  const tx1 = TransferTransaction.create(
    undefined!,
    bob.address, //Bobへの送信
    [
      //1XYM
      new Mosaic(new NamespaceId("symbol.xym"), UInt64.fromUint(1000000)),
    ],
    EmptyMessage, //メッセージ無し
    networkType,
  );

  const tx2 = TransferTransaction.create(
    undefined!,
    alice.address, // Aliceへの送信
    [],
    PlainMessage.create("thank you"), //メッセージ
    networkType,
  );

  const aggregateArray = [
    tx1.toAggregate(alice.publicAccount), //Aliceからの送信
    tx2.toAggregate(bob.publicAccount), // Bobからの送信
  ];

  //アグリゲートボンデッドトランザクション
  const aggregateTx = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    aggregateArray,
    networkType,
    []
  ).setMaxFeeForAggregate(100, 1);

  //署名
  const signedAggregateTx = alice.sign(aggregateTx, networkGenerationHash);
  console.log(
    "--------------------------------payload--------------------------------"
  );
  console.log(signedAggregateTx.payload);

  // ハッシュロックTXを作成
  const hashLockTx = HashLockTransaction.create(
    Deadline.create(epochAdjustment),
    new Mosaic(new NamespaceId("symbol.xym"), UInt64.fromUint(10 * 1000000)),
    UInt64.fromUint(480),
    signedAggregateTx,
    networkType,
  ).setMaxFee(100);

  const signedLockTx = alice.sign(hashLockTx, networkGenerationHash);

  console.log(
    signedAggregateTx.hash,
    "アグリゲートトランザクションのハッシュ値"
  );
  console.log(signedLockTx.hash, "ロックトランザクションのハッシュ値");
  const txRepo = repositoryFactory.createTransactionRepository();

  const lockResponse = await firstValueFrom(txRepo.announce(signedLockTx)); // --------①
  console.log(lockResponse);

  // １ブロック分settimeoutするよ
  setTimeout(async () => { // --------②
    const txResponse = await firstValueFrom(txRepo // --------③
      .announceAggregateBonded(signedAggregateTx)) 
    console.log(txResponse);
    // １ブロック分settimeoutするよ
    setTimeout(async () => { // --------④
      const txInfo = await firstValueFrom(txRepo
        .getTransaction(signedAggregateTx.hash, TransactionGroup.Partial)) 
      const cosignatureTx = CosignatureTransaction.create(
        txInfo as AggregateTransaction
      );
      console.log(cosignatureTx);
      const singedCosTx = bob.signCosignatureTransaction(cosignatureTx);
      console.log(singedCosTx);
      console.log("--------------------------------");
      await firstValueFrom(txRepo.announceAggregateBondedCosignature(singedCosTx)) // --------⑤
      console.log("finish");
    }, 30000); // --------②
  }, 30000); // --------②
};
example()
  .then()
  .catch((err) => console.log(err));
