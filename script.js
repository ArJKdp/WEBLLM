async function getSuggestions(event) {
    event.preventDefault(); // Prevent the form from reloading the page

    const fuelType = document.getElementById('fuel-type').value;
    const bodyStyle = document.getElementById('body-style').value;
    const driveWheels = document.getElementById('drive-wheels').value;

    console.log('Fuel Type:', fuelType); // Debugging
    console.log('Body Style:', bodyStyle); // Debugging
    console.log('Drive Wheels:', driveWheels); // Debugging

    // Validate inputs
    if (!fuelType || !bodyStyle || !driveWheels) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Fields',
            text: 'Please select all fields before submitting.',
            showConfirmButton: true,
            confirmButtonText: 'Okay',
        });
        return;
    }

    const preferences = {
        'fuel-type': fuelType,
        'body-style': bodyStyle,
        'drive-wheels': driveWheels
    };

    // Show loading indicator
    Swal.fire({
        title: 'Loading...',
        text: 'Fetching car suggestions...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Load the dataset (Automobile_data.json)
        const response = await fetch('Automobile_data.json');
        const dataset = await response.json();

        // Filter the dataset based on user preferences
        const suggestions = dataset.filter(car => {
            return (
                car['fuel-type'] === preferences['fuel-type'] &&
                car['body-style'] === preferences['body-style'] &&
                car['drive-wheels'] === preferences['drive-wheels']
            );
        });

        Swal.close(); // Close the loading alert

        if (suggestions.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Results Found',
                text: 'No cars match your preferences. Try different options!',
                showConfirmButton: true,
                confirmButtonText: 'Okay',
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Suggestions Ready!',
                text: `We found ${suggestions.length} car(s) matching your preferences.`,
                showConfirmButton: true,
                confirmButtonText: 'Show Me!',
            }).then(() => {
                displaySuggestions(suggestions);
            });
        }
    } catch (error) {
        console.error('Error loading dataset:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error loading the dataset. Please try again later.',
            showConfirmButton: true,
            confirmButtonText: 'Okay',
        });
    }
}

async function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = ''; // Clear previous suggestions

    const googleApiKey = 'AIzaSyAZcj8THnTATnve-5ZDiCzf5qt1O_tAwM8'; // Replace with your Google API Key
    const searchEngineId = 'e55325090f39c4714'; // Replace with your Search Engine ID (CX)

    for (const [index, car] of suggestions.entries()) {
        const make = car.make || 'Unknown Make';
        const price = car.price ? `$${car.price}` : 'Price not available';
        const fuelType = car['fuel-type'] || 'Unknown Fuel Type';
        const bodyStyle = car['body-style'] || 'Unknown Body Style';
        const driveWheels = car['drive-wheels'] || 'Unknown Drive Wheels';

        // Make the query more specific
        const query = `${make} ${bodyStyle} ${fuelType} car`;
        const imageUrl = await fetchGoogleImage(query, googleApiKey, searchEngineId);

        console.log('Image URL for car:', imageUrl); // Debugging

        const carCard = document.createElement('div');
        carCard.classList.add('car-card');
        carCard.innerHTML = `
            <div class="car-details">
                <h3>${index + 1}. ${make}</h3>
                <p><strong>Price:</strong> ${price}</p>
                <p><strong>Fuel Type:</strong> ${fuelType}</p>
                <p><strong>Body Style:</strong> ${bodyStyle}</p>
                <p><strong>Drive Wheels:</strong> ${driveWheels}</p>
            </div>
        `;

        // Add click event to open a new page
        carCard.addEventListener('click', () => {
            const newPageUrl = `image.html?imageUrl=${encodeURIComponent(imageUrl)}&make=${encodeURIComponent(make)}`;
            console.log('Redirecting to:', newPageUrl); // Debugging
            console.log('Image URL:', imageUrl); // Debugging
            window.open(newPageUrl, '_blank'); // Open in a new tab
        });

        // Add animation to each card
        carCard.style.animation = 'fadeIn 0.5s ease';
        suggestionsDiv.appendChild(carCard);
    }

    // Notify the user that suggestions are displayed
    Swal.fire({
        icon: 'info',
        title: 'Suggestions Displayed',
        text: 'Click on a suggestion to view the image in a new tab!',
        timer: 3000,
        showConfirmButton: false,
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const imageCache = {};

async function fetchGoogleImage(query, apiKey, cx) {
    if (imageCache[query]) {
        return imageCache[query]; // Return cached result
    }

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${cx}&key=${apiKey}&searchType=image&num=1`;
    console.log('API Request URL:', url); // Debugging
    try {
        await sleep(1000); // Add a 1-second delay between requests
        const response = await fetch(url);
        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            return 'https://via.placeholder.com/400x300?text=No+Image+Found'; // Fallback image
        }
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const imageUrl = data.items[0].link;
            imageCache[query] = imageUrl; // Cache the result
            return imageUrl;
        } else {
            return 'https://via.placeholder.com/400x300?text=No+Image+Found'; // Fallback image
        }
    } catch (error) {
        console.error('Error fetching image from Google API:', error);
        return 'https://via.placeholder.com/400x300?text=Error+Fetching+Image'; // Fallback image
    }
}
