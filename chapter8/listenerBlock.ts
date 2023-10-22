import { Listener, RepositoryFactoryHttp } from "symbol-sdk";
import WebSocket from "ws";


const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);

  const nsRepo = repositoryFactory.createNamespaceRepository();
  const wsEndpoint = nodeUrl.replace("http", "ws") + "/ws";
  const listener = new Listener(wsEndpoint, nsRepo, WebSocket);
  listener.open().then(() => {
    listener
      .newBlock()
      .subscribe((block) => console.log("新しく生成されたブロック", block));
  });
};
example().then();
