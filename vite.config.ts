import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import { AssetPack } from '@assetpack/core';
import assetpackConfig from './.assetpack.ts';

function assetpackPlugin(): Plugin {
    const apConfig = { ...assetpackConfig };
    let mode: ResolvedConfig['command'];
    let ap: AssetPack | undefined;

    return {
        name: 'vite-plugin-assetpack',
        configResolved(resolvedConfig) {
            mode = resolvedConfig.command;
            if (!resolvedConfig.publicDir) return;
            if (apConfig.output) return;
            const publicDir = resolvedConfig.publicDir.replace(process.cwd(), '');
            apConfig.output = `.${publicDir}/assets/`;
        },
        buildStart: async () => {
            if (mode === 'serve') {
                if (ap) return;
                ap = new AssetPack(apConfig);
                // Run initial asset generation before starting watch
                await ap.run();
                void ap.watch();
            } else {
                await new AssetPack(apConfig).run();
            }
        },
        buildEnd: async () => {
            if (ap) {
                await ap.stop();
                ap = undefined;
            }
        },
    };
}

export default defineConfig({
    base: '/pixijs-assignment/',
    plugins: [
        assetpackPlugin()
    ],
    build: {
        outDir: 'build',
        emptyOutDir: true,
        sourcemap: true,
    },
    server: {
        host: true,
        port: 8080,
        open: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
});


