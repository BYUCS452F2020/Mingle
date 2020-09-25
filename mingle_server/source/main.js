let express = require('express');
let bodyparser = require('body-parser')

let app = express();

app.use(bodyparser.urlencoded({ extended: false }));

app.post('/login', (request, response) => {
    console.log(`Username: ${request.body.username}`);
    console.log(`Password: ${request.body.password}`);
});

console.log("Running on port 8000");
app.listen(8000);
