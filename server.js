require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const app = express();
// Basic Configuration
const port = process.env.PORT || 3000;

const sites = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  function validURL(str) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  }

  if (validURL(req.body.url)) {
    const foundSite = sites.find((site) => site.url === req.body.url);

    if (foundSite) {
      res.json({ original_url: foundSite.url, short_url: foundSite.shorturl });
    } else {
      sites.push({ url: req.body.url, shorturl: sites.length + 1 });

      const lastSite = sites[sites.length - 1];
      res.json({ original_url: lastSite.url, short_url: lastSite.shorturl });
    }
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:shorturl", function (req, res) {
  const foundSite = sites.find((site) => site.shorturl == req.params.shorturl);
  if (foundSite) {
    res.redirect(foundSite.url);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
