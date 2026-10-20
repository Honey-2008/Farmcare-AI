// FARMCARE AI - SMART FARMING ASSISTANT

// 1. CROP RECOMMENDATION
const crops = [
    {
        name: "Rice",
        soils: ["clay", "loamy"],
        seasons: ["kharif", "rabi"],
        icon: "🌾"
    },
    {
        name: "Cotton",
        soils: ["black", "loamy"],
        seasons: ["kharif"],
        icon: "🌿"
    },
    {
        name: "Groundnut",
        soils: ["sandy", "loamy"],
        seasons: ["kharif", "rabi"],
        icon: "🥜"
    },
    {
        name: "Millets",
        soils: ["sandy", "black", "loamy"],
        seasons: ["kharif", "summer"],
        icon: "🌱"
    },
    {
        name: "Chickpea",
        soils: ["black", "loamy"],
        seasons: ["rabi"],
        icon: "🫘"
    },
    {
        name: "Watermelon",
        soils: ["sandy", "loamy"],
        seasons: ["summer"],
        icon: "🍉"
    }
];

function recommendCrops() {
    const soil = document.getElementById("soil").value;
    const season = document.getElementById("season").value;
    const result = document.getElementById("cropResults");

    const matched = crops.filter(crop => {
        const soilMatch =
            soil === "all" || crop.soils.includes(soil);

        const seasonMatch =
            season === "all" || crop.seasons.includes(season);

        return soilMatch && seasonMatch;
    });

    if (matched.length === 0) {
        result.innerHTML =
            "<h3>No examples found</h3>" +
            "<p>Try changing your selections.</p>";
        return;
    }

    result.innerHTML =
        "<h3>🌱 Crop Options</h3>" +
        "<ul>" +
        matched.map(crop =>
            `<li>${crop.icon} <strong>${crop.name}</strong></li>`
        ).join("") +
        "</ul>" +
        "<p>These are illustrative options. Check local climate, " +
        "water availability, soil testing and agricultural advice " +
        "before making planting decisions.</p>";
}


// 2. CROP DISEASE INFORMATION
const diseases = {
    tomato: {
        name: "Tomato Early Blight",
        symptoms:
            "Brown spots with ring-like patterns, often on older leaves.",
        advice:
            "Avoid prolonged leaf wetness, maintain suitable spacing, " +
            "remove infected plant debris and seek local expert advice."
    },

    rice: {
        name: "Rice Blast",
        symptoms:
            "Spindle-shaped leaf lesions may have pale centers and darker edges.",
        advice:
            "Use locally recommended resistant varieties, avoid excessive " +
            "nitrogen and consult agricultural experts about management."
    },

    mildew: {
        name: "Powdery Mildew",
        symptoms:
            "White, powdery patches can develop on leaves and stems.",
        advice:
            "Monitor plants, improve airflow where appropriate and obtain " +
            "a correct diagnosis before selecting a treatment."
    }
};

function showDisease(type) {
    const disease = diseases[type];
    const result = document.getElementById("diseaseInfo");

    result.innerHTML = `
        <h3>🍃 ${disease.name}</h3>
        <p><strong>Symptoms:</strong> ${disease.symptoms}</p>
        <p><strong>General guidance:</strong> ${disease.advice}</p>
        <p><strong>Important:</strong> Similar symptoms can have different
        causes. Confirm the diagnosis with an agricultural expert.</p>
    `;
}


// 3. LIVE WEATHER USING OPEN-METEO
async function getWeather() {
    const city = document.getElementById("city").value.trim();
    const result = document.getElementById("weatherResult");

    if (!city) {
        result.textContent = "Please enter a city name.";
        return;
    }

    result.textContent = "Loading weather information...";

    try {
        const geoURL =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Could not search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            result.textContent =
                "City not found. Check the spelling and try again.";
            return;
        }

        const place = geoData.results[0];

        const weatherURL =
            "https://api.open-meteo.com/v1/forecast?" +
            `latitude=${place.latitude}` +
            `&longitude=${place.longitude}` +
            "&current=temperature_2m,relative_humidity_2m," +
            "apparent_temperature,precipitation,weather_code,wind_speed_10m";

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Could not retrieve weather data.");
        }

        const weatherData = await weatherResponse.json();
        const weather = weatherData.current;

        const descriptions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            80: "Rain showers",
            81: "Moderate rain showers",
            82: "Heavy rain showers",
            95: "Thunderstorm"
        };

        const description =
            descriptions[weather.weather_code] || "Variable conditions";

        result.innerHTML = `
            <h3>🌦️ Weather in ${place.name}</h3>
            <p><strong>Conditions:</strong> ${description}</p>
            <p><strong>Temperature:</strong>
                ${weather.temperature_2m} °C</p>
            <p><strong>Feels like:</strong>
                ${weather.apparent_temperature} °C</p>
            <p><strong>Humidity:</strong>
                ${weather.relative_humidity_2m}%</p>
            <p><strong>Wind speed:</strong>
                ${weather.wind_speed_10m} km/h</p>
            <p><strong>Precipitation:</strong>
                ${weather.precipitation} mm</p>
            <p><small>Weather time: ${weather.time}</small></p>
        `;

    } catch (error) {
        result.textContent =
            "Weather could not be loaded. Check your internet " +
            "connection and try again.";
    }
}


// 4. IRRIGATION GUIDANCE
function irrigationGuide() {
    const plant = document.getElementById("plant").value;
    const moisture = document.getElementById("moisture").value;
    const result = document.getElementById("irrigationResult");

    const cropNames = {
        rice: "Rice",
        cotton: "Cotton",
        tomato: "Tomato",
        millet: "Millets"
    };

    let advice;

    if (moisture === "wet") {
        advice =
            "Check drainage and avoid adding water until the soil " +
            "and crop requirements have been assessed.";
    } else if (moisture === "normal") {
        advice =
            "Check the crop growth stage, upcoming rainfall and " +
            "root-zone moisture before deciding whether to irrigate.";
    } else {
        advice =
            "Check moisture near the root zone and assess the crop's " +
            "needs. Dry surface soil alone does not always mean irrigation " +
            "is required.";
    }

    result.innerHTML = `
        <h3>💧 ${cropNames[plant]} Irrigation Guide</h3>
        <p><strong>Selected soil condition:</strong> ${moisture}</p>
        <p>${advice}</p>
        <p>Consider local weather, soil type, crop stage and drainage.
        This general guide does not replace field-specific advice.</p>
    `;
}


// 5. ENTER KEY SUPPORT FOR WEATHER SEARCH
document.getElementById("city").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

console.log("🌾 FarmCare AI loaded successfully!");