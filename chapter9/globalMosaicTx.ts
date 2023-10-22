import {
  Account,
  Deadline,
  KeyGenerator,
  MosaicAddressRestrictionTransaction,
  MosaicId,
  RepositoryFactoryHttp,
  UInt64,
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

  const mosaicId = new MosaicId("22881E7231616043");  //この部分を2-9-3章で作成したmosaicのIDを指定する
  const aliceMosaicAddressResTx = MosaicAddressRestrictionTransaction.create(
    Deadline.create(epochAdjustment),
    mosaicId,
    KeyGenerator.generateUInt64Key("KYC"),
    alice.address,
    UInt64.fromUint(1),
    networkType,
    UInt64.fromHex("FFFFFFFFFFFFFFFF")
  ).setMaxFee(100);

  const signedTx = alice.sign(aliceMosaicAddressResTx, networkGenerationHash);
  const txRepo = repositoryFactory.createTransactionRepository();
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);  

  const bobMosaicAddressResTx = MosaicAddressRestrictionTransaction.create(
    Deadline.create(epochAdjustment),
    mosaicId,
    KeyGenerator.generateUInt64Key("KYC"),
    bob.address,
    UInt64.fromUint(1),
    networkType,
    UInt64.fromHex("FFFFFFFFFFFFFFFF")
  ).setMaxFee(100);
  const signedTx2 = alice.sign(bobMosaicAddressResTx, networkGenerationHash);
  const response2 = await firstValueFrom(txRepo.announce(signedTx2))
  console.log(response2);

};
example().then();
