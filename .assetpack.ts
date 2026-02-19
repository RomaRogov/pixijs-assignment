import { compress } from '@assetpack/core/image';
import { pixiManifest } from '@assetpack/core/manifest';
import { texturePacker } from '@assetpack/core/texture-packer';
import { msdfFont } from '@assetpack/core/webfont';

export default {
    entry: './src/assets/',
    output: './public/assets',
    cache: false,
    pipes: [
        texturePacker({
            resolutionOptions: {
                resolutions: { default: 1 },
            },
        }),
        msdfFont({
            font: {
                outputType: 'xml',
                fontSize: 37,
                textureSize: [256, 256],
                distanceRange: 4,
                charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:\'"()-/@#$%&*+=[]{}|\\_<>`~’',
            },
        }),
        compress({
            png: {
                compressionLevel: 9,
                progressive: false,
                adaptiveFiltering: true,
                palette: true,
                quality: 90
            },
            jpg: {},
            webp: false,
        }),
        pixiManifest({
            output: './public/assets/manifest.json',
            trimExtensions: true,
            createShortcuts: true,
            nameStyle: 'short'
        }),
    ],
};


