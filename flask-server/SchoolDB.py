import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

def get_schools(query):
    try:
        # Establish a connection to the MySQL database
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "schools"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD")

        )

        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)  # Use dictionary for easier access
            # Use a parameterized query to prevent SQL injection
            cursor.execute("SELECT * FROM names WHERE school_name LIKE %s ORDER BY school_name ASC", ('%' + query + '%',))
            schools = cursor.fetchall()  # Fetch all results

            return schools

    except Error as e:
        print(f"Error: {e}")
        return []

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()