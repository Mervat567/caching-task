const express = require("express");
const fetch = require("node-fetch");
const morgan = require("morgan");
const redis = require("redis");

const PORT = 5000;
const app = express();
app.use(morgan("dev"));
const _1H = 3600;

const client = redis.createClient();

const getPosts = async (req, res) => {
  const { id } = req.params;
  const posts = await getOrSet(id,async () => {
    var data = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}/comments`);
    data = await data.json();
    return data;
  });
  res.json(posts);
};


const getOrSet = (key,cb) => {
  return new Promise((resolve, reject) => {
    client.get(key,async (err, data) => {
      if (err) reject(err);
      if (data != null) {
        console.log("cache hit...!!");
        resolve(JSON.parse(data));
      } else {
        console.log("cache mis...!!");
        const result =  await cb();
        client.setex(key, _1H, JSON.stringify(result));
        resolve(result);
      }
    });
  });
};

app.get("/posts/:id/comments", getPosts);

app.listen(PORT, () => {
  console.log(`server is running in port ${PORT} `);
})

