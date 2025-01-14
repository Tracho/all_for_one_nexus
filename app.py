from flask import Flask, render_template, request, jsonify,  redirect, session, url_for
from pymongo import MongoClient
from bson import ObjectId, json_util
from bcrypt import checkpw
import json

class User:
    def __init__(self, id, user_name, password):
        self.id = id
        self.user_name = user_name
        self.password = password
    
    def __repr__(self):
        return f'<User: {self.user_name}>'
        
users = []
users.append(User(id=1,user_name="test1",password="pass101010"))     
users.append(User(id=1, user_name="test2", password="pass1660"))
print(users)

app = Flask(__name__)
app.secret_key = 'supadupasecretkey10101010'

# Read configuration from config.txt
with open('config.txt') as config_file:
    config = config_file.readlines()


# Parse configuration values
mongo_uri = config[0].strip().split('=')[1]
database_name = config[1].strip().split('=')[1]
collection_name = config[2].strip().split('=')[1]


# MongoDB Configuration
client = MongoClient(mongo_uri)
db = client[database_name]
collection = db[collection_name]

@app.before_request
def check_authentication():
    # Check if the user is logged in
    if 'user_id' not in session:
        # If not logged in and trying to access any route other than 'login', redirect to 'login'
        if request.endpoint != 'login':
            return redirect(url_for('login'))

@app.route('/fetch_data', methods=['GET'])
def fetch_data():
    page = request.args.get('page')
    items_per_page = request.args.get('per_page')

    # Check if 'page' and 'per_page' are not None, and provide defaults if needed
    if page is None:
        page = 1  # Default to page 1 if 'page' is not provided
    else:
        page = int(page)

    if items_per_page is None:
        items_per_page = 50  # Default to 50 items per page if 'items_per_page' is not provided
    else:
        items_per_page = int(items_per_page)

    # Use the 'page' and 'items_per_page' values to fetch the appropriate data
    skip = (page - 1) * items_per_page
    items = collection.find().skip(skip).limit(items_per_page)

    # Convert the MongoDB cursor to a list of dictionaries
    data = [json_util.loads(json_util.dumps(item)) for item in items]

    # Calculate the total number of items
    total_items = collection.count_documents({})

    # Calculate the total number of pages
    total_pages = (total_items + items_per_page - 1) // items_per_page

    # Prepare the response data
    response_data = {
        'items': data,
        'currentPage': page,
        'totalPages': total_pages,
    }

    # Serialize the response_data to JSON
    my_json_string = json.dumps(response_data, default=json_util.default)

    return my_json_string

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session.pop('user_id', None)
        username = request.form['username']
        password = request.form['password']

        user = next((x for x in users if x.user_name == username), None)
        if user and user.password == password:
            session['user_id'] = user.id
            return redirect(url_for('index'))
        
        return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/index', methods=['GET'])
def index():
    # Get pagination parameters from the query string or use default values
    page = int(request.args.get('page', type=int, default=1))  # Default to page 1
    per_page = int(request.args.get('per_page', type=int, default=50))  # Default to 50 items per page

    # Calculate the skip value based on the page number and items per page
    skip = (page - 1) * per_page

    # Query the database to retrieve a specific range of items
    items = collection.find().skip(skip).limit(per_page)

    # Count the total number of items for pagination
    total_items = collection.count_documents({})

    # Calculate the total number of pages
    total_pages = (total_items + per_page - 1) // per_page

    # Render the main index.html page with pagination information
    return render_template('index.html', items=items, total_pages=total_pages, current_page=page, per_page=per_page)




@app.route('/add_product', methods=['POST'])
def add_product():
    try:
        # Get data from the POST request
        data = request.get_json()

        # Insert the new product into the MongoDB collection
        # You can customize this based on your data structure
        new_product = {
            'SKU': data.get('sku'),
            'Name': data.get('name'),  # Add the 'Name' field
            'THR Link': data.get('thrLink'),  # Add the 'THR Link' field
            'WS Link': data.get('wsLink'),  # Add the 'WS Link' field
            'Pricing Strategy': data.get('pricingStrategy'),  # Add the 'Pricing Strategy' field
            'Basic Handling Time': data.get('basicHandlingTime'),  # Add the 'Basic Handling Time' field
            'Price': data.get('price'),  # Add the 'Price' field
            'Threshold for median HT calculation' : data.get('medianHT')
            # Add other fields as needed
        }
        
        collection.insert_one(new_product)

        return jsonify({'success': True, 'message': 'Product added successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})


@app.route('/delete_selected', methods=['POST'])
def delete_selected_items():
    data = request.json  # Assuming data is sent as JSON

    # Extract the list of selected item IDs from the request data
    selected_ids = data.get('selectedIds', [])

    # Check if there are selected IDs
    if not selected_ids:
        return jsonify({'success': False, 'message': 'No items selected for deletion'})

    try:
        # Delete the selected items from the MongoDB collection
        for item_id in selected_ids:
            collection.delete_one({'_id': ObjectId(item_id)})

        return jsonify({'success': True, 'message': f'Deleted {len(selected_ids)} items'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})



if __name__ == '__main__':
    app.run(debug=True, port=8080)

