// load the things we need
const express = require('express');
const bodyParser = require('body-parser');
const { adminUsername, adminPassword } = require('./config');
const axios = require('axios');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file
app.get('/', function (req, res) {
    res.render('pages/index.ejs', { login: "false" });
});

// main function page
app.get('/main', function (req, res) {
    res.render('pages/main.ejs', {
        auth: true
    });
});

// logout
app.get('/logout', function (req, res) {
    res.render('pages/index.ejs', { login: "logout" });
});

// login
app.post('/process_login', function (req, res) {
    const user = req.body.username;
    const password = req.body.password;

    if (user === adminUsername && password === adminPassword) {
        res.render('pages/main.ejs', {
            auth: true
        });
    } else {
        res.render('pages/index.ejs', { login: "true" });
    }
});

// beverages page
app.get('/beverage', async function (req, res) {
    try {
        const response = await axios.get('http://127.0.0.1:5000/api/beverages');
        const beverages = response.data;
        res.render('pages/beverage', { beverages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching beverages');
    }
});

// add beverage
app.post('/add_beverage', function (req, res) {
    const bevname = req.body.bevname;
    const bevprice = req.body.bevprice;
    const bevoh = req.body.bevoh;

    axios.post('http://127.0.0.1:5000/api/beverages', { bev_name: bevname, bev_price: bevprice, bev_onhand: bevoh })
        .then(() => {
            console.log("Name is: " + bevname);
            console.log("Price is: " + bevprice);
            console.log("OnHand is: " + bevoh);
            res.redirect('/beverage');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error adding beverage');
        });
});

// update beverage
app.post('/update_beverage/:bevname', function (req, res) {
    const bevname = req.params.bevname;
    const newoh = req.body.newoh;

    axios.put('http://127.0.0.1:5000/api/beverages', { bev_name: bevname, bev_onhand: newoh })
        .then(() => {
            console.log("bevname updated is: " + bevname);
            console.log("Current OnHand: " + newoh);
            res.redirect('/beverage');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error updating beverage');
        });
});

// delete beverage
app.get('/delete/:bevname', function (req, res) {
    const bevname = req.params.bevname;

    axios.delete('http://127.0.0.1:5000/api/beverages', { data: { bev_name: bevname } })
        .then(() => {
            console.log("bevname deleted is: " + bevname);
            res.redirect('/beverage');
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error deleting beverage');
        });
});

app.listen(9000);
console.log('9000 is the magic port');
