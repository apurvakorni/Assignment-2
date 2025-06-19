from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests

app = Flask(__name__)

CORS(app)

TOMORROW_IO_API_KEY = 'XF2goZQ9WnLq2hpkmhHIqkHegDDt9jKc'
IPINFO_TOKEN = 'c7e561c07c14b9'

def fetch_weather(lat, lon):
    url = f'https://api.tomorrow.io/v4/timelines?location={lat},{lon}&fields=temperature,weatherCode,pressureSeaLevel,windSpeed,visibility,humidity,cloudCover,uvIndex&timesteps=current&units=imperial&timezone=America/Los_Angeles&apikey={TOMORROW_IO_API_KEY}'
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        return None
    
def fetch_weather_forecast(lat, lon):
    url = f'https://api.tomorrow.io/v4/timelines?location={lat},{lon}&fields=temperatureMax,temperatureMin,weatherCode,windSpeed,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,humidity&timesteps=1d&units=imperial&timezone=America/Los_Angeles&apikey={TOMORROW_IO_API_KEY}'
    response = requests.get(url)
    print(response.text)
    
    if response.status_code == 200:
        return response.json()
    else:
        return None

def fetch_hourly_forecast(lat, lon):
    url = f'https://api.tomorrow.io/v4/timelines?location={lat},{lon}&fields=temperature,humidity,pressureSeaLevel,windSpeed,windDirection&timesteps=1h&units=imperial&timezone=America/Los_Angeles&apikey={TOMORROW_IO_API_KEY}&startTime=now&endTime=nowPlus5d'
    response = requests.get(url)
    print(response.text)
    
    if response.status_code == 200:
        return response.json()
    else:
        return None

@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if lat and lon:
        weather_data = fetch_weather(lat, lon)
        if weather_data:
            return jsonify(weather_data), 200
        else:
            return jsonify({"error": "Unable to fetch weather data"}), 500
    else:
        return jsonify({"error": "lat and lon are required parameters"}), 400

@app.route('/weather_forecast', methods=['GET'])
def get_weather_forecast():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if lat and lon:
        weather_data = fetch_weather_forecast(lat, lon)
        if weather_data:
            return jsonify(weather_data), 200
        else:
            return jsonify({"error": "Unable to fetch weather data"}), 500
    else:
        return jsonify({"error": "lat and lon are required parameters"}), 400
    
@app.route('/hourly_forecast', methods=['GET'])
def get_hourly_forecast():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    print("maybe", lat, lon)

    if lat and lon:
        weather_data = fetch_hourly_forecast(lat, lon)
        if weather_data:
            return jsonify(weather_data), 200
        else:
            return jsonify({"error": "Unable to fetch weather data"}), 500
    else:
        return jsonify({"error": "lat and lon are required parameters"}), 400

@app.route('/get_location')
def get_location():
    ipinfo_url = f"https://ipinfo.io/?token={IPINFO_TOKEN}"
    ipinfo_response = requests.get(ipinfo_url).json()
    return jsonify(ipinfo_response)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
