import {
  Account,
  AggregateTransaction,
  Deadline,
  KeyGenerator,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicRestrictionTransactionService,
  MosaicRestrictionType,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  RepositoryFactoryHttp,
  UInt64,
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

  const nsRepo = repositoryFactory.createNamespaceRepository();
  const resMosaicRepo = repositoryFactory.createRestrictionMosaicRepository();
  const mosaicResService = new MosaicRestrictionTransactionService(
    resMosaicRepo,
    nsRepo
  );

  const supplyMutable = true;
  const transferable = true;
  const restrictable = true;
  const revokable = true;

  const nonce = MosaicNonce.createRandom();
  const mosaicDefTx = MosaicDefinitionTransaction.create(
    undefined!,
    nonce,
    MosaicId.createFromNonce(nonce, alice.address),
    MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
    0,
    UInt64.fromUint(0),
    networkType,
  );

  const mosaicChangeTx = MosaicSupplyChangeTransaction.create(
    undefined!,
    mosaicDefTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(1000000),
    networkType,
  );

  const key = KeyGenerator.generateUInt64Key("KYC");
  const mosaicGlobalResTx = await firstValueFrom(mosaicResService
    .createMosaicGlobalRestrictionTransaction(
      undefined!,
      networkType,
      mosaicDefTx.mosaicId,
      key,
      "1",
      MosaicRestrictionType.EQ
  ));

  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      mosaicDefTx.toAggregate(alice.publicAccount),
      mosaicChangeTx.toAggregate(alice.publicAccount),
      mosaicGlobalResTx.toAggregate(alice.publicAccount),
    ],
    networkType,
    []
  ).setMaxFeeForAggregate(100, 0);

  const signedTx = alice.sign(aggregateTx, networkGenerationHash);
  const txRepo = repositoryFactory.createTransactionRepository();
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);

};
example().then();
