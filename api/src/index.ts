import express, {Request, Response} from 'express'
import Queue from 'bee-queue'
import {buildRegEx} from './utils/regex_modul'
import { JobConfig } from './job.interface';
const queue = new Queue('crawler-jobs',{
	redis: {
		host: 'redis',
}});

// curl -X POST -H "Content-Type: application/json" -d '{"entrypoint": "https://www.google.com", "maxDepth": 1, "words": ["google", "search"]}' http://localhost:3000/job



// curl -X DELETE http://localhost:3000/jobs

const app = express()
app.use(express.json())

const port = 3000

app.post('/job', (req, res) => {
	const { entrypoint, words, maxDepth } = req.body
	const regex = buildRegEx(words)
	queue.createJob({
		entrypoint,
		regex,
		maxDepth,
	}).save()
	.then((job) => {
		console.log(`Job created with ID ${job.id}`);
		job.on('succeeded', (result) => {
			console.log(`Received result for job ${job.id}: ${result}`);
		})
	})
	res.send('Hello World!')
})

app.get('/job/:id', (req, res) => {
	const { id } = req.params
	queue.getJob(id).then((job) => {
		if(job){
			if(job.data.result){
				res.json(job.data)
			} else {
				console.log(`Job ${job.id} is not yet completed. Waiting for progress update`)
				job.on('progress', (progress) => {
					console.log(`Job ${job.id} is ${progress} done`);
					job.removeAllListeners('progress')
					res.json({id: job.id, progress})
				})
			}
		}else{
			res.json({error: 'Job not found'})
		}
	})
})

app.get('/jobs', (req, res) => {
	//curl http://localhost:3000/jobs
	Promise.all([
		queue.getJobs('waiting', {start: 0, end: 25}),
		queue.getJobs('active', {start: 0, end: 25}),
	])
	.then(([waiting, active]) => {
		const waitingJobIds = waiting.map((job) => job.id);
		const activeJobIds = active.map((job) => job.id);
		res.json({
			waiting: waitingJobIds,
			active: activeJobIds,
		})
	});
})

app.delete('/job/:id', (req, res) => {
	const { id } = req.params
	queue.getJob(id).then(async (job) => {
		if(job){
			await job.remove()
			res.json({deleted: id})
		}else{
			res.json({deleted: null})
		}
	})
})

app.delete('/jobs', (req, res) => {
	//curl -X DELETE  http://localhost:3000/jobs



	queue.getJobs('waiting', {start: 0, end: 25}).then(async (jobs) => {

		for(const job of jobs){
			await job.remove()
		}
		const jobIds = jobs.map((job) => job.id);
		console.log(`Job ids: ${jobIds.join(' ')}`);

		res.json({deleted: jobIds.length})
	});

})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
  })