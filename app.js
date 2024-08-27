const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9878;
const WINDOW_SIZE = 10;
let windowNumbers = [];

const fetchNumbers = async (numberType) => {
    const urls = {
        'p': 'http://20.244.56.144/test/primes',
        'f': 'http://20.244.56.144/test/fibo',
        'e': 'http://20.244.56.144/test/even',
        'r': 'http://20.244.56.144/test/rand'
    };

    const apiKey = 'CodeGPT Plus Beta';

    try {
        const response = await axios.get(urls[numberType], {
            timeout: 500,
            headers: {
                'Authorization': `Bearer ${apiKey}` // Ensure this is the correct format
            }
        });
        return response.data.numbers || [];
    } catch (error) {
        if (error.response) {
            console.log(`Error fetching ${numberType} numbers: Status ${error.response.status}, Data:`, error.response.data);
        } else {
            console.log(`Error fetching ${numberType} numbers:`, error.message);
        }
        return [];
    }
};

// Endpoint to handle requests for different number types
app.get('/numbers/:numberId', async (req, res) => {
    const numberId = req.params.numberId;

    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
    }

    const fetchedNumbers = await fetchNumbers(numberId);

    // Store previous state of the window
    const windowPrevState = [...windowNumbers];

    // Add unique numbers to the window
    fetchedNumbers.forEach(num => {
        if (!windowNumbers.includes(num)) {
            windowNumbers.push(num);
        }
    });

    // Ensure the window size is within the limit
    while (windowNumbers.length > WINDOW_SIZE) {
        windowNumbers.shift(); // Remove oldest numbers to maintain the window size
    }

    // Calculate the average if the window size is met
    const avg = windowNumbers.length > 0 
        ? (windowNumbers.reduce((sum, num) => sum + num, 0) / windowNumbers.length).toFixed(2)
        : 0.00;

    res.json({
        windowPrevState: windowPrevState,
        windowCurrState: windowNumbers,
        numbers: fetchedNumbers,
        avg: parseFloat(avg)
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
