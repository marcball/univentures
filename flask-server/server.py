from flask import Flask, jsonify, request, make_response, session, g
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from SchoolDB import get_schools
from mysql.connector import Error
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from urllib.parse import urlparse
from dotenv import load_dotenv
import requests
import random
import time
import os






load_dotenv()
app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["https://univentures.vercel.app"])

def get_mysql_connection_from_url():
    db_url = os.getenv("MYSQL_URL")
    if not db_url:
        raise ValueError("MYSQL_URL is not set in the environment")
    
    if isinstance(db_url, bytes):
        db_url = db_url.decode("utf-8")

    parsed = urlparse(db_url)

    return mysql.connector.connect(
        host=parsed.hostname,
        port=parsed.port or 3306,
        user=parsed.username,
        password=parsed.password,
        database="railway"
    )

# Session & Cookie Configuration
app.secret_key = os.getenv("SECRET_KEY")
app.config['SESSION_COOKIE_SECURE'] = True  # just for local development, ONCE USING HTTPS SHOULD BE True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=14)  # sets cookie life span
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # just for local development, ONCE USING HTTPS SHOULD BE 'None'

# Email Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")  #should be in .env
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")  #should be in .env
app.config['MAIL_DEFAULT_SENDER'] = 'UniVentures Verification'

CORS(app, supports_credentials=True)
mail = Mail(app)
serializer = URLSafeTimedSerializer(os.getenv("SERIALIZER_SECRET")) #should be in .env


# Database connection utilities
def get_db_connection():
    if 'db_connection' not in g:
        g.db_connection = get_mysql_connection_from_url()
    return g.db_connection


# Close Connection - USERS
@app.teardown_appcontext
def close_db_connection_users(exception=None):
    db_connection_users = g.pop('db_connection_users', None)
    if db_connection_users is not None:
        db_connection_users.close()

# Close Connection - SCHOOLS
@app.teardown_appcontext
def close_db_connection_schools(exception=None):
    db_connection_schools = g.pop('db_connection_schools', None)
    if db_connection_schools is not None:
        db_connection_schools.close()






#
#
#   ACCOUNT ROUTES 
#   INCLUDES login, signup, check if logged in
#            get account data, update account data, 
#            logout
#
#


# LOGIN ROUTE
@app.route('/api/auth/login', methods=['POST'])
def login():
    # USER INPUT
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # GET DATABASE CONNECTION
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)                 # Makes the row return as a dictionary!

    #CHECK INPUT WITH DATABASE
    try:
        query = "SELECT * FROM accounts WHERE email = %s"   # Parameterized query! (Safe from SQL injection)
        cursor.execute(query, (email,))
        result = cursor.fetchone()
        
        # ACCOUNT EXISTS
        if result:
            stored_password_hash = result['password']   # database password
            
            # PASSWORD CORRECT
            if check_password_hash(stored_password_hash, password): 
                # VERIFIED
                if result['verified']:
                    response = make_response(jsonify({'message': 'Login successful'}))
                    session['user_id'] = result['id']
                    session.permanent = True
                    return response, 200
                # NOT VERIFIED
                else:
                    return jsonify({"message": "Please verify your email before logging in"}), 403

            # PASSWORD INCORRECT
            else:
                return jsonify({"message": "Invalid password"}), 401
            
        # ACCOUNT DOESNT EXIST
        else:
            return jsonify({"message": "Account associated with that email does not exist"}), 404
    finally:
        cursor.close()



# SIGNUP ROUTE
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    # USER INPUT
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # CONNECT TO DATABASE
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        query = "SELECT * FROM accounts WHERE email = %s"   # Parameterized query! (Safe from SQL injection)
        cursor.execute(query, (email,))
        result = cursor.fetchone()
        
        # EMAIL IS FOUND
        if result:
            return jsonify({"message": "Account with that email already exists"}), 409
        else:
            #HASH INPUT PASSWORD AND INSERT INTO DB
            hashed_password = generate_password_hash(password)
            
            #TRY TO GET UNIVERSITY FOR ACCOUNT
            domain = email.split('@')[1]
            response = get_school_by_domain(domain)
            print(response)
            
                        
            #school is found
            if isinstance(response, tuple):
                status_code = response[1]
                response = response[0]
            #school is not found
            else:
                status_code = response.status_code

            if status_code == 200:
                school_info = response.get_json()  # Extract JSON data from the Response object
                query = "INSERT INTO accounts (email, password, schoolId, schoolName) VALUES (%s, %s, %s, %s)"
                cursor.execute(query, (email, hashed_password, school_info[0], school_info[1]))
            elif status_code == 404:
                query = "INSERT INTO accounts (email, password) VALUES (%s, %s)"
                cursor.execute(query, (email, hashed_password))

            db.commit()

            # Send the verification email
            token = serializer.dumps(email, salt='email-confirm')
            verification_url = f"{request.url_root}verify/{token}"

            msg = Message('Confirm Your Email', recipients=[email])
            msg.body = f'Click the following link to verify your email address: {verification_url}'
            mail.send(msg)

            return jsonify({"message": "Account created"}), 201
            
    finally:
        cursor.close()




# CHECK SESSION/LOGIN/COOKIE ROUTE
@app.route('/api/auth/check-login', methods=['GET'])
def check_login():
    if 'user_id' in session:
        return jsonify({'isLoggedIn': True})
    else:
        return jsonify({'isLoggedIn': False})



# GET ACCOUNT DATA
@app.route('/api/account', methods=['GET'])
def get_account_info():
    
    # NOT LOGGED IN
    if 'user_id' not in session:
        return jsonify({"message": "User not logged in"}), 401
    
    user_id = session['user_id']
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    try:
        query = "SELECT id, email, firstName, lastName, schoolName, schoolId FROM accounts WHERE id = %s"
        cursor.execute(query, (user_id,))
        user_info = cursor.fetchone()
        
        if user_info:
            return jsonify(user_info), 200
        else:
            return jsonify({"message": "User not found"}), 404
            
    finally:
        cursor.close()



# UPDATE ACCOUNT DATA
@app.route('/api/account', methods=['POST'])
def update_account_info():
    # NOT LOGGED IN
    if 'user_id' not in session:
        return jsonify({"message": "User not logged in"}), 401

    user_id = session['user_id']
    data = request.get_json()

    # Validate input
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    if not first_name or not last_name:
        return jsonify({"message": "First and last name are required"}), 400

    # Connect to the database
    db = get_db_connection()
    cursor = db.cursor()

    try:
        # Update the user's first and last name in the database
        query = "UPDATE accounts SET firstName = %s, lastName = %s WHERE id = %s"
        cursor.execute(query, (first_name, last_name, user_id))
        db.commit()

        return jsonify({"message": "Account updated successfully"}), 200

    finally:
        cursor.close()



# LOGOUT ROUTE
@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    response = make_response(jsonify({'message': 'Logout successful'}))
    response.set_cookie('session', '', expires=0)
    return response, 200



# VERIFICATION ROUTE
@app.route('/verify/<token>')
def verify_email(token):
    try:
        # Verify the token and extract the email
        email = serializer.loads(token, salt='email-confirm', max_age=3600)  # Token expires in 1 hour
    except:
        return jsonify({"message": "The verification link is invalid or has expired."}), 400

    # Mark the user as verified
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        query = "UPDATE accounts SET verified = %s WHERE email = %s AND verified = %s"
        cursor.execute(query, (True, email, False))  # Only update if the user was 'unverified'
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "This email is already verified or does not exist."}), 400

        return jsonify({"message": "Email verified successfully!"}), 200
    finally:
        cursor.close()


# DELETE ACCOUNT ROUTE
@app.route('/api/auth/delete_account', methods=['DELETE'])
def delete_account():
    # USER INPUT
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # GET DATABASE CONNECTION
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        # CHECK IF THE ACCOUNT EXISTS
        query = "SELECT * FROM accounts WHERE email = %s"
        cursor.execute(query, (email,))
        result = cursor.fetchone()

        if not result:
            return jsonify({"message": "Account not found"}), 404
        
        # VERIFY PASSWORD
        stored_password_hash = result['password']
        if not check_password_hash(stored_password_hash, password):
            return jsonify({"message": "Invalid password"}), 401

        # DELETE THE ACCOUNT
        delete_query = "DELETE FROM accounts WHERE email = %s"
        cursor.execute(delete_query, (email,))
        db.commit()

        # CLEAR SESSION (if applicable)
        session.pop('user_id', None)

        return jsonify({"message": "Account successfully deleted"}), 200
    finally:
        cursor.close()




#
#
#   SCHOOL ROUTES
#   Includes search, get details, get specific school, and secretfunction to fill our databases!
#
#



#Search Schools
@app.route('/api/schools', methods=['GET'])
def search_schools():
    query = request.args.get('query')
    schools = get_schools(query)  # Function to query the database
    return jsonify(schools)





# Get school details by ID
@app.route('/api/schools/<int:school_id>', methods=['GET'])
def get_school_by_id(school_id):
    db = get_db_connection()
    
    cursor = db.cursor(dictionary=True)

    try:
        if db.is_connected():
            cursor.execute("SELECT * FROM names WHERE id = %s", (school_id,))
            school = cursor.fetchone()  # Fetch the school details

            if school:
            
                return jsonify(school)  # Return the school data in JSON format
            else:
                return jsonify({'error': 'School not found'}), 404  # Return 404 if not found
    except Error as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500  # Handle errors
    finally:
        cursor.close()


# fetch locations from database
@app.route('/api/school/<int:school_id>/locations', methods=['GET'])
def get_school_locations(school_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    # Get query parameters (if any)
    type_filter = request.args.get('type', '')
    ratings_filter = request.args.get('ratings', None)

    # Base query with school_id condition
    query = "SELECT * FROM locations WHERE school_id = %s"
    params = [school_id]

    # Add optional filters
    if type_filter:
        query += " AND type = %s"
        params.append(f"{type_filter}")
    if ratings_filter is not None:
        query += " AND ratings >= %s"
        params.append(float(ratings_filter))

    cursor.execute(query, params)
    locations = cursor.fetchall()
    cursor.close()
    return jsonify(locations)



# GET SCHOOL BY DOMAIN - for signup route
@app.route('/api/schools/<string:domain>', methods=['GET'])
def get_school_by_domain(domain):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT id, school_name FROM names WHERE domain = %s", (domain,))
        school = cursor.fetchone()  # Fetch the school details

        if school:
            return jsonify(school)  # Return the school data in JSON format
        else:
            return jsonify({'error': 'School not found'}), 404  # Return 404 if not found
    except Error as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500  # Handle errors
    finally:
        cursor.close()




#FILL your names table!
# This function grabs all universities from
# http://universities.hipolabs.com/ API
# filtered to United States
def insert_school_data(name, domain):
    db = get_db_connection()
    cursor = db.cursor()
    query = "INSERT INTO names (school_name, domain) VALUES (%s, %s)"
    cursor.execute(query, (name, domain))
    db.commit()
    cursor.close()
    
@app.route('/api/supersecretfunction', methods=['GET'])
def purge_and_refill():
    provided_key = request.args.get('key') or request.headers.get('X-Admin-Key')
    expected_key = os.getenv("ADMIN_SECRET_KEY")

    if provided_key != expected_key:
        return jsonify({"error": "Unauthorized access"}), 403

    url = "http://universities.hipolabs.com/search?country=united%20states"
    
    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        return jsonify({"error": "University data decode failed"}), 500

    for uni in data:
        try:
            name = uni["name"]
            domain = uni["domains"][0]
            insert_school_data(name, domain)
        except Exception as e:
            print(f"ailed to insert {uni.get('name', '?')}: {e}")

    return jsonify({"message": "Data fetched and stored successfully!"})

#FILL your names table with LATITUDE and LONGITUDE!
# This function uses OpenStreetMap
# takes the university name and finds a latitude and longitude if exists
# Nominatim API base URL
BASE_URL = "https://nominatim.openstreetmap.org/search"

def get_coordinates(university_name):
    params = {
        "q": university_name,
        "format": "json",
        "addressdetails": 1,
        "limit": 1
    }
    
    try:
        response = requests.get(BASE_URL, params=params, headers={"User-Agent": "University Geocoder"})
        data = response.json()
        
        if data:
            lat = data[0]["lat"]
            lon = data[0]["lon"]
            return float(lat), float(lon)
        else:
            print(f"Could not find coordinates for {university_name}")
            return None, None
    except requests.exceptions.RequestException as e:
        print(f"Error geocoding {university_name}: {e}")
        return None, None
    
@app.route('/api/fill-locations', methods=['GET'])
def update_database():
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT id, school_name FROM names WHERE latitude IS NULL OR longitude IS NULL")
    universities = cursor.fetchall()

    for uni_id, name in universities:
        lat, lon = get_coordinates(name)
        
        if lat and lon:
            query = "UPDATE names SET latitude = %s, longitude = %s WHERE id = %s"
            cursor.execute(query, (lat, lon, uni_id))
            db.commit()
            print(f"Updated {name} with latitude: {lat}, longitude: {lon}")
        time.sleep(1)  # Sleep to avoid exceeding rate limits (1 request per second)





#Route to add adventures to the database
@app.route('/api/adventure', methods=['POST'])
def add_adventure():
     # Connect to the database
    db = get_db_connection()
    cursor = db.cursor()

    try:

        # Extract data from request body
        data = request.json
        school_id = data.get('schoolId')
        name = data.get('adventureName')
        type = data.get('type')
        description = data.get('description')
        image_url = data.get('imageUrl')
        address = data.get('address')
        rating = data.get('rating')

        # Validate input
        if not all([school_id, name, description, address]):
            return jsonify({"error": "All fields are required"}), 400

        # SQL query with placeholders
        query = """
        INSERT INTO locations (school_id, name, type, description, image_url, address, ratings)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        cursor.execute(query, (school_id, name, type, description, image_url, address, rating))
        db.commit()

        return jsonify({"message": "Adventure added successfully"}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()

@app.route('/api/random-location', methods=['GET'])
def get_random_location():
    # Connect to the database
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)  # Use dictionary=True for easy JSON serialization

    try:
        school_id = request.args.get('school_id')
        if not school_id:
            return jsonify({"error": "school_id is required"}), 400

        # Query to fetch random location
        query = """
        SELECT id, school_id, name, type, description, image_url, address, ratings
        FROM locations
        WHERE school_id = %s
        ORDER BY RAND()
        LIMIT 1;
        """
        cursor.execute(query, (school_id,))
        random_location = cursor.fetchone()

        if not random_location:
            return jsonify({"error": "No locations available for the given school_id"}), 404

        return jsonify(random_location), 200

    except Exception as e:
        print("Error fetching random location:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()

# GOOGLE API KEY
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# Debug to make sure it's working.
print("[DEBUG] GOOGLE_API_KEY loaded:", bool(GOOGLE_API_KEY))


# Fetch university details
@app.route('/api/university/<int:id>', methods=['GET'])
def get_university(id):
    conn = get_mysql_connection_from_url()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM names WHERE id = %s", (id,))
    university = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(university) if university else ({"error": "University not found"}, 404)

# Fetch nearby places with photos
@app.route('/api/nearby/<int:id>/<string:category>', methods=['GET'])
@app.route('/api/nearby/<int:id>/', methods=['GET'])
def get_nearby_places(id, category=None):
    conn = get_mysql_connection_from_url()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT latitude, longitude FROM names WHERE id = %s"
    cursor.execute(query, (id,))
    location = cursor.fetchone()
    cursor.close()
    conn.close()

    if not location or not location['latitude'] or not location['longitude']:
        print(f"[DEBUG] Missing lat/lon for school ID: {id}")
        return jsonify({"error": f"Missing coordinates for school: {id}"}), 404

    latitude = location['latitude']
    longitude = location['longitude']
    
    # Define place types for Google Places API
    place_types = {
        "restaurants": "restaurant",
        "restaurant": "restaurant",
        "activities": "tourist_attraction",
        "clubs": "night_club",
        "stores": "store"
    }

    if category:
        place_type = place_types.get(category.lower())
        if not place_type:
            return jsonify({"error": "Invalid category"}), 400
        url = (
            f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
            f"location={latitude},{longitude}&radius=5000&type={place_type}&rankby=prominence&key={GOOGLE_API_KEY}"
        )
    else:
        url = (
            f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
            f"location={latitude},{longitude}&radius=5000&rankby=prominence&key={GOOGLE_API_KEY}"
        )

    # Call Google Places API

    print("[DEBUG] Google API URL preview:", url.split("&key=")[0])
    
    try: 
        response = requests.get(url)
        print("[DEBUG] Google API status:", response.status_code)

        if response.status_code != 200:
            print("[DEBUG] Google API response snippet:", response.text[:250])
            return jsonify({"error": "Failed to fetch nearby places"}), response.status_code

    except Exception as e:
        print("[ERROR] Google API call exception:", str(e))
        return jsonify({"error": "Google API call failing"}), 500

    # Process API response
    places = response.json().get("results", [])
    formatted_places = []

    #sorted_places = sorted(places, key=lambda x: x.get("rating", 0), reverse=True)

    for place in places:
        formatted_place = {
            "name": place.get("name"),
            "vicinity": place.get("vicinity"),
            "rating": place.get("rating"),
            "place_id": place.get("place_id"),
            "photos": []
        }

        # Process photo references if available
        if "photos" in place:
            formatted_place["photos"] = [
                {
                    "photo_reference": photo["photo_reference"],
                    "photo_url": f"https://maps.googleapis.com/maps/api/place/photo"
                                 f"?maxwidth=400&photo_reference={photo['photo_reference']}&key={GOOGLE_API_KEY}"
                }
                for photo in place["photos"]
            ]

        formatted_places.append(formatted_place)

    return jsonify(formatted_places)

# Route to get user id
@app.route('/api/auth/user-info', methods=['GET'])
def get_user_info():
    # Check if the user is logged in by checking if 'user_id' exists in the session
    if 'user_id' in session:
        user_id = session['user_id']
        return jsonify({'user_id': user_id}), 200
    else:
        return jsonify({'error': 'User not logged in'}), 401

# Route to add a new review
@app.route('/api/reviews', methods=['POST'])
def add_review():
    data = request.json
    school_id = data.get('school_id')
    location_id = data.get('location_id')
    review_text = data.get('review')
    user_id = data.get('user_id')  # Retrieve the user_id from the request

    if not (school_id and location_id and review_text and user_id):
        return jsonify({'error': 'Missing data'}), 400

    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = """
                INSERT INTO reviews (school_id, location_id, review_text, user_id)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (school_id, location_id, review_text, user_id))  
            connection.commit()
            return jsonify({'message': 'Review added successfully'}), 201
        except Error as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    else:
        return jsonify({'error': 'Database connection failed'}), 500


# Route to fetch reviews by school and location
@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    school_id = request.args.get('school_id')
    location_id = request.args.get('location_id')

    if not (school_id and location_id):
        return jsonify({'error': 'Missing query parameters'}), 400

    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT * FROM reviews
                WHERE school_id = %s AND location_id = %s
            """
            cursor.execute(query, (school_id, location_id))
            reviews = cursor.fetchall()
            return jsonify(reviews), 200
        except Error as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    else:
        return jsonify({'error': 'Database connection failed'}), 500
    
# Route for fetching reviews based on user id
@app.route('/api/reviews/user', methods=['GET'])
def get_reviews_by_user():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'Missing user_id parameter'}), 400

    # Connect to the database
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            # Modify this query based on your actual database schema
            query = """
                 SELECT reviews.*, 
	            names.school_name AS school_name, 
                locations.name AS location_name
                FROM reviews
                LEFT JOIN names ON reviews.school_id = names.id
                LEFT JOIN locations ON reviews.location_id = locations.id
                WHERE reviews.user_id = %s
            """
            cursor.execute(query, (user_id,))
            reviews = cursor.fetchall()

            return jsonify(reviews), 200


        except Error as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    else:
        return jsonify({'error': 'Database connection failed'}), 500
    

# Route to delete a review by review_id
@app.route('/api/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    # Connect to the database
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)

            # Check if the review exists
            check_query = """
                SELECT * FROM reviews WHERE review_id = %s
            """
            cursor.execute(check_query, (review_id,))
            review = cursor.fetchone()

            if not review:
                return jsonify({'error': 'Review not found'}), 404

            # Delete the review from the database
            delete_query = """
                DELETE FROM reviews WHERE review_id = %s
            """
            cursor.execute(delete_query, (review_id,))
            connection.commit()

            return jsonify({'message': 'Review deleted successfully'}), 200
        except Error as e:
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    else:
        return jsonify({'error': 'Database connection failed'}), 500
    

# Route to update star rating
@app.route('/api/rate', methods=['POST'])
def rate_activity():
    data = request.json
    location_id = data.get('location_id')
    user_rating = data.get('rating')
    user_id = data.get('user_id')  # Ensure you pass the user ID from the frontend

    if not location_id or user_rating is None:
        return jsonify({"error": "Location ID and rating are required"}), 400

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Insert or update user rating
        cursor.execute("""
            INSERT INTO user_ratings (location_id, user_id, rating)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE rating = VALUES(rating)
        """, (location_id, user_id, user_rating))

        # Calculate the new average rating for the location
        cursor.execute("""
            SELECT AVG(rating) as avg_rating
            FROM user_ratings
            WHERE location_id = %s
        """, (location_id,))
        avg_rating = cursor.fetchone()['avg_rating']

        # Update the average rating in the locations table
        cursor.execute("""
            UPDATE locations
            SET ratings = %s
            WHERE id = %s
        """, (avg_rating, location_id))
        
        connection.commit()
        return jsonify({"message": "Rating updated successfully", "average_rating": avg_rating}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
