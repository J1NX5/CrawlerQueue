import { DoneCallback, Job } from "bee-queue"
import { JobConfig } from "./job.interface"
import {} from 'puppeteer-core'
const puppeteer = require('puppeteer-core');
const urlModule = require('url');
const fs = require('fs');
const { register } = require('module');




async function buildRegEx(words: string[] = []){
    //const regexString = '/' + words.join('&') + '/gi'
    let regexString = ''

    words.forEach(element => {
        regexString += "(?=.*" + element + ")"
    });

    regexString = "/" + regexString + "/gi"
    return regexString
}

async function scrapePage(browser, url, regex, visited = new Set()) {
    let scrapeMatches = new Set()
    let scrapeNoMatches = new Set()
    
    // Check if the URL has already been visited
    if (visited.has(url)) return [];

    // Mark the URL as visited
    visited.add(url);

    console.info('Scrape Seite:', url);

    const page = await browser.newPage();
    await page.goto(url, { timeout: 0,
        waitUntil: 'load',
    
    });

    // Extract the content of the page
    const content = await page.content()

    // Find all matches with the RegEx
    if (content.match(regex)) {
        scrapeMatches.add(url);
        } else {
            scrapeNoMatches.add(url);
            }
            console.log(scrapeMatches)
            console.log(scrapeNoMatches)
        
        // await page.waitForNavigation()
        // Find all links on the page
        const links = await page.$$eval('a', (anchors) => anchors.map(anchor => anchor.href))
        .then(links => links.filter(link => link.startsWith(startUrl)))
        .then(links => links.filter(link => ['.pdf','.jpg','.gif'].includes(link.slice(-4)) === false))
        .then(links => links.filter(link => ['.jpeg'].includes(link.slice(-5)) === false))
        .then(links => links.filter(link => link.includes('#') === false))
        // .then(links => links.filter(link => link.includes('?reglevel=pin') === false))
        
        //console.info('Links auf der Seite:', links.length)
        
        // await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Close the page
        await page.close();
        
        // Recursively visit all links
        for (const link of links) {
            const absoluteLink = urlModule.resolve(url, link);
            try {
                await scrapePage(browser, absoluteLink, regex, visited);
            } catch (error) {
                console.log('Link bei dem der Fehler auftritt',link)
                console.error(error.message)
            }
        }
        
    return matches;
}

export async function crawl(job: Job<JobConfig>, done: DoneCallback<string>) {

	const matches = new Set()
    const nomatches = new Set()

	console.log(`Crawling ${job.data.entrypoint}`)
		const browser = await puppeteer.launch({
				executablePath: '/home/luc01/Downloads/chrome-linux/chrome',
		});
		const startUrl = 'https://www.arbeitsagentur.de/';  // Ersetze dies mit der Start-URL
		const regex = await buildRegEx() // RegEx für den Begriff "Job"
		await scrapePage(browser, startUrl, regex);
		console.log('Gefundene Seiten mit Übereinstimmungen:', matches);
		console.log(matches)
		
		await browser.close();
	return ['link1', 'link2', 'link3']
}