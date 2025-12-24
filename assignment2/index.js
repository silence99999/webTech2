require("dotenv").config()

const express = require('express')
const url = require("node:url");


const app = express()
const PORT = 3030
const API_KEY_WEATHER = process.env.API_KEY_WEATHER;
const API_KEY_NEWS = process.env.API_KEY_NEWS;
const API_KEY_COUNTRY = process.env.API_KEY_COUNTRY

const path = require("path");

app.use(express.static(
    path.join(__dirname, "../assignment2/public")
));
app.use(express.json())

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access it at: http://localhost:${PORT}`);
});

app.get('/weather',async (req, res) => {
    const city = req.query.city || "Astana"

    const urlWeather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY_WEATHER}&units=metric`;
    const urlCountry = ``
    try {
        const responseWeather = await fetch(urlWeather)
        const dataWeather = await responseWeather.json()

        const lat = dataWeather.coord.lat
        const lon = dataWeather.coord.lon
        const urlAirPollution = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY_WEATHER}`
        const responseAirPollution = await fetch(urlAirPollution)
        const dataAirPollution = await responseAirPollution.json()


        let rain_3h = 0

        if (dataWeather.rain && dataWeather.rain["3h"]) {
            rain_3h = dataWeather.rain["3h"]
        }

        let airQuality
        switch (dataAirPollution.list[0].main.aqi) {
            case 1:
                airQuality = "Good"
                break
            case 2:
                airQuality = "Fair"
                break
            case 3:
                airQuality = "Moderate"
                break
            case 4:
                airQuality = "Poor"
                break
            case 5:
                airQuality = "Very Poor"
                break
        }

        let dateTime = new Date(1000 * dataAirPollution.list[0].dt)
        let CO_Concentration = dataAirPollution.list[0].components.co.toString() + " μg/m3"
        let country = dataWeather.sys.country

        const responseCountry = await fetch(
            `https://restcountries.com/v3.1/alpha/${country}`
        );
        const dataCountry = await responseCountry.json();


        let language = "en";

        if (dataCountry[0]?.languages) {
            const lang639_3 = Object.keys(dataCountry[0].languages)[0];

            const langMap = {
                eng: "en",
                rus: "ru",
                kaz: "kk",
                fra: "fr",
                deu: "de",
                spa: "es"
            };

            language = langMap[lang639_3] || "en";
        }
        const urlNews = `https://newsdata.io/api/1/latest?apikey=${API_KEY_NEWS}&country=${country}&language=${language}`
        const responseNews = await fetch(urlNews)
        const dataNews = await responseNews.json()

        const result = {
            temperature: dataWeather.main.temp,
            feels_like: dataWeather.main.feels_like,
            descriptionWeather: dataWeather.weather[0].description,
            wind_speed: dataWeather.wind.speed,
            coordinates:{
                lat:lat,
                lon:lon,
            },
            country: country,
            rain_3h: rain_3h,
            air_quality:airQuality,
            dateTime:dateTime.toUTCString(),
            CO_concentration:CO_Concentration,
            dateNews:dataNews.results[0].pubDate,
            description:dataNews.results[0].description,
        };

        res.json(result)
    } catch (err) {
        res.status(500).json({error:err.message})
    }
})