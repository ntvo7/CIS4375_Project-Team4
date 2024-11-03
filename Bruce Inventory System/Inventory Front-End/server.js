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
    // Fetch all products from the API
    axios.get(`http://127.0.0.1:5000/api/stock`)
    .then((response) => {
        const products = response.data;
        const tagline = "Low Stock Products";

        // Filter products where on-hand count is less than 10
        const filteredProducts = products.filter(product => product.instock < 10);

        console.log(filteredProducts);

        // Render the page with filtered products for the chart
        res.render('pages/main', { 
            product: filteredProducts,
            tagline: tagline,
            auth: true // Pass authentication status
        });
    })
    .catch((error) => {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    });
});



app.get('/product_management', function(req, res) {
    res.render('pages/report.ejs');
});

//logout 
app.get('/logout', function(req, res) {
    res.render('pages/index.ejs', {login:"logout"});
});

//login
app.post('/process_login', function(req, res){
    var user = req.body.username;
    var password = req.body.password;
    axios.get(`http://127.0.0.1:5000/api/stock`)
    .then((response) => {
        const products = response.data;
        const tagline = "Low Stock Products";

        // Filter products where on-hand count is less than 10
        const filteredProducts = products.filter(product => product.instock < 10);

        console.log(filteredProducts);

        if(user === 'admin' && password === 'brucestore')
            {
                // Render the page with filtered products for the chart
                res.render('pages/main', { 
                    product: filteredProducts,
                    tagline: tagline,
                    auth: true // Pass authentication status
            })
            }
            else
            {
                res.render('pages/index.ejs', {login:"true"});
            }
    })
    .catch((error) => {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    })
  })


app.get('/filter_products', (req, res) => {
    axios.get(`http://127.0.0.1:5000/api/stock`)
    .then((response) => {
        const products = response.data;
        const tagline = "Inventory";

        // Retrieve filters from query parameters
        const nameFilter = req.query.nfilter || ''; // Name filter
        const categoryFilter = req.query.filter || ''; // Category filter

        // Filter products based on the filters
        const filteredProducts = products.filter(product => {
            const nameMatches = !nameFilter || product.s_name.toLowerCase().includes(nameFilter.toLowerCase());
            const categoryMatches = !categoryFilter || (product.s_category && product.s_category.toLowerCase() === categoryFilter.toLowerCase());
            return nameMatches && categoryMatches;
        });

        // Render the page with products and filter values
        res.render('pages/dashboard', { 
            product: filteredProducts,
            nfilter: nameFilter,         // Pass name filter value
            filter: categoryFilter,
            tagline: tagline       // Pass category filter value
        });
    })
    .catch((error) => {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    });
});

// app.post('/add_product', function(req, res){
//     // create a variable to hold the product name from the request body
//     var proname= req.body.proname;
//     // create a variable to hold the product price from the request body
//     var proprice = req.body.proprice;
//     // create a variable to hold the product on hand from the request body
//     var prooh = req.body.prooh;
//     // create a variable to hold the product on hand from the request body
//     var procat = req.body.cats;

//         // Capture the filter values from the request body
//     const currentNameFilter = req.body.nfilter || ''; // Current name filter
//     const currentCategoryFilter = req.body.filter || ''; // Current category filter
    
//     axios.post('http://127.0.0.1:5000/api/stock', {s_name:proname, s_price:proprice, instock:prooh, s_category:procat})
//    console.log("Name is: " + proname);
//    console.log("Price is: " + proprice);
//    console.log("OnHand is: " + prooh);
//    console.log("Category is:" + procat);

//    res.redirect(`/filter_products?nfilter=${encodeURIComponent(currentNameFilter)}&filter=${encodeURIComponent(currentCategoryFilter)}`);
  
// });

app.post('/add_product', function(req, res) {
    // Extract product details from the request body
    const proname = req.body.proname;
    const proprice = parseFloat(req.body.proprice); // Ensure the price is a number
    const prooh = parseInt(req.body.prooh, 10); // Ensure the on-hand count is an integer
    const procat = req.body.cats;

    // Capture filter values from the request body
    const currentNameFilter = req.body.nfilter || '';
    const currentCategoryFilter = req.body.filter || '';

    // Validate input data to prevent issues
    if (!proname || isNaN(proprice) || isNaN(prooh) || !procat) {
        console.error("Invalid input data for adding product.");
        return res.status(400).send("Invalid input data for adding product.");
    }

    // Make the API call to add the product with a timeout configuration
    axios.post('http://127.0.0.1:5000/api/stock', {
        s_name: proname,
        s_price: proprice,
        instock: prooh,
        s_category: procat
    }, { timeout: 5000 }) // Added timeout configuration
    .then((response) => {
        console.log("Product added successfully:", {
            name: proname,
            price: proprice,
            onhand: prooh,
            category: procat
        });

        // Redirect to the filtered product list
        res.redirect(`/filter_products?nfilter=${encodeURIComponent(currentNameFilter)}&filter=${encodeURIComponent(currentCategoryFilter)}`);
    })
    .catch((error) => {
        if (error.response) {
            // The request was made, but the server responded with a status code not in the 2xx range
            console.error("Error adding product - Server response:", error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Error adding product - No response received:", error.request);
        } else {
            // Something else happened during the request setup
            console.error("Error adding product:", error.message);
        }
        res.status(500).send("Error adding product");
    });
});


app.post('/update_product/:s_id', function(req, res) {
    const sid = req.params.s_id;
    const sname = req.body.proname;
    const newPrice = req.body.proprice; // New price
    const newOnHand = req.body.prooh; // New on-hand quantity
    const newCategory = req.body.cats; // New category

    // Capture the filter values
    const currentNameFilter = req.body.nfilter || '';
    const currentCategoryFilter = req.body.filter || '';

    // Update the products in the database
    axios.put('http://127.0.0.1:5000/api/stock', {
        s_id: sid,
        s_name: sname,
        s_price: newPrice,
        instock: newOnHand,
        s_category: newCategory
    })
    .then(() => {
        console.log("Product updated:", {
            sid: sid, 
            name: sname, 
            price: newPrice, 
            onhand: newOnHand, 
            category: newCategory 
        });
        // Redirect with current filter values
        res.redirect(`/filter_products?nfilter=${encodeURIComponent(currentNameFilter)}&filter=${encodeURIComponent(currentCategoryFilter)}`);
    })
    .catch((error) => {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
    });
});

app.post('/delete_product/:s_id', function(req, res) {
    const sid = req.params.s_id;

    // Capture filter values from the request body or query parameters
    const nameFilter = req.body.nfilter || ''; // Name filter
    const categoryFilter = req.body.filter || ''; // Category filter

    axios.delete('http://127.0.0.1:5000/api/stock', { data: { s_id: sid } })
        .then(() => {
            console.log("Product ID Deleted: " + sid);

            // Redirect back to the filter route with the current filter values
            res.redirect(`/filter_products?nfilter=${encodeURIComponent(nameFilter)}&filter=${encodeURIComponent(categoryFilter)}`);
        })
        .catch((error) => {
            console.error("Error deleting product:", error);
            res.status(500).send("Error deleting product");
        });
});



app.listen(9000);
console.log('9000 is the magic port');
