import { DoneCallback, Job } from "bee-queue"
import { JobConfig } from "./job.interface"
import { Browser, launch } from "puppeteer-core"
import urlModule from 'url'
import { queue } from "."



async function scrapePage(job: Job<JobConfig>, browser: Browser, url:string, regex: string, visited = new Set(), scrapeMatches = new Set(), scrapeNoMatches = new Set(), maxDepth = 2, ) {
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
        job.reportProgress(Array.from(scrapeMatches))
        } else {
            scrapeNoMatches.add(url);
            }
            console.log(scrapeMatches)
            console.log(scrapeNoMatches)
        
        // await page.waitForNavigation()
        // Find all links on the page
        const links = await page.$$eval('a', anchors => anchors.map( anchor  => anchor.href))
        .then(links => links.filter(link => link.startsWith(url)))
        .then(links => links.filter(link => ['.pdf','.jpg','.gif'].includes(link.slice(-4)) === false))
        .then(links => links.filter(link => ['.jpeg'].includes(link.slice(-5)) === false))
        .then(links => links.filter(link => link.includes('#') === false))




        // .then(links => links.filter(link => link.includes('?reglevel=pin') === false))
        
        //console.info('Links auf der Seite:', links.length)
        
        // await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Close the page
        await page.close();
        
        if (maxDepth === 0) {
            return scrapeMatches;
        }
        // Recursively visit all links
        for (const link of links) {
            const absoluteLink = urlModule.resolve(url, link);
            try {
                await scrapePage(job, browser, absoluteLink, regex, visited, scrapeMatches, scrapeNoMatches, maxDepth - 1);
            } catch (error: any) {
                console.log('Link bei dem der Fehler auftritt',link)
                console.error(error.message)
            }
        }
        
    return scrapeMatches;
}

export async function crawl(job: Job<JobConfig>, done: DoneCallback<string>) {

	const matches = new Set()
    const nomatches = new Set()

    const browser = await launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
	console.log(`Crawling job ${job.id} ${job.data.entrypoint}`)
		const startUrl: string= job.data.entrypoint;  // Ersetze dies mit der Start-URL
        const maxDepth: number = job.data.maxDepth;  // Ersetze dies mit der maximalen Tiefe
		await scrapePage(job, browser, startUrl, job.data.regex, undefined, matches, nomatches, maxDepth)
		console.log('Gefundene Seiten mit Übereinstimmungen:', matches);
		console.log(matches)
     
        
		await browser.close();
	return matches
}