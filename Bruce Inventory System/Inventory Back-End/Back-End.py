#Bruce Store Inventory Back-End Group 4

import flask
from flask import jsonify
from flask import request, make_response

import mysql.connector
from mysql.connector import Error
import hashlib

from datetime import datetime

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

con = create_con('127.0.0.1','root','!r00tpwd',"brucestore")

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

#API POST fuction to add products into database
@app.route('/api/stock', methods=['POST'])
def add_product():
    request_data = request.get_json()
    newsname = request_data['s_name']
    newsprice = request_data['s_price']
    newsoh = request_data['instock']
    newscat = request_data['s_category']
    
    sql = "insert into stock (s_name, s_price, instock, s_category) values ('%s', '%s','%s', '%s')" % (newsname, newsprice, newsoh, newscat)
    execute_myquery(con, sql)
    
    return "Add request successful"

#API DELETE function to delete product by id
@app.route('/api/stock', methods=['DELETE'])
def delete_product_byid():
    request_data = request.get_json()
    protodelete = request_data['s_id']
    
    sql = "delete from stock where s_id = '%s'" % (protodelete)
    execute_myquery(con, sql)
        
    return "Delete request successful"

#API GET to retrieve all products
@app.route('/api/stock', methods=['GET'])
def all_stock():
    #creating dictionary list of all current products
    sql = "select * from stock"
    all = execute_read_myquery(con, sql)
    products = []
    for eachrow in all:
        if eachrow not in products:
            products.append(eachrow)

    return jsonify(products)

#PUT funtion that updates product on hand
@app.route('/api/stock', methods=['PUT'])
def api_put_product_byname():
    request_data = request.get_json()
    sid = request_data['s_id']
    sname = request_data['s_name']
    newonhand = request_data['instock']
    newsprice = request_data['s_price']
    newcategory = request_data['s_category']

    sql_check_stock = "SELECT instock, s_price FROM stock WHERE s_id = %s" % sid
    current_stock = execute_read_myquery(con, sql_check_stock)
    
    if current_stock[0]['instock'] != int(newonhand):
        sql2 = "insert into stock_change (s_name, s_id, newstock, up_date) values ('%s', '%s','%s', '%s')" % (sname, sid, newonhand, datetime.today().strftime('%Y-%m-%d'))
        execute_myquery(con, sql2)
    if current_stock[0]['s_price'] != float(newsprice):
        sql3 = "insert into price_change (s_name, s_id, newprice, up_date) values ('%s', '%s','%s', '%s')" % (sname, sid, newsprice, datetime.today().strftime('%Y-%m-%d'))
        execute_myquery(con, sql3)

    # Update the SQL query to modify all relevant fields
    sql = "UPDATE stock SET s_name = '%s', s_price = '%s', instock = '%s', s_category = '%s' WHERE s_id = '%s'" % (sname, newsprice, newonhand, newcategory, sid)
    execute_myquery(con, sql)


    return "Put active request successful!"

#API GET to retrieve all stock change history
@app.route('/api/stock_change', methods=['GET'])
def all_stock_change():
    #creating dictionary list of all stock change history
    sql = "select * from stock_change"
    all = execute_read_myquery(con, sql)
    stockchanges = []
    for eachrow in all:
        if eachrow not in stockchanges:
            stockchanges.append(eachrow)

    return jsonify(stockchanges)

#API GET to retrieve all price change history
@app.route('/api/price_change', methods=['GET'])
def all_price_change():
    #creating dictionary list of all price change history
    sql = "select * from price_change"
    all = execute_read_myquery(con, sql)
    pricechange = []
    for eachrow in all:
        if eachrow not in pricechange:
            pricechange.append(eachrow)

    return jsonify(pricechange)


app.run()
