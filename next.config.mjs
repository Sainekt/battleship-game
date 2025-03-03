import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizeCss: true,
        useLightningcss: false,
        turbo: {},
    },
    crossOrigin: 'use-credentials',
    webpack: (config) => {
        if (process.env.NODE_ENV !== 'development') {
            return {
                ...config,
                cache: {
                    type: 'filesystem',
                    buildDependencies: {
                        config: [path.resolve('next.config.mjs')],
                    },
                    name: 'nextjs-build-cache',
                },
            };
        }
        return config;
    },
    output: 'standalone',
};

export default nextConfig;
