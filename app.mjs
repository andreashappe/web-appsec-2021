import express from "express"

const app = express();

app.get('/', function(req, res) {
  res.send('Hello World!')
});

app.get('/ports/:id', (req, res) => {
    re.send("Another Resource " + req.params.id);
});

const port = 3000;
app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`)
});