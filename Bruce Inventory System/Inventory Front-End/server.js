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
app.get('/main', (req, res) => {
    // Fetch all beverages from the API
    axios.get(`http://127.0.0.1:5000/api/beverages`)
    .then((response) => {
        const beverages = response.data;
        const tagline = "Low Stock Products";

        // Filter beverages where on-hand count is less than 10
        const filteredBeverages = beverages.filter(beverage => beverage.bev_onhand < 10);

        console.log(filteredBeverages);

        // Render the page with filtered beverages for the chart
        res.render('pages/main', { 
            beverage: filteredBeverages,
            tagline: tagline,
            auth: true // Pass authentication status
        });
    })
    .catch((error) => {
        console.error("Error fetching beverages:", error);
        res.status(500).send("Error fetching beverages");
    });
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

app.get('/filter_beverages', (req, res) => {
    axios.get(`http://127.0.0.1:5000/api/beverages`)
    .then((response) => {
        const beverages = response.data;
        const tagline = "Inventory";

        // Retrieve filters from query parameters
        const nameFilter = req.query.nfilter || ''; // Name filter
        const categoryFilter = req.query.filter || ''; // Category filter

        // Filter beverages based on the filters
        const filteredBeverages = beverages.filter(beverage => {
            const nameMatches = !nameFilter || beverage.bev_name.toLowerCase().includes(nameFilter.toLowerCase());
            const categoryMatches = !categoryFilter || (beverage.bev_category && beverage.bev_category.toLowerCase() === categoryFilter.toLowerCase());
            return nameMatches && categoryMatches;
        });

        // Render the page with beverages and filter values
        res.render('pages/dashboard', { 
            beverage: filteredBeverages,
            nfilter: nameFilter,         // Pass name filter value
            filter: categoryFilter,
            tagline: tagline       // Pass category filter value
        });
    })
    .catch((error) => {
        console.error("Error fetching beverages:", error);
        res.status(500).send("Error fetching beverages");
    });
});

app.post('/add_beverage', function(req, res){
    // create a variable to hold the product name from the request body
    var bevname= req.body.bevname
    // create a variable to hold the product price from the request body
    var bevprice = req.body.bevprice
    // create a variable to hold the product on hand from the request body
    var bevoh = req.body.bevoh
    // create a variable to hold the product on hand from the request body
    var bevcat = req.body.cats
    
    axios.post('http://127.0.0.1:5000/api/beverages', {bev_name:bevname, bev_price:bevprice, bev_onhand:bevoh, bev_category:bevcat})
   console.log("Name is: " + bevname);
   console.log("Price is: " + bevprice);
   console.log("OnHand is: " + bevoh);
   console.log("Category is:" + bevcat);

   res.redirect('/beverage_management')
  
  });

  app.post('/update_beverage/:bevname', function(req, res) {
    const bevname = req.params.bevname;
    const newoh = req.body.newoh;

    // Capture the filter values from the request body
    const currentNameFilter = req.body.nfilter || ''; // Current name filter
    const currentCategoryFilter = req.body.filter || ''; // Current category filter

    // Update the beverage in the database
    axios.put('http://127.0.0.1:5000/api/beverages', { bev_name: bevname, bev_onhand: newoh })
        .then(() => {
            console.log("Beverage updated: " + bevname);
            console.log("Current OnHand: " + newoh);

            // Redirect with the current filter values
            res.redirect(`/filter_beverages?nfilter=${encodeURIComponent(currentNameFilter)}&filter=${encodeURIComponent(currentCategoryFilter)}`);
        })
        .catch((error) => {
            console.error("Error updating beverage:", error);
            res.status(500).send("Error updating beverage");
        });
});

app.get('/delete/:bevname', function(req, res) { 
    const bevname = req.params.bevname;

    // Capture filter values from the query parameters
    const nameFilter = req.query.nfilter || ''; // Name filter
    const categoryFilter = req.query.filter || ''; // Category filter

    axios.delete('http://127.0.0.1:5000/api/beverages', { data: { bev_name: bevname } })
        .then(() => {
            console.log("Beverage deleted: " + bevname);

            // Redirect back to the filter route with the current filter values
            res.redirect(`/filter_beverages?nfilter=${encodeURIComponent(nameFilter)}&filter=${encodeURIComponent(categoryFilter)}`);
        })
        .catch((error) => {
            console.error("Error deleting beverage:", error);
            res.status(500).send("Error deleting beverage");
        });
});


app.listen(9000);
console.log('9000 is the magic port');
