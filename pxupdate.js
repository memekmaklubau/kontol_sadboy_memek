const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape proxies from a single raw content URL
async function scrapeProxy(url) {
    try {
        const response = await axios.get(url);
        const proxies = response.data.trim().split('\n');
        return proxies;
    } catch (error) {
        throw new Error(`Error scraping ${url}: ${error.message}`);
    }
}

// Function to scrape proxies from multiple raw content URLs
async function scrapeProxies(urls) {
    try {
        let allProxies = [];
        for (const url of urls) {
            try {
                const proxies = await scrapeProxy(url);
                allProxies = allProxies.concat(proxies);
            } catch (error) {
                console.error(`Error scraping ${url}: ${error.message}`);
            }
        }
        return allProxies;
    } catch (error) {
        throw new Error(`Error scraping proxies: ${error.message}`);
    }
}

// Function to check if proxy.txt exists in the directory
async function checkProxyFileExists() {
    try {
        await fs.promises.access('proxy.txt', fs.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}

// Main function to scrape proxies, remove existing proxy.txt (if any), and save proxies to proxy.txt
async function scrapeAndSaveProxies() {
    try {
        // Fetch list of web proxy URLs from the provided URL
        const response = await axios.get('https://raw.githubusercontent.com/Hhhusvdjwhsh/Fuckproxy/main/list.txt');
        const webList = response.data.trim().split('\n');

        // Scrape proxies from the web proxy URLs
        const proxies = await scrapeProxies(webList);

        // Check if proxy.txt exists, if yes, remove it
        const proxyFileExists = await checkProxyFileExists();
        if (proxyFileExists) {
            await fs.promises.unlink('proxy.txt');
            console.log('Existing proxy.txt removed');
        }

        // Write proxies to proxy.txt
        await fs.promises.writeFile('proxy.txt', proxies.join('\n'));
        console.log('Proxies saved to proxy.txt');
    } catch (error) {
        console.error('Error scraping and saving proxies:', error.message);
    }
}

// Run scrapeAndSaveProxies every 5 minutes
 // 5 minutes interval (in milliseconds)

// Initial run
scrapeAndSaveProxies();