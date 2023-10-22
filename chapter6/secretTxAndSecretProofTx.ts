import {
  RepositoryFactoryHttp,
  Account,
  Deadline,
  UInt64,
  Mosaic,
  NamespaceId,
  Crypto,
  SecretLockTransaction,
  LockHashAlgorithm,
  SecretProofTransaction,
} from "symbol-sdk";
import { firstValueFrom } from 'rxjs';
import { sha3_256 } from "js-sha3"; //------ ①

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
  const txRepo = repositoryFactory.createTransactionRepository();

  console.log(bob.address);

  const random = Crypto.randomBytes(20); //------ ②
  const hash = sha3_256.create(); //------ ②
  const secret = hash.update(random).hex(); //------ ②
  const proof = random.toString("hex"); //------ ②
  console.log("secret:" + secret);
  console.log("proof:" + proof);

  const lockTx = SecretLockTransaction.create(
    Deadline.create(epochAdjustment),
    new Mosaic(new NamespaceId("symbol.xym"), UInt64.fromUint(334000000)),
    UInt64.fromUint(480),
    LockHashAlgorithm.Op_Sha3_256,
    secret,
    bob.address,
    networkType,
  ).setMaxFee(100);

  const signedLockTx = alice.sign(lockTx, networkGenerationHash);
  await firstValueFrom(txRepo.announce(signedLockTx));

  setTimeout(async () => {
    const slRepo = repositoryFactory.createSecretLockRepository();
    const res = await firstValueFrom(slRepo.search({ secret: secret }));
    console.log(res.data);
    setTimeout(async () => {
      const proofTx = SecretProofTransaction.create(
        Deadline.create(epochAdjustment),
        LockHashAlgorithm.Op_Sha3_256,
        secret,
        bob.address,
        proof,
        networkType,
      ).setMaxFee(100);

      const singedProofTx = bob.sign(proofTx, networkGenerationHash);
      await firstValueFrom(txRepo.announce(singedProofTx));
      console.log("finish");
    }, 30000);
  }, 30000);
};
example().then();
