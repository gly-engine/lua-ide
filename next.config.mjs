import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/lua-ide' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/lua-ide/' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ["monaco-editor"],
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.csv$/,
      use: "raw-loader",
    });

    if (!isServer) {
      config.resolve.fallback = { fs: false, module: false, net: false, tls: false };
    };

    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },
}

export default withSerwist(nextConfig)

