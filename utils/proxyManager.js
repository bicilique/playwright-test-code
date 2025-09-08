import { getWorkingProxies } from './proxyRotator.js';

class ProxyManager {
  constructor() {
    this.workingProxies = [];
    this.currentIndex = 0;
    this.requestCount = 0;
    this.rotationInterval = 5; // tldr; can be moved to .env if needed.
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    console.log('🔄 Loading working proxies...');
    this.workingProxies = await getWorkingProxies();

    if (this.workingProxies.length === 0) {
      throw new Error('No working proxies available');
    }

    console.log(`✅ Loaded ${this.workingProxies.length} working proxies`);
    this.isInitialized = true;
  }

  getCurrentProxy() {
    if (!this.isInitialized) {
      throw new Error('ProxyManager not initialized. Call initialize() first.');
    }

    const proxy = this.workingProxies[this.currentIndex];
    console.log(`🌐 Using proxy ${this.currentIndex + 1}/${this.workingProxies.length}: ${proxy.proxy.ip}:${proxy.proxy.port}`);
    return proxy;
  }

  rotateProxy() {
    this.requestCount++;

    if (this.requestCount >= this.rotationInterval) {
      this.currentIndex = (this.currentIndex + 1) % this.workingProxies.length;
      this.requestCount = 0;
      console.log(`🔄 Rotated to proxy ${this.currentIndex + 1}/${this.workingProxies.length}`);
    }
  }

  getProxyCount() {
    return this.workingProxies.length;
  }

  getCurrentRequestCount() {
    return this.requestCount;
  }

  getRotationInterval() {
    return this.rotationInterval;
  }
}

// Singleton to preserve mem usage, since proxy will only need to be init once.
const proxyManager = new ProxyManager();

export default proxyManager;
