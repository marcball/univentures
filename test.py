import requests

url = "http://universities.hipolabs.com/search?country=united%20states"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    print("Fetched", len(data), "universities.")
    for uni in data[:5]:  # just print a few
        print(uni['name'], "-", uni['domains'][0])
else:
    print("Failed to fetch data:", response.status_code)