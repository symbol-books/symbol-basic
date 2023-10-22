import { RepositoryFactoryHttp, NamespaceId } from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const nsRepo = repositoryFactory.createNamespaceRepository();
  const namespaceInfo = await firstValueFrom(nsRepo.
    getNamespace(new NamespaceId("matsumoto"))) //この部分をご自身で考えたユニークな文字列にする（例 matsumoto012345）
  const namespaceMosaicInfo = await firstValueFrom(nsRepo.
    getNamespace(new NamespaceId("matsumoto.tomato"))) //この部分をご自身で考えたユニークな文字列にする（例 matsumoto012345.tomato）
  console.log(namespaceInfo);
  console.log(namespaceMosaicInfo);
};
example().then();