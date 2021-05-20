// city variable
let city = "";

// all other variables
let searchCity = $('#search-city');
let searchBtn = $('#search-btn');
let clearBtn = $('#clear-history');
let currentCity = $('#current-city');
let currentTemperature = $('#temperature');
let currentHumidity = $('#humidity');
let currentWind = $('#wind');
let currentUVindex = $('#uv-index');
let sCity = [];

// searching city function
function find(c) {
    for (let i=0; i<sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}

// setting API
let API = 'a0aca8a89948154a4182dcecc780b513';

// display current weather function
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== '') {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

// API (AJAX) call
function currentWeather(city) {
    let queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + API;
    $.ajax( {
        url:queryURL,
        method: 'GET',
    }).then(function(response) {
        
        console.log(response);
        
        let weathericon = response.weather[0].icon;
        let iconURL = 'https://openweathermap.org/img/wn/' + weathericon + '@2x.png';
        let date = new Date(response.dt*1000).toLocaleDateString();
        $(currentCity).html(response.name + '('+date+')' + '<img src = '+iconURL+'>');

        // making sure temperature is displayed in fahrenheit
        let tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html(tempF).toFixed(2) + '&#8457';

        // making sure humidity shows
        $(currentHumidity).html(response.main.humidity + '%');

        // adding wind --- setting to MPH
        let ws = response.wind.speed;
        let windsMPH = (ws * 2.237).toFixed(1);
        $(currentWind).html(windsMPH + 'MPH');

        // adding UV index
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getITem('cityname'));
            console.log(sCity);
            if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem('cityname', JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if (find(city) > 0) {
                    sCity.push(city.upperCase());
                    localStorage.setItem('cityname', JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }
    });
}

// returning UVIndex(response)
function UVIndex(ln, lt) {
    let uvqURL = 'https://api.openweathermap.org/data/2.5/uvi?appid=' + API + '&lat' + lt + '&lon' + ln;
    $.ajax ( {
        url:uvqURL,
        method: 'GET'
    }).then(function(response) {
        $(currentUVindex).html(response.value);
    });
}

// adding 5 day forecast
function forecast(cityid) {
    let dayover = false;
    let queryforecastURL = 'https://api.openweathermap.org/data/2.5/forecast?id=' + cityid + '&appid' + API;
    $.ajax ( {
        url:queryforecastURL,
        method: 'GET'
    }).then(function(response) {
        for (i=0; i<5; i++) {
            let date = new Date((response.list[((i + 1) * 8) -1].dt) * 1000).toLocaleDateString();
            let iconcode = response.list[((i + 1) * 8) -1].weather[0].icon;
            let iconURL = 'https://openweathermap.org/img/wn/' + iconcode + '.png';
            let tempK = response.list[((i + 1) * 8) -1].main.temp;
            let tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            let humidity = response.list[((i + 1) * 8) -1].main.humidity;

            $('#fDate' + i).html(date);
            $('#fImg' + i).html('<img src=' + iconURL + '>');
            $('#fTemp' + i).html(tempF + '&#8457');
            $('#fHumidity' + i).html(humidity + '%');
        }
    });
}

// adding search history
function invokePastSearch(event) {
    let liEl = event.target;
    if (event.target.matches('li')) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}

// run function
function loadLastCity() {
    $('ul').empty();
    let sCity = JSON.parse(localStorage.getItem('cityname'));
    if (sCity !== null) {
        sCity + JSON.parse(localStorage.getItem('cityname'));
        for (i=0; i<sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i-1];
        currentWeather(city);
    }
}

// clear history function
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem('cityname');
    document.location.reload();
}

// handlers
$('#search-btn').on('click', displayWeather);
$(document).on('click', invokePastSearch);
$(window).on('load', loadLastCity);
$('#clear-history').on('click', clearHistory);