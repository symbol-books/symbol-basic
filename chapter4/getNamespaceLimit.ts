import { RepositoryFactoryHttp, NamespaceId } from "symbol-sdk";
import { firstValueFrom } from 'rxjs';

const example = async (): Promise<void> => {
  // Network information
  const nodeUrl = "http://sym-test-01.opening-line.jp:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await firstValueFrom(repositoryFactory.getEpochAdjustment());
  const nsRepo = repositoryFactory.createNamespaceRepository(); // 名前空間に関する情報を取得するためのメソッドが利用可能になります。
  const chainRepo = repositoryFactory.createChainRepository(); // チェーン（ブロックチェーン）に関する情報を取得するためのメソッドが利用可能になります。
  const blockRepo = repositoryFactory.createBlockRepository(); // 個別のブロックに関する情報を取得するためのメソッドが利用可能になります。

  const namespaceId = new NamespaceId("matsumoto");//この部分をご自身で考えたユニークな文字列にする（例 matsumoto012345）
  const nsInfo = await firstValueFrom(nsRepo.getNamespace(namespaceId)); // 名前空間の詳細情報を取得します。
  const lastHeight = (await firstValueFrom(chainRepo.getChainInfo())).height; // ブロックチェーンの最新のブロック高（つまり、最新のブロックの番号）を取得します。
  const lastBlock = await firstValueFrom(blockRepo.getBlockByHeight(lastHeight)); // 最新のブロックの詳細情報を取得します。
  const remainHeight = nsInfo.endHeight.compact() - lastHeight.compact(); // 名前空間の終了ブロック高から現在のブロック高を引き、名前空間が有効である残りのブロック数を計算します。

  const endDate = new Date(// 最新のブロックのタイムスタンプ（UNIX時間）に、残りのブロック数に30000（Symbolのブロック時間は約30秒）を掛けた時間と、エポック調整値を加えた時間を加算して、名前空間の終了日時（有効期限）を計算します。
    lastBlock.timestamp.compact() +
      remainHeight * 30000 +
      epochAdjustment * 1000
  );
  console.log(endDate);
};
example().then();