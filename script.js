document.getElementById('weatherForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const streetInput = document.getElementById('street');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const useCurrentLocation = document.getElementById('useCurrentLocation').checked;

    clearErrorMessages();
    if (!useCurrentLocation) {
        let isValid = true;

        if (!streetInput.value.trim()) {
            displayErrorMessage(streetInput, 'Fill out this field');
            isValid = false;
        }

        if (!cityInput.value.trim()) {
            displayErrorMessage(cityInput, 'Fill out this field');
            isValid = false;
        }

        if (!stateInput.value) {
            displayErrorMessage(stateInput, 'Fill out this field');
            isValid = false;
        }

        if (!isValid) {
            return; 
        }
    }

    let lat, lon;

    if (useCurrentLocation) {
        streetInput.disabled = true;
        cityInput.disabled = true;
        stateInput.disabled = true;
        fetch('https://ipinfo.io/json?token=c7e561c07c14b9')
            .then(response => response.json())
            .then(data => {
                [lat, lon] = data.loc.split(',');
                const city = data.city;
                const region = data.region;
                console.log(lat);
                console.log(lon);
                console.log("DATA", data);
                fetchCurrentLocationWeather(lat, lon, city, region); 
                fetchWeatherForecast(lat, lon);
                fetchHourlyForecast(lat, lon);
            })
            .catch(error => {
                alert('Error detecting location');
                console.error(error);
            });
    } else {
        streetInput.disabled = false;
        cityInput.disabled = false;
        stateInput.disabled = false;

        const address = `${streetInput.value}, ${cityInput.value}, ${stateInput.value}`;
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyDXD0Q-sBAxl1Fx0um7z8eE_zL5sKhvT1I`)
            .then(response => response.json())
            .then(data => {
                console.log("Google Geocoding API response:", data);
                if (data.status === "OK" && data.results.length > 0) {
                    lat = data.results[0].geometry.location.lat;
                    lon = data.results[0].geometry.location.lng;
                    const location = data.results[0].formatted_address;
                    console.log("Location:", location);
                    fetchInputLocationWeather(lat, lon, location);
                    fetchWeatherForecast(lat, lon);
                    fetchHourlyForecast(lat, lon);
                } else {
                    throw new Error(`Geocoding failed: ${data.status}`);
                }
            })
            .catch(error => {
                console.error("Error fetching address data:", error);
                alert(`Error fetching address data: ${error.message}`);
            });
    }
});

function displayErrorMessage(inputElement, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '0.8em';
    errorElement.style.marginTop = '5px';
    inputElement.parentNode.appendChild(errorElement);
    inputElement.style.borderColor = 'red';
}

function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());

    const inputs = document.querySelectorAll('#street, #city, #state');
    inputs.forEach(input => input.style.borderColor = '');
}


document.getElementById('useCurrentLocation').addEventListener('change', function() {
    if (this.checked) {
        clearErrorMessages();
    }
});

function toggleInputs(disabled) {
    street.disabled = disabled;
    city.disabled = disabled;
    state.disabled = disabled;
}


useCurrentLocation.addEventListener('change', function() {
    if (this.checked) {
        toggleInputs(true);
    } else {
        toggleInputs(false);
    }
});

function fetchCurrentLocationWeather(lat, lon, city, region) {
    fetch(`/weather?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                console.log(data);
                const location = `${city}, ${region}`;
                displayWeatherResults(data, location);
            }
        })
        .catch(error => {
            alert("Error fetching weather data");
            console.error(error);
        });
}

function fetchInputLocationWeather(lat, lon, location) {
    fetch(`/weather?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                console.log(data);
                console.log("MAYBELOCATION", location);
                displayWeatherResults(data, location);
            }
        })
        .catch(error => {
            alert("Error fetching weather data");
            console.error(error);
        });
}

function fetchWeatherForecast(lat, lon) {
    fetch(`/weather_forecast?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.error) {
                alert(data.error);
            } else {
                displayWeatherForecastResults(data);
                temperatureChart(data);
            }
        })
        .catch(error => {
            alert("Error fetching weather data (forecast)");
            console.error(error);
        });
}
function fetchHourlyForecast(lat, lon) {
    console.log("HOURLY", lat, lon)
    fetch(`/hourly_forecast?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                hourlyChart(data);
            }
        })
        .catch(error => {
            alert("Error fetching weather data (forecast)");
            console.error(error);
        });
}
function displayWeatherResults(data, location) {  
    const weatherDiv = document.getElementById('weatherResults');
    const weatherValues = data?.data?.timelines?.[0]?.intervals?.[0]?.values;
    console.log("here");    
    if (!weatherValues) {
        weatherDiv.innerHTML = '<p>Weather data not available</p>';
        return;
    }
    weatherDiv.style.display = 'block';
    weatherDiv.innerHTML = `
        <h2>${location}</h2> 
        <div class="temperature-status">
            <p>${mapWeatherCodeToStatus(weatherValues.weatherCode)}</p>
            <div class="temperatureContainer">
                <p class="temperatureDailyResult" style="font-size: 80px;">${weatherValues.temperature}°</p>
            </div>
        </div>
        <div class="weather-icons">
            <div class="weather-icon">
                <p>Humidity</p> 
                <img src="static/humidity.png" alt="Humidity Icon">
                <p>${weatherValues.humidity} %</p> 
            </div>
            <div class="weather-icon">
                <p>Pressure</p> 
                <img src="static/Pressure.png" alt="Pressure Icon">
                <p>${weatherValues.pressureSeaLevel} hPa</p> 
            </div>
            <div class="weather-icon">
                <p>Wind Speed</p> 
                <img src="static/Wind_Speed.png" alt="Wind Speed Icon">
                <p>${weatherValues.windSpeed} mph</p> 
            </div>
            <div class="weather-icon">
                <p>Visibility</p> 
                <img src="static/Visibility.png" alt="Visibility Icon">
                <p>${weatherValues.visibility} miles</p> 
            </div>
            <div class="weather-icon">
                <p>Cloud Cover</p> 
                <img src="static/Cloud_Cover.png" alt="Cloud Cover Icon">
                <p>${weatherValues.cloudCover} %</p> 
            </div>
            <div class="weather-icon">
                <p>UV Level</p> 
                <img src="static/UV_Level.png" alt="UV Index Icon">
                <p>${weatherValues.uvIndex}</p> 
            </div>
        </div>
    `;
}
function mapWeatherCodeToStatus(weatherCode) {
    const weatherCodes = {
        0: {"description": "Unknown", "image": "/static/Weather Symbols for Weather Codes/unknown.png"},
        1000: {"description": "Clear", "image": "/static/Weather Symbols for Weather Codes/clear_day.svg"},
        1100: {"description": "Mostly Clear", "image": "/static/Weather Symbols for Weather Codes/mostly_clear_day.svg"},
        1101: {"description": "Partly Cloudy", "image": "/static/Weather Symbols for Weather Codes/partly_cloudy_day.svg"},
        1102: {"description": "Mostly Cloudy", "image": "/static/Weather Symbols for Weather Codes/mostly_cloudy.svg"},
        1001: {"description": "Cloudy", "image": "/static/Weather Symbols for Weather Codes/cloudy.svg"},
        2000: {"description": "Fog", "image": "/static/Weather Symbols for Weather Codes/fog.svg"},
        2100: {"description": "Light Fog", "image": "/static/Weather Symbols for Weather Codes/fog_light.svg"},
        4000: {"description": "Drizzle", "image": "/static/Weather Symbols for Weather Codes/drizzle.svg"},
        4001: {"description": "Rain", "image": "/static/Weather Symbols for Weather Codes/rain.svg"},
        4200: {"description": "Light Rain", "image": "/static/Weather Symbols for Weather Codes/rain_light.svg"},
        4201: {"description": "Heavy Rain", "image": "/static/Weather Symbols for Weather Codes/rain_heavy.svg"},
        5000: {"description": "Snow", "image": "/static/Weather Symbols for Weather Codes/snow.svg"},
        5001: {"description": "Flurries", "image": "/static/Weather Symbols for Weather Codes/flurries.svg"},
        5100: {"description": "Light Snow", "image": "/static/Weather Symbols for Weather Codes/snow_light.svg"},
        5101: {"description": "Heavy Snow", "image": "/static/Weather Symbols for Weather Codes/snow_heavy.svg"},
        6000: {"description": "Freezing Drizzle", "image": "/static/Weather Symbols for Weather Codes/freezing_drizzle.svg"},
        6001: {"description": "Freezing Rain", "image": "/static/Weather Symbols for Weather Codes/freezing_rain.svg"},
        6200: {"description": "Light Freezing Rain", "image": "/static/Weather Symbols for Weather Codes/freezing_rain_light.svg"},
        6201: {"description": "Heavy Freezing Rain", "image": "/static/Weather Symbols for Weather Codes/freezing_rain_heavy.svg"},
        7000: {"description": "Ice Pellets", "image": "/static/Weather Symbols for Weather Codes/ice_pellets.svg"},
        7101: {"description": "Heavy Ice Pellets", "image": "/static/Weather Symbols for Weather Codes/ice_pellets_heavy.svg"},
        7102: {"description": "Light Ice Pellets", "image": "/static/Weather Symbols for Weather Codes/ice_pellets_light.svg"},
        8000: {"description": "Thunderstorm", "image": "static/Weather Symbols for Weather Codes/tstorm.svg"}
    }
    const status = weatherCodes[weatherCode];
    
    if (status) {
        return `
            <div class="weather-item">
                <img src="${status.image}" alt="${status.description}" />
                <p>${status.description}</p>
            </div>
        `;
    } else {
        return `
            <div class="weather-item">
                <img src="static/Weather Symbols for Weather Codes/unknown.png" alt="Unknown" />
                <p>Unknown Status</p>
            </div>
        `;
    }
}
function displayWeatherForecastResults(data) {
    const weeklyForecastDiv = document.getElementById('weeklyForecast');
    const weeklyForecastValues = data?.data?.timelines?.[0]?.intervals;

    if (!weeklyForecastValues || typeof weeklyForecastValues !== 'object') {
        weeklyForecastDiv.innerHTML = '<p>Weather data not available</p>';
        return;
    }

    let tableHTML = `
    <table class="forecast-table">
    <thead>
        <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Temp High</th>
            <th>Temp Low</th>
            <th>Wind Speed</th>
        </tr>
    </thead>
    <tbody>
`;
    let index = 0; 
    for (const day of weeklyForecastValues) {
        const date = new Date(day.startTime)
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
            weekday: 'long', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric'  
        }).format(date);
        const weatherStatus = mapWeatherCodeToStatus(day.values.weatherCode); 

        const tempHigh = day.values.temperatureMax.toFixed(2); 
        const tempLow = day.values.temperatureMin.toFixed(2); 
        const windSpeed = day.values.windSpeed.toFixed(2); 

        tableHTML += `
            <tr class="forecast-row" data-index="${index}">
                <td>${formattedDate}</td>
                <td>${weatherStatus}</td>
                <td>${tempHigh} °F</td>
                <td>${tempLow} °F</td>
                <td>${windSpeed} mph</td>
            </tr>
        `;
        index++;
    }

    tableHTML += `
    </tbody>
    </table>
`;
    weeklyForecastDiv.style.display = 'block';
    weeklyForecastDiv.innerHTML = tableHTML;

    const forecastRows = document.querySelectorAll('.forecast-row');
    forecastRows.forEach(row => {
        row.addEventListener('click', function() {
            const dayIndex = this.getAttribute('data-index');
            const selectedDay = weeklyForecastValues[dayIndex];
            dailyWeather(selectedDay);
    });
});
}
function dailyWeather(day) {
    document.getElementById('weatherForm').reset(); 
    document.getElementById('weatherResults').innerHTML = '';  
    document.getElementById('weeklyForecast').innerHTML = '';

    const weeklyForecastDiv = document.getElementById('weeklyForecast');
    weeklyForecastDiv.style.display = 'none';
    const weatherResults = document.getElementById('weatherResults');
    weatherResults.style.display = 'none';
    const chartsSection = document.getElementById('chartsSection');
    chartsSection.style.display = 'block';

    const date = new Date(day.startTime).toLocaleDateString('en-GB', {
        weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    });
    const weatherCode = day.values.weatherCode;
    const tempHigh = day.values.temperatureMax;
    const tempLow = day.values.temperatureMin;
    const windSpeed = day.values.windSpeed;
    const humidity = day.values.humidity;
    const precipitation = day.values.precipitationProbability;
    const precipitationType = day.values.precipitationType;
    const visibility = day.values.visibility;
    const sunriseTime = new Date(day.values.sunriseTime).toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true  
    });
    const sunsetTime = new Date(day.values.sunsetTime).toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true  
    });
    

    const dailyWeatherDiv = document.getElementById('dailyWeather');
    dailyWeatherDiv.innerHTML = '';
    
    dailyWeatherDiv.style.display = 'block';
    const heading = document.createElement('h3');
    heading.textContent = 'Daily Weather Details';
    heading.style.textAlign = 'center'; 
    dailyWeatherDiv.appendChild(heading);

    const image = mapWeatherCodeToStatus(weatherCode); 

    dailyWeatherDiv.innerHTML += `
        <p style="color: #2f426b;"><b>${date}</b></p>
        <p style="color: #2f426b;"><b>${image}</b></p> 
        <p class="tempHighLow" style="color: #2f426b;"><b>${tempHigh}°F/${tempLow}°F</b></p>
        <p><b>Precipitation: ${precipitationType}<b></p>  
        <p><b>Chance of Rain: ${precipitation}%</b></p>
        <p><b>Wind Speed: ${windSpeed} mph</b></p>
        <p><b>Humidity: ${humidity}%</b></p>
        <p><b>Visibility: ${visibility} miles</b></p> 
        <p><b>Sunrise/Sunset: ${sunriseTime}/${sunsetTime}</b></p>
    `;
}

document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('weatherForm').reset(); 
    document.getElementById('weatherResults').innerHTML = '';  
    document.getElementById('weeklyForecast').innerHTML = '';
    document.getElementById('dailyWeather').innerHTML = '';
    document.getElementById('weatherResults').style.display = 'none';  
    document.getElementById('weeklyForecast').style.display = 'none';  
    document.getElementById('dailyWeather').style.display = 'none';
    document.getElementById('chartsSection').style.display = 'none';
    document.getElementById('chartsContainer').style.display = 'none';
});

function arrowFunctionality() 
{
    const chartsContainer = document.getElementById('chartsContainer');
    const arrowFunctionality = document.getElementById('chartToggleArrow');

    if(chartsContainer.style.display === 'none' || chartsContainer.style.display === '') {
        chartsContainer.style.display = 'block';
        arrowFunctionality.innerHTML = '&#8595;';
    } else {
        chartsContainer.style.display = 'none';
        arrowFunctionality.innerHTML = '&#8595;';
    }
}

function temperatureChart(data) {
    const currentDay = new Date();
    currentDay.setHours(0, 0, 0, 0);

    const weeklyForecastValues = data?.data?.timelines?.[0]?.intervals;
    const filteredData = weeklyForecastValues.filter(day => {
        const date = new Date(day.startTime);
        return date >= currentDay && date < new Date(currentDay.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).slice(0, 6);

    const seriesData = filteredData.map(day => [
        new Date(day.startTime).getTime(), 
        day.values.temperatureMin,
        day.values.temperatureMax
    ]);

    console.log(seriesData);

   
    Highcharts.chart('tempChart', {
        chart: {
            type: 'arearange',
            zoomType: 'x'
        },
        title: {
            text: `Temperature Ranges (Min, Max)`
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Date'
            },
            dateTimeLabelFormats: { 
                day: '%b %e' 
            }
        },
        yAxis: {
            title: {
                text: 'Temperature (°F)'
            }
        },
        tooltip: {
            shared: true,
            valueSuffix: '°F'
        },
        plotOptions: {
            arearange: {
                fillOpacity: 0.3
            }
        },
        series: [{
            name: 'Temperature Range',
            data: seriesData,  
            color: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, 'orange'],  
                    [1, 'lightblue'] 
                ]
            },
            lineWidth: 2,
            marker: {
                enabled: true,
                fillColor: 'lightblue',
            }
        }]
    });
}

function hourlyChart(data) {
    const hourlyData = data.data.timelines[0].intervals;

    const temperatures = [];
    const humidities = [];
    const pressures = [];
    const winds = [];

    hourlyData.forEach((interval, index) => {
        const timestamp = new Date(interval.startTime).getTime();
        temperatures.push([timestamp, interval.values.temperature]);
        humidities.push([timestamp, interval.values.humidity]);
        pressures.push([timestamp, interval.values.pressureSeaLevel]);
        
        if(index % 2 === 0) {
            winds.push([timestamp, interval.values.windSpeed, interval.values.windDirection]);
        }
    });

    console.log(winds);
    const totalPressure = pressures.reduce((acc, val) => acc + val, 0);
    const averagePressure = totalPressure / pressures.length;

    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);
    const currentHourTimestamp = currentHour.getTime();

    Highcharts.chart('hourlyChart', {
        chart: {
            type: 'column',
            zoomType: 'x',
            height: 300,
            backgroundColor: '#f0f0f0'
        },
        title: {
            text: 'Hourly Weather (For Next 5 Days)',
            style: {
                fontSize: '20px'
            }
        },
        xAxis: {
            type: 'datetime',
            tickInterval: 6 * 3600 * 1000, 
            labels: {
                formatter: function() {
                    const hour = Highcharts.dateFormat('%H', this.value);
                    if(['00', '06', '12', '18'].includes(hour)) {
                        return hour;
                    }
                    return '';
                },
                style: {
                    fontSize: '12px'
                }
            },
            min: currentHourTimestamp,
            max: currentHourTimestamp + 5 * 24 * 3600 * 1000,
            gridLineWidth: 1,
            gridLineColor: '#e0e0e0',
        },
        yAxis: [{
            title: {
                text: null
            },
            labels: {
                format: '{value}°',
                style: {
                    fontSize: '12px'
                }
            },
            max: 105,
            tickInterval: 7,
            gridLineColor: '#e0e0e0'
        }, {
            title: {
                text: 'inHg',
                rotation: 0,
                align: 'high',
                offset: 0,
                y: -10,
                x: 30
            },
            labels: {
                format: '{value}',
                style: {
                    fontSize: '12px'
                }
            },
            opposite: true,
            min: 0,
            max: 100,
            gridLineWidth: 0,
            plotLines: [{
                color: 'orange',
                value: averagePressure,
                label: {
                    useHTML: true,
                    text: `<div style="font-size: 0.9em;">${averagePressure}</div>`,
                    align: 'right',
                    style: {
                        color: 'orange',
                    }
                }
            }]
        }],
        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat: '<table><tr><th colspan="2">{point.x:%A, %b %d, %H:%M}</th></tr>',
            pointFormat: '<tr><td style="color: {series.color};">{series.name}: </td>' +
                '<td style="text-align: right;"><b>{point.y:.1f}{series.unit}</b></td></tr>',
            footerFormat: '</table>',
            valueDecimals: 2
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'Temperature',
            type: 'spline',
            data: temperatures,
            color: '#FF0000',
            zIndex: 3,
            marker: {
                enabled: false
            },
            unit: '°F'
        }, {
            name: 'Humidity',
            type: 'column',
            data: humidities,
            color: '#7CB5EC',
            zIndex: 1,
            unit: '%'
        }, {
            name: 'Air Pressure',
            type: 'spline',
            data: pressures,
            yAxis: 1,
            color: '#FFA500',
            dashStyle: 'shortdot',
            zIndex: 2,
            marker: {
                enabled: false
            },
            unit: ' inHg'
        }, {
            name: 'Wind',
            type: 'windbarb',
            data: winds,
            color: Highcharts.getOptions().colors[1],
            lineWidth: 1.5,
            vectorLength:8,
            yOffset: -10,
            zIndex: 4,
        }],
        plotOptions: {
            spline: {
                marker: {
                    enabled: false
                }
            },
            column: {
                pointPadding: 0,
                groupPadding: 0,
                borderWidth: 0,
                shadow: false,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.0f}',
                    style: {
                        fontSize: '8px',
                        fontWeight: 'normal',
                        color: 'gray',
                        textOutline: '1px black'
                    },
                    y: -5
                }
            }
        }
    });

    const chart = Highcharts.charts[Highcharts.charts.length - 1];
    chart.series[0].update({
        dataLabels: {
            enabled: false
        }
    });
}