import {
  Account,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Mosaic,
  MosaicId,
  PlainMessage,
  RepositoryFactoryHttp,
  TransactionService,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

const alicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329XXXXXXXXXX";
const bobPrivateKey =
  "EC8E918A532CB53E62C52B06F9B792CE5B073B90066FBB3A210B14XXXXXXXXXX";
const davitPrivateKey =
  "CE13ADB8CCB0E5A9567525EA1EC86B40E24FB0B273FF924852CXXXXXXXXXX";
const symbolMosaicId = "72C0212E67A08BCE";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await firstValueFrom(repositoryFactory.getEpochAdjustment());
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType());
  const networkGenerationHash = await firstValueFrom (repositoryFactory.getGenerationHash())

  const networkCurrencyMosaicId = new MosaicId(symbolMosaicId);
  const networkCurrencyDivisibility = 6;

  const listener = repositoryFactory.createListener();
  const receiptHttp = repositoryFactory.createReceiptRepository();
  const transactionHttp = repositoryFactory.createTransactionRepository();
  const transactionService = new TransactionService(
    transactionHttp,
    receiptHttp
  );
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType);
  const davit = Account.createFromPrivateKey(davitPrivateKey, networkType);

  // -----①
  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    alice.address,
    [
      new Mosaic(
        networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
      ),
    ],
    PlainMessage.create("sending 10 symbol.xym multisig"),
    networkType,
  );
  // -----①
  // -----②
  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [transferTransaction.toAggregate(davit.publicAccount)],
    networkType,
    [],
    UInt64.fromUint(2000000)
  );
  // -----②
  // -----③
  const signedTransaction = bob.sign(
    aggregateTransaction,
    networkGenerationHash
  );
  // -----③
  console.log(signedTransaction.hash);
  console.log("--------------------------------");
  console.log(signedTransaction.payload);

  const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(epochAdjustment),
    new Mosaic(
      networkCurrencyMosaicId,
      UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
    ),
    UInt64.fromUint(480),
    signedTransaction,
    networkType,
    UInt64.fromUint(2000000)
  );

  const singedHashLockTransaction = bob.sign(
    hashLockTransaction,
    networkGenerationHash
  );

  // -----④
  listener.open().then(() => {
    transactionService
      .announceHashLockAggregateBonded(
        singedHashLockTransaction,
        signedTransaction,
        listener
      )
      .subscribe(
        (x) => console.log(x),
        (err) => console.log(err),
        () => listener.close()
      );
  });
  // -----④
};
example().then();
