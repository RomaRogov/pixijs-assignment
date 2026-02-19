import { Assets } from 'pixi.js';

/**
 * Singleton manager for loading and caching game assets
 */
export class AssetManager {
    private static instance: AssetManager;

    private constructor() {
    }

    static getInstance(): AssetManager {
        if (!AssetManager.instance) {
            AssetManager.instance = new AssetManager();
        }
        return AssetManager.instance;
    }

    async initManifest(): Promise<void> {
        await Assets.init({
            basePath: 'assets/',
            manifest: 'manifest.json'
        });
    }

    async loadBundle(bundleName: string): Promise<any> {
        return await Assets.loadBundle(bundleName);
    }

    async load<T = any>(url: string): Promise<T> {
        return await Assets.load<T>(url);
    }

    async loadMultiple(urls: string[]): Promise<any[]> {
        return await Promise.all(urls.map(url => Assets.load(url)));
    }

    get<T = any>(alias: string): T | undefined {
        return Assets.get(alias) as T;
    }

    async unload(url: string | string[]): Promise<void> {
        await Assets.unload(url);
    }
}


