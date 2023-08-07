const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;

const app = express();

dotenv.config({
	path: './config.env',
});

const url = process.env.MONGO_URI;

const PORT = process.env.PORT || 5000;

MongoClient.connect(url)
	.then((client) => {
		console.log('connected to mongodb server');

		const db = client.db('resume');
		const resume = db.collection('resume');

		app.use(cors());
		app.use(express.json());

		app.get('/', (req, res) => {
			res.send('database conected!'.red);
		});

		// save resume into collection
        
		app.post('/resume', (req, res) => {
			resume
				.insertOne(req.body)
				.then((result) => {
					res.status(201).json({
						success: true,
						data: result,
					});
				})
				.catch((error) => {
					res.status(500).json({
						success: false,
						message: error.message,
					});
				});
		});

		// get all resume from collection

		app.get('/resume', (req, res) => {
			resume
				.find({})
				.toArray()
				.then((result) => {
					res.status(200).json({
						success: true,
						data: result,
					});
				});
		});

		// udpate a resume

        app.put('/resume', (req, res) => {
            const { name, father, profession, address } = req.body;
        
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is a required field.',
                });
            }
        
            resume
                .findOneAndUpdate(
                    { name: name }, // Query
                    {
                        $set: {
                            father: father,
                            profession: profession,
                            address: address,
                        },
                    },
                    { upsert: true, new: true }
                )
                .then((result) => {
                    res.status(200).json({
                        success: true,
                        data: result,
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        success: false,
                        message: err.message,
                    });
                });
        });
        
        

		// delete a resume

		app.delete('/resume', (req, res) => {
			resume
				.deleteOne({ name: req.body.name })
				.then((result) => {
					res.status(200).json({
						success: true,
					});
				})
				.catch((error) => {
					res.status(500).json({
						success: false,
						message: error.message,
					});
				});
		});

		app.listen(PORT,()=> console.log('server listening on port: '+PORT));
	})
	.catch(console.error);