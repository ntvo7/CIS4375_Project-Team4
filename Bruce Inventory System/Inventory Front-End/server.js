// load the things we need
var express = require('express');
var app = express();
const bodyParser  = require('body-parser');

// required module to make calls to a REST API
const axios = require('axios');

app.use(bodyParser.urlencoded());

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

app.get('/', function(req, res) {
    res.render('pages/index.ejs', {login:"false"});
});

//main function page
app.get('/main', function(req, res) {
    res.render('pages/main.ejs', {
        auth: true}
    );
});

app.get('/beverage_management', function(req, res) {
    res.render('pages/beverage.ejs');
});

//logout 
app.get('/logout', function(req, res) {
    res.render('pages/index.ejs', {login:"logout"});
});

//login
app.post('/process_login', function(req, res){
    var user = req.body.username;
    var password = req.body.password;

    if(user === 'admin' && password === 'brucestore')
    {
        res.render('pages/main.ejs', {
            auth: true
        });
    }
    else
    {
        res.render('pages/index.ejs', {login:"true"});
    }
  })

  
app.get('/beverage', function(req, res) {

    //local API call to my Python REST API that delivers beverages table data from DB
    axios.get(`http://127.0.0.1:5000/api/beverages`)
    .then((response)=>{
        
        var beverage = response.data;
        var tagline = "Inventory";
        console.log(beverage);
         // use res.render to load up an ejs view file
        res.render('pages/dashboard', {
            beverage: beverage,
            tagline: tagline
            });
        }); 
});

app.post('/add_beverage', function(req, res){
    // create a variable to hold the product name from the request body
    var bevname= req.body.bevname
    // create a variable to hold the product price from the request body
    var bevprice = req.body.bevprice
    // create a variable to hold the product on hand from the request body
    var bevoh = req.body.bevoh
    
    axios.post('http://127.0.0.1:5000/api/beverages', {bev_name:bevname, bev_price:bevprice, bev_onhand:bevoh})
   console.log("Name is: " + bevname);
   console.log("Price is: " + bevprice);
   console.log("OnHand is: " + bevoh);

   res.redirect('/beverage_management')
  
  });

app.post('/update_beverage/:bevname', function(req, res){
    var bevname = req.params.bevname;
    var newoh = req.body.newoh;
  
    axios.put('http://127.0.0.1:5000/api/beverages', {bev_name:bevname, bev_onhand:newoh})
   console.log("bevname updated is: " + bevname);
   console.log("Current OnHand: " + newoh);

    res.redirect('/beverage')
    });

app.get('/delete/:bevname', function(req, res){
    var bevname = req.params.bevname;
  
    axios.delete('http://127.0.0.1:5000/api/beverages', {data:{bev_name:bevname}})
   console.log("bevname deleted is: " + bevname);

    res.redirect('/beverage')
    });

app.listen(9000);
console.log('9000 is the magic port');
