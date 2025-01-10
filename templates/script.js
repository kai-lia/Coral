const input = document.getElementById('address-input');
const suggestionsBox = document.getElementById('suggestions');
const searchForm = document.getElementById('search-form');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const searchButton = document.getElementById('search-button');
const dynamicWord = document.getElementById('dynamic-word');

// Array to store search history with addresses and coordinates
const searchHistory = [];

// Dynamic word options
const words = [
    "coral restoration projects",
    "marine conservation efforts",
    "coastal preservation initiatives",
    "biodiversity hotspots",
    "underwater ecosystems",
    "reef protection movements",
    "marine life sanctuaries"
];

let index = 0;
function changeWord() {
    dynamicWord.textContent = words[index];
    index = (index + 1) % words.length;
}

// Change the word every 3 seconds
setInterval(changeWord, 3000);

// Initial call to display the first word
changeWord();

// Fetch address suggestions
input.addEventListener('input', () => {
    const query = input.value;
    if (query.length < 3) {
        suggestionsBox.innerHTML = '';
        return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            suggestionsBox.innerHTML = '';
            data.forEach(item => {
                const suggestion = document.createElement('div');
                suggestion.textContent = item.display_name;
                suggestion.addEventListener('click', () => {
                    input.value = item.display_name;
                    //latitudeInput.value = item.lat;
                    //longitudeInput.value = item.lon;
                    storeSearch(item);
                    suggestionsBox.innerHTML = '';
                });
                suggestionsBox.appendChild(suggestion);
            });
        })
        .catch(error => console.error('Error fetching suggestions:', error));
});

// Function to store the selected address with latitude and longitude
function storeSearch(item) {
    const address = item.display_name;
    const latitude = item.lat;
    const longitude = item.lon;

    const result = {
        address: address,
        latitude: latitude,
        longitude: longitude
    };

    // Store the result in the search history
    searchHistory.push(result);

    console.log('Stored Search:', result);
    console.log('Search History:', searchHistory);
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#suggestions') && e.target !== input) {
        suggestionsBox.innerHTML = '';
    }
});

// Search button functionality (for manual form submission)
searchButton.addEventListener('click', () => {
    const query = input.value;
    if (query) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const item = data[0];
                    latitudeInput.value = item.lat;
                    longitudeInput.value = item.lon;
                    searchForm.submit();
                    storeSearch(item);
                } else {
                    alert('No results found for this address.');
                }
            })
            .catch(error => console.error('Error fetching search data:', error));
    } else {
        alert('Please enter an address.');
    }
});
