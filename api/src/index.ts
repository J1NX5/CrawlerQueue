import express, {Request, Response} from 'express'
import Queue from 'bee-queue'

const queue = new Queue('crawler-jobs');


const app = express()

app.post('/job', (req, res) => {
	const { entrypoint, regex } = req.body
	queue.createJob({
		entrypoint,
		regex,
	}).save()
	.then((job) => {
		console.log(`Job created with ID ${job.id}`);
		job.on('succeeded', (result) => {
			console.log(`Received result for job ${job.id}: ${result}`);
		})
	})
	res.send('Hello World!')
})