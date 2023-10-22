import {
  RepositoryFactoryHttp,
  Address,
} from "symbol-sdk"; // ----①
const AliceAddress = "TABJ6AP5WNPZF2BEEN2WA6RFK7HR2VCQWXUU6UI"; // ----②

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const accountHttp = repositoryFactory.createAccountRepository(); // ----③
  const alice = Address.createFromRawAddress(AliceAddress); // ----④
  accountHttp.getAccountInfo(alice).subscribe( // ----⑤
    (accountInfo) => {
      accountInfo.mosaics.forEach((mosaic) => {
        console.log("id:" + mosaic.id.toHex()); //16進数
        console.log("amount:" + mosaic.amount.toString()); //文字列
      });
    },
    (err) => console.log(err)
  );
};
example().then();
