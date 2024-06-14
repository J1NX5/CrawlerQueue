import Queue from 'bee-queue'
import { crawl } from './crawler';

const queue = new Queue('crawler-jobs');

// Process jobs from as many servers or processes as you like
queue.process(crawl);