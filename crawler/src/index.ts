import Queue from 'bee-queue'
import { crawl } from './crawler';

export const queue = new Queue('crawler-jobs', {
	redis: {
		host: 'redis',
}});

// Process jobs from as many servers or processes as you like
queue.process(crawl);