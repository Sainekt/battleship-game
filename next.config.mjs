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
    },
    output: 'standalone',
};

export default nextConfig;
