import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  NamespaceRegistrationTransaction,
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

  const nwRepo = repositoryFactory.createNetworkRepository();
  const txRepo = repositoryFactory.createTransactionRepository();
  const rentalFees = await firstValueFrom(nwRepo.getRentalFees())
  const rootNsperBlock =
    rentalFees.effectiveRootNamespaceRentalFeePerBlock.compact();
  const rentalDays = 365;
  const rentalBlock = (rentalDays * 24 * 60 * 60) / 30;
  const rootNsRenatalFeeTotal = rentalBlock * rootNsperBlock;
  console.log("rentalBlock:" + rentalBlock);
  console.log("rootNsRenatalFeeTotal:" + rootNsRenatalFeeTotal);
  const namespaceName = "matsumoto" //この部分をご自身で考えたユニークな文字列にする（例 matsumoto012345）

  // トランザクションの作成
  const tx = NamespaceRegistrationTransaction.createRootNamespace(
    Deadline.create(epochAdjustment),
    namespaceName,
    UInt64.fromUint(172800),
    networkType,
  ).setMaxFee(100);
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const signedTx = alice.sign(tx, networkGenerationHash);
  console.log("Payload:", signedTx.payload);
  console.log("Transaction Hash:", signedTx.hash);
  const response = await firstValueFrom(txRepo.announce(signedTx))
  console.log(response);
};
example().then();
