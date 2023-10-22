import {
  Account,
  Listener,
  RepositoryFactoryHttp,
} from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

import WebSocket from "ws";

const alicePrivateKey =
  "B82E003F3DAF29C1E55C39553327B8E178D820396C8A6144AA71329XXXXXXXXXX";

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const networkType = await firstValueFrom(repositoryFactory.getNetworkType());

  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);

  const nsRepo = repositoryFactory.createNamespaceRepository();
  const wsEndpoint = nodeUrl.replace("http", "ws") + "/ws";
  const listener = new Listener(wsEndpoint, nsRepo, WebSocket);
  listener.open().then(() => {
    listener.confirmed(alice.address).subscribe((tx) => {
      console.log("承認済みトランザクション", tx);
    });

    listener.unconfirmedAdded(alice.address).subscribe((tx) => {
      console.log("未承認トランザクション", tx);
    });
  });
};
example().then();
