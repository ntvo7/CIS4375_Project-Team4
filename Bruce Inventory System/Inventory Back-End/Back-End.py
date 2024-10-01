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

con = create_con('localhost','root','Eggro2000!',"brucestore")

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
    
    sql = "insert into beverages (bev_name, bev_price, bev_onhand) values ('%s', '%s','%s')" % (newbevname, newbevprice, newbevoh)
    execute_myquery(con, sql)
        
    return "Add request successful"

#API DELETE function to delete beverage by name
@app.route('/api/beverages', methods=['DELETE'])
def delete_beverages_byname():
    request_data = request.get_json()
    bevtodelete = request_data['bev_name']
    
    sql = "delete from beverages where bev_name = '%s'" % (bevtodelete)
    execute_myquery(con, sql)
        
    return "Delete request successful"

@app.route('/api/beverages', methods=['DELETE'])
def delete_beverage_byname():
    request_data = request.get_json()
    bevtodelete = request_data['bev_name']
    
    sql = "delete from beverages where bev_name = '%s'" % (bevtodelete)
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
    bevname = request_data['bev_name']
    newonhand = request_data['bev_onhand']
    
    sql = "update beverages set bev_onhand =%s where bev_name = '%s'" %(newonhand, bevname)
    execute_myquery(con, sql)
        
    return "Put active request successful!"


#API POST fuction to add rooms into database (based on classwork)
@app.route('/api/room', methods=['POST'])
def add_room():
    request_data = request.get_json()
    newroomcap = request_data['capacity']
    newroomnum = request_data['number']
    newroomfloor = request_data['floor']
    
    sql = "insert into room (capacity, number, floor) values ('%s', '%s', '%s')" % (newroomcap, newroomnum, newroomfloor)
    execute_myquery(con, sql)
        
    return "Add request successful"

#API DELETE function to delete room by number (based on classwork)
@app.route('/api/room', methods=['DELETE'])
def delete_room_bynumber():
    request_data = request.get_json()
    roomnumtodelete = request_data['number']
    
    sql = "delete from room where number = %s" % (roomnumtodelete)
    execute_myquery(con, sql)
        
    return "Delete request successful"

#API GET to retrieve all rooms (based on classwork)
@app.route('/api/room', methods=['GET'])
def single_room():
    #creating dictionary list of all current rooms
    sql = "select * from room"
    all = execute_read_myquery(con, sql)
    rooms = []
    for eachrow in all:
        if eachrow not in rooms:
            rooms.append(eachrow)

    return jsonify(rooms)

#PUT funtion that updates room capacity (based on classwork)
@app.route('/api/room', methods=['PUT'])
def api_put_room_bynumber():
    request_data = request.get_json()
    roomnumber = request_data['number']
    updateroomcap = request_data['capacity']
    
    sql = "update room set capacity ='%s' where number = %s" %(updateroomcap, roomnumber)
    execute_myquery(con, sql)
        
    return "Put active request successful!"


#API POST fuction to add resident into database (based on classwork)
@app.route('/api/resident', methods=['POST'])
def add_resident():
    request_data = request.get_json()
    newfirst = request_data['firstname']
    newlast = request_data['lastname']
    newage = request_data['age']
    newroom = request_data['room']
    
    sql = "insert into resident (firstname, lastname, age, room) values ('%s', '%s', '%s', '%s')" % (newfirst, newlast, newage, newroom)
    execute_myquery(con, sql)
        
    return "Add request successful"

#API DELETE function to delete resident by id (based on classwork)
@app.route('/api/resident', methods=['DELETE'])
def delete_resident_byroom():
    request_data = request.get_json()
    residenttodelete = request_data['room']
    
    sql = "delete from resident where room = %s" % (residenttodelete)
    execute_myquery(con, sql)
        
    return "Delete request successful"

#API GET to retrieve all residents (based on classwork)
@app.route('/api/resident', methods=['GET'])
def single_resident():
    #creating dictionary list of all current residents
    sql = "select * from resident"
    all = execute_read_myquery(con, sql)
    residents = []
    for eachrow in all:
        if eachrow not in residents:
            residents.append(eachrow)

    return jsonify(residents)

#PUT funtion that updates resident info  (based on classwork)
@app.route('/api/resident', methods=['PUT'])
def api_put_resident_byid():
    request_data = request.get_json()
    updatefirst = request_data['firstname']
    updatelast = request_data['lastname']
    updateage = request_data['age']
    updateroom = request_data['room']
    
    sql = "update resident set firstname ='%s', lastname ='%s', age ='%s' where room ='%s'" %(updatefirst, updatelast, updateage, updateroom)
    execute_myquery(con, sql)
        
    return "Put active request successful!"

app.run()