import {
  Account,
  AggregateTransaction,
  CosignatureSignedTransaction,
  CosignatureTransaction,
  Deadline,
  PlainMessage,
  RepositoryFactoryHttp,
  SignedTransaction,
  TransactionMapping,
  TransferTransaction,
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

  const innerTx1 = TransferTransaction.create(
    undefined!,
    bob.address,
    [],
    PlainMessage.create("tx1"),
    networkType,
  );

  const innerTx2 = TransferTransaction.create(
    undefined!,
    alice.address,
    [],
    PlainMessage.create("tx2"),
    networkType,
  );

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      innerTx1.toAggregate(alice.publicAccount),
      innerTx2.toAggregate(bob.publicAccount),
    ],
    networkType,
    []
  ).setMaxFeeForAggregate(100, 1);

  let signedTx = alice.sign(aggregateTx, networkGenerationHash);
  let signedHash = signedTx.hash;
  let signedPayload = signedTx.payload;

  console.log(signedPayload);

  const tx = TransactionMapping.createFromPayload(signedPayload);
  console.log(tx);

  const bobSignedTx = CosignatureTransaction.signTransactionPayload(
    bob,
    signedPayload,
    networkGenerationHash
  );
  const bobSignedTxSignature = bobSignedTx.signature;
  const bobSignedTxSignerPublicKey = bobSignedTx.signerPublicKey;

  const cosignSignedTxs = [
    new CosignatureSignedTransaction(
      signedHash,
      bobSignedTxSignature,
      bobSignedTxSignerPublicKey
    ),
  ];
  console.log("--------------------------------");
  console.log(cosignSignedTxs);

  const recreatedTx = TransactionMapping.createFromPayload(signedPayload);

  cosignSignedTxs.forEach((cosignedTx) => {
    signedPayload +=
      cosignedTx.version.toHex() +
      cosignedTx.signerPublicKey +
      cosignedTx.signature;
  });

  console.log(
    "----------------------------------------------------------------"
  );
  console.log(signedPayload);

  const size = `00000000${(signedPayload.length / 2).toString(16)}`;
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(size);
  const formatedSize = size.substr(size.length - 8, size.length);
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(formatedSize);
  const littleEndianSize =
    formatedSize.substr(6, 2) +
    formatedSize.substr(4, 2) +
    formatedSize.substr(2, 2) +
    formatedSize.substr(0, 2);
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(littleEndianSize);

  signedPayload =
    littleEndianSize + signedPayload.substr(8, signedPayload.length - 8);
  console.log(
    "----------------------------------------------------------------"
  );
  console.log(signedPayload);
  const signedTxAll = new SignedTransaction(
    signedPayload,
    signedHash,
    alice.publicKey,
    recreatedTx.type,
    recreatedTx.networkType,
  );

  const txRepo = repositoryFactory.createTransactionRepository();
  const response = await firstValueFrom(txRepo.announce(signedTxAll))
  console.log(response);

};
example().then();
