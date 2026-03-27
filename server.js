const http = require('http');
const { MongoClient } = require('mongodb');

// 🔥 MongoDB Connection
const uri = "mongodb+srv://admin:Darkar%40123@darkar.k7twz4p.mongodb.net/?appName=Darkar";

const client = new MongoClient(uri);
let db;

async function connectDB() {
  await client.connect();
  db = client.db("darkar");
  console.log("MongoDB Connected");
}
connectDB();

const server = http.createServer(async (req, res) => {

  // ✅ POST JOB
  if (req.url.startsWith("/post-job")) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get("name");
    const price = url.searchParams.get("price");

    if (name && price) {
      await db.collection("jobs").insertOne({ name, price });
      res.end("Job Posted Successfully 🚀 <br><a href='/'>Go Back</a>");
    } else {
      res.end("Missing Data");
    }
  }

  // ✅ APPLY JOB
  else if (req.url.startsWith("/apply-job")) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const job = url.searchParams.get("job");
    const name = url.searchParams.get("name");
    const phone = url.searchParams.get("phone");

    if (job && name && phone) {
      await db.collection("applications").insertOne({ job, name, phone });
      res.end("Applied Successfully 🚀 <br><a href='/'>Go Back</a>");
    } else {
      res.end("Missing Data");
    }
  }

  // ✅ ADMIN PANEL (JOB-WISE VIEW)
  else if (req.url === "/applications") {
    const apps = await db.collection("applications").find().toArray();

    const grouped = {};
    apps.forEach(a => {
      if (!grouped[a.job]) grouped[a.job] = [];
      grouped[a.job].push(a);
    });

    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <h1>Applications (Job-wise)</h1>

      ${Object.keys(grouped).map(job => `
        <h2>${job}</h2>
        <ul>
          ${grouped[job].map(a => `
            <li>
              Name: ${a.name} <br>
              Phone: ${a.phone}
            </li>
          `).join("")}
        </ul>
      `).join("")}

      <br><a href="/">Go Back</a>
    `);
  }

  // ✅ GET JOBS
  else if (req.url === "/jobs") {
    const jobs = await db.collection("jobs").find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(jobs));
  }

  // ✅ MAIN PAGE
  else {
    const jobs = await db.collection("jobs").find().toArray();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
<html>
<head>
  <title>Dar Kar Swa Nirvar</title>
  <style>
    body {
      font-family: Arial;
      background: #f5f5f5;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #333;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      background: white;
      margin: 10px 0;
      padding: 10px;
      border-radius: 5px;
    }
    button {
      margin: 5px;
      padding: 5px 10px;
    }
    form {
      background: white;
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    input {
      padding: 5px;
      margin: 5px;
    }
    a {
      display: inline-block;
      margin-top: 10px;
    }
  </style>
</head>
<body>

<h1>Dar Kar Swa Nirvar</h1>

<a href="/applications"><button>View Applications</button></a>

<h2>Post a Job</h2>
<form action="/post-job" method="GET">
  <input type="text" name="name" placeholder="Job Name" required>
  <input type="number" name="price" placeholder="Price" required>
  <button type="submit">Post Job</button>
</form>

<h2>Jobs</h2>

<ul>
  ${jobs.map(job => `
    <li>
      <b>${job.name}</b> - ₹${job.price}

      <form action="/apply-job" method="GET">
        <input type="hidden" name="job" value="${job.name}">
        <input type="text" name="name" placeholder="Your Name" required>
        <input type="text" name="phone" placeholder="Phone" required>
        <button type="submit">Apply</button>
      </form>

    </li>
  `).join("")}
</ul>

</body>
</html>
    `);
  }

});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
