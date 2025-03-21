async function getSuggestions() {
    const fuelType = document.getElementById('fuel-type').value;
    const bodyStyle = document.getElementById('body-style').value;
    const driveWheels = document.getElementById('drive-wheels').value;

    const userPreferences = {
        'fuel-type': fuelType,
        'body-style': bodyStyle,
        'drive-wheels': driveWheels
    };

    // Simulate fetching data from the server
    const suggestedCars = await fetchSuggestions(userPreferences);

    displaySuggestions(suggestedCars);
}

async function fetchSuggestions(preferences) {
    // Simulate fetching data from the server
    // Replace this with actual server call if needed
    const response = await fetch('suggestions.json');
    const data = await response.json();

    // Filter data based on user preferences
    return data.filter(car => 
        car['fuel-type'] === preferences['fuel-type'] &&
        car['body-style'] === preferences['body-style'] &&
        car['drive-wheels'] === preferences['drive-wheels']
    );
}

function displaySuggestions(cars) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';

    cars.forEach(car => {
        const carDiv = document.createElement('div');
        carDiv.classList.add('car-suggestion');

        carDiv.innerHTML = `
            <h2>${car.make} ${car['body-style']}</h2>
            <p>Fuel Type: ${car['fuel-type']}</p>
            <p>Drive Wheels: ${car['drive-wheels']}</p>
            <p>Price: ${car.price}</p>
            <img src="${car.image_url}" alt="Car Image">
        `;

        suggestionsDiv.appendChild(carDiv);
    });
}
