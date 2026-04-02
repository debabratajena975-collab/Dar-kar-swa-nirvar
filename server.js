const http = require('http');
const url = require('url');
const { MongoClient } = require('mongodb');

// MongoDB Connection String
// ମନେରଖ: <password> ଜାଗାରେ ତୁମର ଅସଲି ପାସୱାର୍ଡ ଲେଖିବ
const uri = "mongodb+srv://admin:Sarkar%40975@darkar.frunty.mongodb.net/darkar?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("darkar");
        console.log("Connected to MongoDB Atlas!");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}
connectDB();

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // --- POST JOB ---
    if (path === '/post-job') {
        const { name, price } = parsedUrl.query;
        if (name && price) {
            await db.collection("jobs").insertOne({ name, price });
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end("Job Posted Successfully! <a href='/'>Go Back</a>");
        } else {
            res.end("Missing Data!");
        }
    }

    // --- APPLY JOB ---
    else if (path === '/apply-job') {
        const { job, name, phone } = parsedUrl.query;
        if (job && name && phone) {
            await db.collection("applications").insertOne({ job, name, phone });
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end("Applied Successfully! <a href='/'>Go Back</a>");
        } else {
            res.end("Missing Data!");
        }
    }

    // --- HOME PAGE & JOB LIST ---
    else {
        const jobs = await db.collection("jobs").find().toArray();
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        
        let jobHtml = jobs.map(j => `
            <li>
                <strong>${j.name}</strong> - ₹${j.price}
                <form action="/apply-job" method="GET">
                    <input type="hidden" name="job" value="${j.name}">
                    <input type="text" name="name" placeholder="Your Name" required>
                    <input type="text" name="phone" placeholder="Phone" required>
                    <button type="submit">Apply</button>
                </form>
            </li>
        `).join('');

        res.end(`
            <html>
            <head>
                <title>Dar-kar-swa-nirvar</title>
                <style>
                    body { font-family: Arial; background: #f4f4f4; padding: 20px; }
                    li { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; list-style: none; }
                    button { background: #28a745; color: white; border: none; padding: 5px 10px; cursor: pointer; }
                </style>
            </head>
            <body>
                <h1>Dar-Kar Swa-Nirvar</h1>
                <form action="/post-job" method="GET">
                    <input type="text" name="name" placeholder="Job Name" required>
                    <input type="number" name="price" placeholder="Price" required>
                    <button type="submit">Post Job</button>
                </form>
                <hr>
                <ul>${jobHtml}</ul>
            </body>
            </html>
        `);
    }
});

// IMPORTANT: Use process.env.PORT for Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

