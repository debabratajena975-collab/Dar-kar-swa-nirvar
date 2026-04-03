const http = require('http');
const url = require('url');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:Sarkar%40975@darkar.frunty.mongodb.net/darkar?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db;

async function startServer() {
    try {
        await client.connect();
        db = client.db("darkar");
        console.log("Connected to MongoDB!");

        const server = http.createServer(async (req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const path = parsedUrl.pathname;

            if (path === '/post-job') {
                const { name, price } = parsedUrl.query;
                if (name && price) {
                    await db.collection("jobs").insertOne({ name, price });
                    res.end("Job Posted Successfully!");
                } else {
                    res.end("Error: Missing data");
                }
            } 
            else if (path === '/apply-job') {
                const { job, name, phone } = parsedUrl.query;
                if (job && name && phone) {
                    await db.collection("applications").insertOne({ job, name, phone });
                    res.end("Applied Successfully!");
                } else {
                    res.end("Error: Missing data");
                }
            }
            else {
                try {
                    const jobs = await db.collection("jobs").find().toArray();
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    let list = jobs.map(j => `<li>${j.name} - ${j.price}</li>`).join('');
                    res.end(`<h1>Swa-Nirbhar Jobs</h1><ul>${list || "<li>No jobs available</li>"}</ul>`);
                } catch (e) {
                    res.end("Error loading data from database");
                }
            }
        });

        // Use 0.0.0.0 and process.env.PORT for Render deployment
        const PORT = process.env.PORT || 10000;
        server.listen(PORT, '0.0.0.0', () => {
            console.log("Server is running on port " + PORT);
        });

    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
}

startServer();

