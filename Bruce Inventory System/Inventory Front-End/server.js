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
        var tagline = "List of all Beverages";
        console.log(beverage);
         // use res.render to load up an ejs view file
        res.render('pages/beverage', {
            beverage: beverage,
            tagline: tagline
            });
        }); 
});

app.post('/add_beverage', function(req, res){
    // create a variable to hold the floor num from the request body
    var bevname= req.body.bevname
    // create a variable to hold the floor name from the request body
    var bevprice = req.body.bevprice
    var bevoh = req.body.bevoh

    axios.post('http://127.0.0.1:5000/api/beverages', {bev_name:bevname, bev_price:bevprice, bev_onhand:bevoh})
   console.log("Name is: " + bevname);
   console.log("Price is: " + bevprice);
   console.log("OnHand is: " + bevoh);

   res.redirect('/beverage')
  
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


app.get('/room', function(req, res) {

    //local API call to my Python REST API that delivers Room table data from DB
    axios.get(`http://127.0.0.1:5000/api/room`)
    .then((response)=>{
            
        var room = response.data;
        var tagline = "List of all Rooms";
        console.log(room);
         // use res.render to load up an ejs view file
        res.render('pages/room', {
            room: room,
            tagline: tagline
        });
    }); 
}); 

app.post('/add_room', function(req, res){
    // create a variable to hold the floor num from the request body
    var roomnum = req.body.roomnum
    // create a variable to hold the floor name from the request body
    var roomcapacity = req.body.roomcapacity
    var roomfloor = req.body.roomfloor

    axios.post('http://127.0.0.1:5000/api/room', {number:roomnum, capacity:roomcapacity, floor:roomfloor})
   console.log("num is: " + roomnum);
   console.log("name is: " + roomcapacity);

    res.render('pages/add.ejs', {
        userinfo: req.body
    })
});

app.post('/update_room', function(req, res){
    // create a variable to hold the room num from the request body
    var roomnum = req.body.roomnum
    // create a variable to hold the new room capacity from the request body
    var nroomcapacity = req.body.nroomcapacity

    axios.put('http://127.0.0.1:5000/api/room', {number: roomnum, capacity: nroomcapacity})
   console.log("num is: " + roomnum);
   console.log("new capacity is: " + nroomcapacity);

    res.render('pages/update.ejs', {
        userinfo: req.body
    })
  
  });

app.post('/delete_room', function(req, res){
    // create a variable to hold the room num from the request body
    var roomnum = req.body.roomnum

    axios.delete('http://127.0.0.1:5000/api/room', {data:{number: roomnum}})
   console.log("num deleted is: " + roomnum);

    res.render('pages/delete.ejs', {
        userinfo: req.body
    })
  
  });

app.get('/resident', function(req, res) {

    //local API call to my Python REST API that delivers Resident table data from DB
    axios.get(`http://127.0.0.1:5000/api/resident`)
    .then((response)=>{
            
        var resident = response.data;
        var tagline = "List of all Residents";
        console.log(resident);
         // use res.render to load up an ejs view file
        res.render('pages/resident', {
            resident: resident,
            tagline: tagline
        });
    }); 


app.post('/add_resident', function(req, res){
    // create a variable to hold the resident first name from the request body
    var residentfname = req.body.residentfname
    // create a variable to hold the resident last name from the request body
    var residentlname = req.body.residentlname
    // create a variable to hold the resident age from the request body
    var residentage = req.body.residentage
    var residentroom = req.body.residentroom

    axios.post('http://127.0.0.1:5000/api/resident', {firstname:residentfname, lastname:residentlname, age:residentage, room:residentroom})
    console.log("first is: " + residentfname);
    console.log("last is: " + residentlname);
    console.log("age is: " + residentage);
    console.log("room is: " + residentroom);
 
     res.render('pages/add.ejs', {
         userinfo: req.body
            })
        });
    }); 

app.post('/update_resident', function(req, res){
    // create a variable to hold the resident first name from the request body
    var nresidentfname = req.body.nresidentfname
    // create a variable to hold the resident last name from the request body
    var nresidentlname = req.body.nresidentlname
    // create a variable to hold the resident age from the request body
    var nresidentage = req.body.nresidentage
    var roomnum2 = req.body.roomnum2
    
    axios.put('http://127.0.0.1:5000/api/resident', {firstname:nresidentfname, lastname:nresidentlname, age:nresidentage, room:roomnum2})
    console.log("first is: " + nresidentfname);
    console.log("last is: " + nresidentlname);
    console.log("age is: " + nresidentage);
    console.log("room is: " + roomnum2);
     
        res.render('pages/update.ejs', {
            userinfo: req.body
            })
        });
app.post('/delete_resident', function(req, res){
    var roomnum2 = req.body.roomnum2
        axios.delete('http://127.0.0.1:5000/api/resident', {data:{room:roomnum2}})
        console.log("room is: " + roomnum2);
             
            res.render('pages/delete.ejs', {
                userinfo: req.body
                })
            });


app.listen(9000);
console.log('9000 is the magic port');
