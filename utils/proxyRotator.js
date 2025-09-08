import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function loadProxies() {
    try {
        const proxiesPath = path.join(__dirname, '..', 'proxies.json');
        const proxiesData = fs.readFileSync(proxiesPath, 'utf8');
        return JSON.parse(proxiesData);
    } catch (error) {
        console.error('Error loading proxies:', error.message);
        return [];
    }
}


function getRandomProxy() {
    const proxies = loadProxies();
    if (proxies.length === 0) {
        throw new Error('No proxies available');
    }

    const randomIndex = Math.floor(Math.random() * proxies.length);
    return proxies[randomIndex];
}


function getProxyByIndex(index) {
    const proxies = loadProxies();
    if (index >= proxies.length || index < 0) {
        throw new Error(`Proxy index ${index} out of range. Available: 0-${proxies.length - 1}`);
    }

    return proxies[index];
}


function getAllProxies() {
    return loadProxies();
}

function getProxyCount() {
    return loadProxies().length;
}

// Use func below to test proxy with playwright.
async function testProxy(proxy) {
    const { chromium } = await import('@playwright/test');

    try {
        const browser = await chromium.launch({
            proxy: {
                server: `http://${proxy.ip}:${proxy.port}`,
                username: proxy.username,
                password: proxy.password,
            },
            headless: true
        });

        const context = await browser.newContext();
        const page = await context.newPage();

        const response = await page.goto('https://httpbin.org/ip', { timeout: 10000 });
        const content = await response.text();

        await browser.close();

        return {
            success: response.ok(),
            ip: JSON.parse(content).origin,
            proxy: proxy
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            proxy: proxy
        };
    }
}

async function testAllProxies() {
    const proxies = getAllProxies();
    const results = [];

    console.log(`Testing ${proxies.length} proxies...`);

    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        console.log(`Testing proxy ${i + 1}/${proxies.length}: ${proxy.ip}:${proxy.port}`);

        const result = await testProxy(proxy);
        results.push(result);

        if (result.success) {
            console.log(`✅ ${proxy.ip}:${proxy.port} - Working (IP: ${result.ip})`);
        } else {
            console.log(`❌ ${proxy.ip}:${proxy.port} - Failed (${result.error})`);
        }
    }

    return results;
}

async function getWorkingProxies() {
    const results = await testAllProxies();
    return results.filter(result => result.success);
}

export {
    getAllProxies, getProxyByIndex, getProxyCount, getRandomProxy, getWorkingProxies, loadProxies, testAllProxies, testProxy
};

