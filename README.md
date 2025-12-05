# Strands TypeScript + API Gateway Response Streaming

Amazon API Gateway の Response Streaming と Strands SDK (TypeScript) を組み合わせたサンプルプロジェクト。

## 構成

- **packages/strands-agent**: Strands SDK を使った Lambda 関数
- **packages/cdk**: AWS CDK によるインフラ定義

## 前提条件

- Node.js 22.x
- pnpm
- AWS CLI（認証情報設定済み）
- Amazon Bedrock へのアクセス権限

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# Strands Agent のビルド
pnpm strands-agent:build

# CDK のビルド
pnpm cdk:build
```

## デプロイ

```bash
# CDK のデプロイ
pnpm cdk:deploy
```

## 動作確認

```bash
export API_ENDPOINT="<デプロイ後の ChatEndpoint URL>"
curl -N -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは"}'
```

## クリーンアップ

```bash
pnpm cdk:destroy
```
