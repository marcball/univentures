import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()


def get_mysql_connection_from_url():
    db_url = os.getenv("MYSQL_URL")
    parsed = urlparse(db_url)

    return mysql.connector.connect(
        host=parsed.hostname,
        port=parsed.port or 3306,
        user=parsed.username,
        password=parsed.password,
        database=parsed.path.lstrip("/")  # remove leading slash
    )

def get_schools(query):
    try:
        # Establish a connection to the MySQL database
        connection = get_mysql_connection_from_url()

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