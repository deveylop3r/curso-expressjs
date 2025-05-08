const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(
    `<h1>Welcome to the Express.js App</h1>
    <p> V2 Use the following endpoints:</p>
    <ul>
      <li><a href="/api/hello">/api/hello</a> - Returns a hello message</li>
      <li><a href="/api/goodbye">/api/goodbye</a> - Returns a goodbye message</li>
      <li>Running on port: ${PORT}</li>
    </ul>`
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
