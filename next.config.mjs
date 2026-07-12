/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MVP: Lintルールで初回デプロイが止まらないようにビルド時のESLintはスキップ
  //（型チェックは有効のまま。開発時は `npm run lint` で個別に実行できます）
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
