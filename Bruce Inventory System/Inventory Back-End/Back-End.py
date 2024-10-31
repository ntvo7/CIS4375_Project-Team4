#Bruce Store Inventory Back-End Group 4

import flask
from flask import jsonify
from flask import request, make_response

import mysql.connector
from mysql.connector import Error
import hashlib

app = flask.Flask(__name__)
app.config["DEBUG"] = True

#connect to database (based on classwork)
def create_con(hostname,uname,passwd,dname):
    connection = None

    try:
        connection = mysql.connector.connect(
            host = hostname,
            user = uname,
            password = passwd,
            database = dname  
        )
        print("Connection was successful")
    except Error as e:
        print("Connection failed with error: ", e)
    return connection

#execute sql function (based on classwork)
def execute_myquery(con, query):
    mycursor = con.cursor()
    try:
        mycursor.execute(query)
        con.commit()
    except Error as e:
        print('Error:', e)

#execute select/readall funtion (based on classwork)
def execute_read_myquery(connection, query):
    mycursor = connection.cursor(dictionary=True)
    rows = None
    try:
        mycursor.execute(query)
        rows = mycursor.fetchall()
        return rows
    except Error as e:
        print('Error is:', e)

con = create_con('localhost','root','brucestore',"brucestore")

masterUsername = 'admin'
masterPassword = '5393a423c38ab58e5bddd35c160deabcdd11f7242fa37250dfa49c9e7313cda4' #hash SHA256 value of 'brucestore' as the password

#Basic Authentication which uses username and password of request
@app.route('/auth', methods=['GET'])
def processrequest():
    if request.authorization:
        encodedpassword = request.authorization.password.encode() #getting password in unicode value
        hashvalue = hashlib.sha256(encodedpassword)
        if request.authorization.username == masterUsername and hashvalue.hexdigest() == masterPassword:
            return '<h1> Authenticated User'
    return make_response('could not find user', 401, {'WWW-authenticate: ': 'Basic realm="login required"'})

#API POST fuction to add beverages into database
@app.route('/api/beverages', methods=['POST'])
def add_beverage():
    request_data = request.get_json()
    newbevname = request_data['bev_name']
    newbevprice = request_data['bev_price']
    newbevoh = request_data['bev_onhand']
    newbevcat = request_data['bev_category']
    
    sql = "insert into beverages (bev_name, bev_price, bev_onhand, bev_category) values ('%s', '%s','%s', '%s')" % (newbevname, newbevprice, newbevoh, newbevcat)
    execute_myquery(con, sql)
        
    return "Add request successful"

#API DELETE function to delete beverage by name
@app.route('/api/beverages', methods=['DELETE'])
def delete_beverages_byname():
    request_data = request.get_json()
    bevtodelete = request_data['bev_id']
    
    sql = "delete from beverages where bev_id = '%s'" % (bevtodelete)
    execute_myquery(con, sql)
        
    return "Delete request successful"

#API GET to retrieve all beverages
@app.route('/api/beverages', methods=['GET'])
def all_beverages():
    #creating dictionary list of all current beverages
    sql = "select * from beverages"
    all = execute_read_myquery(con, sql)
    beverages = []
    for eachrow in all:
        if eachrow not in beverages:
            beverages.append(eachrow)

    return jsonify(beverages)

#PUT funtion that updates beverage on hand
@app.route('/api/beverages', methods=['PUT'])
def api_put_beverage_byname():
    request_data = request.get_json()
    bevid = request_data['bev_id']
    bevname = request_data['bev_name']
    newonhand = request_data['bev_onhand']
    newprice = request_data['bev_price']
    newcategory = request_data['bev_category']

    # Update the SQL query to modify all relevant fields
    sql = "UPDATE beverages SET bev_name = '%s', bev_price = '%s', bev_onhand = '%s', bev_category = '%s' WHERE bev_id = '%s'" % (bevname, newprice, newonhand, newcategory, bevid)
    
    execute_myquery(con, sql)

    return "Put active request successful!"


app.run()
