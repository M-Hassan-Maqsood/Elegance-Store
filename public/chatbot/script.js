// Constants
let API_KEY = ""; // Will be fetched from API
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const CSV_PATH = "khaadi_data.csv";  // CSV file is in the same directory as script.js
const RECOMMENDATION_API_URL = "http://localhost:5000/recommend"; // Our Flask API endpoint
const FILTER_OPTIONS_API_URL = "http://localhost:5000/filter_options"; // New endpoint for filter options
// const RECOMMENDATION_API_URL = "elegence-hqbdf0dnfgfhb6eu.centralindia-01.azurewebsites.net/recommend";
// const FILTER_OPTIONS_API_URL = "elegence-hqbdf0dnfgfhb6eu.centralindia-01.azurewebsites.net/filter_options";
// Global variables
let productData = [];
let productDataLoaded = false;
let cachedGeminiResponses = {};
let recognition = null;
let isListening = false;
let currentMode = "default"; // Track the current mode of the chatbot
let designerModeActive = false; // Track if designer mode is active
let designerPreferences = {
    skin_tone: null,
    event_type: null,
    product_type: null,
    budget: null
}; // Store user preferences for Designer mode
let currentDesignerStep = null; // Track which step of Designer mode we're on
let availableFilterOptions = {}; // Store available filter options from the API
let cachedRecommendations = []; // Store all recommendations
let currentRecommendationIndex = 0; // Track which recommendations have been shown

// Fetch API key
async function fetchApiKey() {
    try {
        const response = await fetch('/api/gemini-key');
        const data = await response.json();
        API_KEY = data.key;
        console.log("API key loaded successfully");
    } catch (error) {
        console.error("Failed to load API key:", error);
        // Fallback to the default key in case the API call fails
        API_KEY = process.env.GEMINI_API_KEY1; // Get API key from environment variable;
        console.warn("Using fallback API key");
    }
}

// Initialize speech recognition
function initSpeechRecognition() {
    try {
        // Check if browser supports speech recognition
        if ('SpeechRecognition' in window) {
            recognition = new SpeechRecognition();
        } else if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
        } else {
            console.error("Speech recognition not supported in this browser");
            return false;
        }

        // Configure speech recognition
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        // Set up event handlers
        recognition.onstart = function () {
            isListening = true;
            micButton.classList.add('recording');
            addMessageToChat("I'm listening...", "bot");
            console.log("Speech recognition started");
        };

        recognition.onresult = function (event) {
            console.log("Speech recognition result received", event);
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            console.log("Transcript:", transcript);
            // Automatically submit after a short delay
            setTimeout(() => handleUserMessage(), 500);
        };

        recognition.onerror = function (event) {
            console.error("Speech recognition error", event.error);
            isListening = false;
            micButton.classList.remove('recording');

            if (event.error === 'not-allowed') {
                addMessageToChat("Microphone access was denied. Please check your browser permissions.", "bot");
            } else {
                addMessageToChat("I couldn't hear you clearly. Please try again.", "bot");
            }
        };

        recognition.onend = function () {
            console.log("Speech recognition ended");
            isListening = false;
            micButton.classList.remove('recording');
        };

        return true;
    } catch (error) {
        console.error("Error initializing speech recognition:", error);
        return false;
    }
}

// Store information
const storeInfo = {
    name: "Elegance",
    contact: {
        phone: "+92-321-1234567",
        email: "support@elegance.com",
        address: "123 Fashion Boulevard, Gulberg III, Lahore, Pakistan"
    },
    shipping: {
        standard: "Free standard shipping on all orders above Rs. 3,000 (3-5 business days)",
        express: "Express shipping available for Rs. 500 (1-2 business days)",
        international: "International shipping available to select countries (7-14 business days)"
    },
    returns: {
        period: "30 days",
        condition: "Items must be unworn, with original tags and packaging",
        process: "Fill out the return form from your order confirmation email or contact our customer service"
    },
    sizes: {
        small: "Small (S): Bust 32-34 inches, Waist 26-28 inches",
        medium: "Medium (M): Bust 36-38 inches, Waist 30-32 inches",
        large: "Large (L): Bust 40-42 inches, Waist 34-36 inches",
        xlarge: "X-Large (XL): Bust 44-46 inches, Waist 38-40 inches"
    }
};

// DOM Elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const productRecommendations = document.getElementById("product-recommendations");
const suggestionButtons = document.querySelectorAll(".suggestion-btn");
const micButton = document.getElementById("mic-btn"); // Add mic button

// Event Listeners
sendButton.addEventListener("click", handleUserMessage);
userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserMessage();
    }
});

// Set up quick suggestion buttons
suggestionButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Special handling for the shipping info button
        if (button.textContent.trim() === "Shipping Info") {
            activateShippingMode();
        } else {
            userInput.value = button.textContent;
            handleUserMessage();
        }
    });
});

// Auto-resize textarea as user types
userInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
    if (this.scrollHeight > 150) {
        this.style.overflowY = "auto";
        this.style.height = "150px";
    } else {
        this.style.overflowY = "hidden";
    }
});

// Initialize - Load CSV data when page loads
window.addEventListener("DOMContentLoaded", async () => {
    await fetchApiKey(); // Wait for API key to load first
    loadProductData();
    userInput.focus();
    setupSpeechRecognition();
    setupSpecialModeButtons(); // Setup mode buttons
    setupLensInputButton(); // Setup lens input button
    fetchFilterOptions(); // Fetch available filter options
});

// Set up speech recognition with proper error handling
function setupSpeechRecognition() {
    // Check if microphone button exists in the DOM
    if (!micButton) {
        console.error("Microphone button not found in the DOM");
        return;
    }

    console.log("Setting up speech recognition...");
    const speechRecognitionSupported = initSpeechRecognition();

    if (speechRecognitionSupported) {
        console.log("Speech recognition supported and initialized");
        // Add click handler to microphone button
        micButton.addEventListener("click", toggleSpeechRecognition);
    } else {
        console.warn("Speech recognition not supported in this browser");
        micButton.style.display = 'none'; // Hide mic button if speech recognition is not supported
    }
}

// Toggle speech recognition on/off
function toggleSpeechRecognition() {
    console.log("Microphone button clicked, current listening state:", isListening);

    try {
        if (isListening) {
            console.log("Stopping speech recognition");
            recognition.stop();
        } else {
            console.log("Starting speech recognition");
            recognition.start();
        }
    } catch (error) {
        console.error("Error toggling speech recognition:", error);

        // Try to re-initialize in case of error
        isListening = false;
        micButton.classList.remove('recording');

        // Inform the user about the error
        addMessageToChat("There was a problem with the voice input. Please try again or check your microphone permissions.", "bot");

        // Re-initialize speech recognition
        initSpeechRecognition();
    }
}

// Load product data from CSV
async function loadProductData() {
    if (productDataLoaded) return;

    try {
        const response = await fetch(CSV_PATH);
        const csvText = await response.text();
        productData = parseCSV(csvText);
        productDataLoaded = true;
        console.log("Product data loaded successfully:", productData.length, "items");
    } catch (error) {
        console.error("Failed to load product data:", error);
        addMessageToChat("I'm having trouble loading our product catalog. Please try again later or contact us directly at " + storeInfo.contact.phone, "bot");
    }
}

// Parse CSV data
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        if (!line.trim()) return null;

        // Handle commas within quoted fields
        const values = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }

        values.push(currentValue); // Add the last value

        // Create object from headers and values
        const product = {};
        headers.forEach((header, index) => {
            product[header.trim()] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });

        return product;
    }).filter(item => item !== null);
}

// Handle user message
async function handleUserMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, "user");

    // Clear input field
    userInput.value = "";
    userInput.style.height = "auto";

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    try {
        // Check if we're in Designer mode
        if (designerModeActive) {
            // If we're in option selection mode, we don't need to process text input
            if (currentDesignerStep) {
                typingIndicator.remove();
                addMessageToChat("Please use the option buttons below to make your selection.", "bot");
                return;
            }

            // If user typed despite being in Designer mode
            typingIndicator.remove();
            await handleDesignerQuery(message);
            return;
        }

        // Ensure product data is loaded
        if (!productDataLoaded) {
            await loadProductData();
        }

        // First check for special responses (shipping, contact, etc.)
        const specialResponse = getSpecialResponseIfApplicable(message);
        if (specialResponse) {
            typingIndicator.remove();
            addMessageToChat(specialResponse, "bot");
            return;
        }

        // Use Gemini to understand and interpret the user query
        const interpretedQuery = await interpretUserQuery(message);
        console.log("Interpreted query:", interpretedQuery);

        // Search for products based on interpreted query
        let matchingProducts = [];
        if (interpretedQuery.isProductQuery) {
            matchingProducts = searchProducts(interpretedQuery);
        }

        // Remove typing indicator
        typingIndicator.remove();

        // Display results
        if (matchingProducts.length > 0) {
            // Show response and matching products if found
            addMessageToChat(interpretedQuery.response || `Here are some ${interpretedQuery.colors.join(", ") || ""} products that match your search:`, "bot");
            displayProducts(matchingProducts);
        } else if (interpretedQuery.isProductQuery) {
            // If it's a product query but no results, provide a helpful message
            addMessageToChat(interpretedQuery.response || "I couldn't find any products matching your exact description. Would you like to see similar options or try a different search?", "bot");
        } else {
            // For non-product queries, just show the conversational response
            addMessageToChat(interpretedQuery.response, "bot");
        }
    } catch (error) {
        // Remove typing indicator and show error message
        typingIndicator.remove();
        console.error("Error processing message:", error);
        addMessageToChat("I apologize for the inconvenience. I'm having trouble processing your request. Please try again.", "bot");
    }
}

// Handle Designer Mode queries
async function handleDesignerQuery(message) {
    try {
        // Extract parameters from the message
        const params = extractDesignerParams(message);

        // Show processing message
        addMessageToChat("Processing your outfit recommendation request...", "bot");

        // Call the Flask API
        const response = await fetch(RECOMMENDATION_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (data.success) {
            // Display recommendations
            displayDesignerRecommendations(data.recommendations);
        } else {
            // Display error message
            addMessageToChat(`I'm sorry, I couldn't get recommendations at the moment. ${data.error || 'Please try again later.'}`, "bot");
        }
    } catch (error) {
        console.error("Error in designer mode:", error);
        addMessageToChat("I'm having trouble connecting to the recommendation service. Please make sure the server is running and try again.", "bot");
    }
}

// Extract designer parameters from user message
function extractDesignerParams(message) {
    const params = {
        skin_tone: null,
        event_type: null,
        product_type: null,
        budget: "mid_range" // Default to mid-range
    };

    // Simple extraction logic - can be improved with NLP
    const msgLower = message.toLowerCase();

    // Skin tone detection
    if (msgLower.includes("fair skin") || msgLower.includes("fair complexion") || msgLower.includes("light skin")) {
        params.skin_tone = "Light/Fair";
    } else if (msgLower.includes("dark skin") || msgLower.includes("dark complexion")) {
        params.skin_tone = "Deep/Dark";
    } else if (msgLower.includes("medium skin") || msgLower.includes("olive")) {
        params.skin_tone = "Medium/Olive";
    }

    // Event type detection
    if (msgLower.includes("wedding")) {
        params.event_type = "Wedding";
    } else if (msgLower.includes("formal")) {
        params.event_type = "Formal";
    } else if (msgLower.includes("casual")) {
        params.event_type = "Casual";
    }

    // Product type detection
    if (msgLower.includes("top")) {
        params.product_type = "Top";
    } else if (msgLower.includes("bottom") || msgLower.includes("pants") || msgLower.includes("trousers")) {
        params.product_type = "Bottom";
    } else if (msgLower.includes("accessory") || msgLower.includes("accessories")) {
        params.product_type = "Accessory";
    } else if (msgLower.includes("outfit") || msgLower.includes("suit")) {
        if (msgLower.includes("2 piece") || msgLower.includes("two piece")) {
            params.product_type = "2 Piece Outfit";
        } else {
            params.product_type = "Complete Outfit";
        }
    }

    // Budget detection
    if (msgLower.includes("under 4000") || msgLower.includes("less than 4000") || msgLower.includes("below 4000") || msgLower.includes("budget")) {
        params.budget = "budget";
    } else if (msgLower.includes("above 10000") || msgLower.includes("more than 10000") || msgLower.includes("over 10000") || msgLower.includes("premium")) {
        params.budget = "premium";
    } else {
        params.budget = "mid_range"; // Default to mid-range
    }

    console.log("Extracted parameters:", params);
    return params;
}

// Display designer recommendations
function displayDesignerRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        addMessageToChat("I couldn't find any suitable recommendations based on your preferences. Please try different criteria.", "bot");
        return;
    }

    // Display an intro message
    addMessageToChat("Here are personalized outfit recommendations for you:", "bot");

    // Clear existing product recommendations
    productRecommendations.innerHTML = '';

    // Get base URL for the main website
    const baseUrl = window.location.href.split('/chatbot')[0];

    // Extract product IDs from recommendations
    const productCodes = recommendations.map(rec => rec.product_id).filter(Boolean);

    // Create URL for the main products page
    const productsUrl = `${baseUrl}/products?codes=${productCodes.join(',')}`;

    // Add a summary of recommendations with explanations in the chat
    recommendations.forEach(rec => {
        // Add the explanation in the chat
        const explanationHtml = `
            <div class="info-section fashion-recommendation">
                <h3>Outfit Recommendation</h3>
                <div class="product-name">${rec.product_name}</div>
                <div class="recommendation-analysis">
                    <p>${rec.explanation}</p>
                </div>
                <p><strong>Price:</strong> Rs. ${rec.price}</p>
                <p><strong>Color:</strong> ${rec.color}</p>
            </div>
        `;
        addMessageToChat(explanationHtml, "bot");
    });

    // Add a container with message and button to view all on main site
    const container = document.createElement('div');
    container.className = 'products-found-container';

    // Add a message showing how many products were found
    const message = document.createElement('div');
    message.className = 'products-found-message';
    message.textContent = `${recommendations.length} personalized recommendations found!`;
    container.appendChild(message);

    // Add the "View All Products" button that opens the main website
    const viewAllButton = document.createElement('div');
    viewAllButton.className = 'view-all-products-button';
    viewAllButton.innerHTML = `
        <a href="${productsUrl}" target="_blank" class="view-all-link">
            View All ${recommendations.length} Recommendations on Main Website
        </a>
    `;
    container.appendChild(viewAllButton);

    // Add the container to the recommendations section
    productRecommendations.appendChild(container);

    // Store these recommendations for potential reuse
    window.currentChatbotProducts = recommendations.map(rec => {
        return {
            ID: rec.product_id,
            "Product Name": rec.product_name,
            "Product Description": rec.description || '',
            Price: rec.price,
            Color: rec.color,
            Sizes: "S, M, L, XL", // Default sizes
            Availability: "In Stock" // Default availability
        };
    });

    // Scroll to show the chat messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fetch available filter options from the API
async function fetchFilterOptions() {
    try {
        const response = await fetch(FILTER_OPTIONS_API_URL);
        const data = await response.json();

        if (data.success) {
            availableFilterOptions = data.filter_options;
            console.log("Fetched filter options:", availableFilterOptions);
        } else {
            console.error("Failed to fetch filter options:", data.error);
        }
    } catch (error) {
        console.error("Error fetching filter options:", error);
    }
}

// Check for special queries and return immediate responses if applicable
function getSpecialResponseIfApplicable(message) {
    const msgLower = message.toLowerCase();

    // Shipping information
    if (msgLower.includes("shipping") ||
        msgLower.includes("delivery") ||
        (msgLower.includes("how long") && msgLower.includes("deliver"))) {
        return `
            <div class="info-section">
                <h3>Shipping Information</h3>
                <ul>
                    <li><strong>Standard Shipping:</strong> ${storeInfo.shipping.standard}</li>
                    <li><strong>Express Shipping:</strong> ${storeInfo.shipping.express}</li>
                    <li><strong>International Shipping:</strong> ${storeInfo.shipping.international}</li>
                </ul>
                <p>Your order confirmation email will include tracking information once your package has shipped.</p>
            </div>
        `;
    }

    // Returns and exchanges
    if (msgLower.includes("return") ||
        msgLower.includes("exchange") ||
        msgLower.includes("refund")) {
        return `
            <div class="info-section">
                <h3>Returns & Exchanges Policy</h3>
                <p>We offer a ${storeInfo.returns.period} return period on all purchases.</p>
                <p><strong>Conditions:</strong> ${storeInfo.returns.condition}</p>
                <p><strong>Process:</strong> ${storeInfo.returns.process}</p>
                <p>For more details or assistance with returns, please contact our customer service team.</p>
            </div>
        `;
    }

    // Contact information
    if (msgLower.includes("contact") ||
        msgLower.includes("phone") ||
        msgLower.includes("email") ||
        msgLower.includes("call") ||
        msgLower.includes("number") ||
        msgLower.includes("address") ||
        msgLower.includes("location")) {
        return `
            <div class="info-section">
                <h3>Contact Information</h3>
                <div class="contact-info">
                    <p><strong>Phone:</strong> ${storeInfo.contact.phone}</p>
                    <p><strong>Email:</strong> ${storeInfo.contact.email}</p>
                    <p><strong>Address:</strong> ${storeInfo.contact.address}</p>
                    <p><strong>Customer Service Hours:</strong> Monday-Saturday, 9:00 AM - 6:00 PM (PKT)</p>
                </div>
                <p>Our customer service team is always ready to assist you!</p>
            </div>
        `;
    }

    // Size guide
    if (msgLower.includes("size") ||
        msgLower.includes("measurement") ||
        msgLower.includes("fit")) {
        return `
            <div class="info-section">
                <h3>Size Guide</h3>
                <p>Here are our general size measurements:</p>
                <ul>
                    <li>${storeInfo.sizes.small}</li>
                    <li>${storeInfo.sizes.medium}</li>
                    <li>${storeInfo.sizes.large}</li>
                    <li>${storeInfo.sizes.xlarge}</li>
                </ul>
                <p>For specific garment measurements, please check the individual product pages or contact our customer service team.</p>
            </div>
        `;
    }

    // Complaint handling
    if (msgLower.includes("complaint") ||
        msgLower.includes("issue") ||
        msgLower.includes("problem") ||
        msgLower.includes("not satisfied") ||
        msgLower.includes("unhappy")) {
        return `
            <div class="info-section">
                <h3>Customer Satisfaction</h3>
                <p>We're sorry to hear you're having an issue. Customer satisfaction is our top priority.</p>
                <p>To help resolve your concern as quickly as possible, please:</p>
                <ul>
                    <li>Call us at ${storeInfo.contact.phone}</li>
                    <li>Email us at ${storeInfo.contact.email} with your order number and details</li>
                    <li>Visit our store with your purchase receipt</li>
                </ul>
                <p>Our customer service team will be happy to assist you promptly.</p>
            </div>
        `;
    }

    // Greeting responses
    if (msgLower === "hi" ||
        msgLower === "hello" ||
        msgLower.includes("asalam") ||
        msgLower.includes("salam") ||
        msgLower === "hey") {
        return "Assalam-o-Alaikum! Welcome to Elegance clothing store. How may I assist you today? You can search for products or ask about our services.";
    }

    // Thank you responses
    if (msgLower === "thank you" ||
        msgLower === "thanks" ||
        msgLower.includes("thank")) {
        return "You're most welcome! It's my pleasure to assist you. Is there anything else I can help you with today?";
    }

    // No special query detected
    return null;
}

// Use Gemini to interpret and understand the user's query
async function interpretUserQuery(query) {
    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (cachedGeminiResponses[cacheKey]) {
        return cachedGeminiResponses[cacheKey];
    }

    const requestURL = `${API_URL}?key=${API_KEY}`;

    // Create a prompt for Gemini that asks it to interpret the user's query
    const prompt = `
You are a helpful shopping assistant for Elegance, a Pakistani women's clothing store.
Given the user's query, analyze it and extract search criteria to help find matching products.

USER QUERY: "${query}"

Instructions:
1. Determine if this is a product search query or a conversational question
2. For product searches, identify the following criteria:
   - Colors mentioned (e.g., yellow, blue, red, etc.)
   - Product types (e.g., suit, 3-piece, kurta, dress, etc.)
   - Price range if mentioned
   - Fabrics if mentioned (e.g., cotton, khaddar, lawn, silk)
   - Categories or occasions if mentioned
   - Size preferences if mentioned
3. Handle misspellings and fuzzy terms intelligently

Return a JSON response in this format:
{
  "isProductQuery": true/false,
  "response": "A friendly, culturally appropriate response to the user",
  "colors": ["array of colors mentioned or implied"],
  "productTypes": ["array of product types mentioned or implied"],
  "priceRange": {"min": number, "max": number} or null,
  "fabrics": ["array of fabrics mentioned"],
  "categories": ["array of categories or occasions"],
  "sizes": ["array of sizes mentioned"]
}

If it's not a product query, just populate the "isProductQuery" (false) and "response" fields.
`;

    try {
        const response = await fetch(requestURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Extract and parse the JSON from Gemini's response
        if (data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]) {

            const responseText = data.candidates[0].content.parts[0].text;

            // Extract the JSON part
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const result = JSON.parse(jsonMatch[0]);

                    // Cache the response
                    cachedGeminiResponses[cacheKey] = result;

                    return result;
                } catch (e) {
                    console.error("Failed to parse JSON from Gemini response:", e);
                }
            }
        }

        // Fallback response
        return {
            isProductQuery: false,
            response: "I didn't fully understand your query. Could you please rephrase it or provide more details?"
        };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            isProductQuery: false,
            response: "I'm having trouble processing your request right now. Please try again in a moment."
        };
    }
}

// Search for products based on the interpreted query
function searchProducts(interpretedQuery) {
    if (!productData || !productData.length) {
        return [];
    }

    // Filter products based on criteria from interpreted query
    return productData.filter(product => {
        // Default to true, then check each criterion
        let isMatch = true;

        // Check colors
        if (interpretedQuery.colors && interpretedQuery.colors.length > 0) {
            const productColor = (product.Color || "").toLowerCase();
            const colorMatch = interpretedQuery.colors.some(color =>
                productColor.includes(color.toLowerCase())
            );
            if (!colorMatch) isMatch = false;
        }

        // Check product types
        if (isMatch && interpretedQuery.productTypes && interpretedQuery.productTypes.length > 0) {
            const productName = (product["Product Name"] || "").toLowerCase();
            const productDesc = (product["Product Description"] || "").toLowerCase();
            const productCategory = (product["Category"] || "").toLowerCase();

            const typeMatch = interpretedQuery.productTypes.some(type =>
                productName.includes(type.toLowerCase()) ||
                productDesc.includes(type.toLowerCase()) ||
                productCategory.includes(type.toLowerCase())
            );

            if (!typeMatch) isMatch = false;
        }

        // Check price range
        if (isMatch && interpretedQuery.priceRange) {
            const price = parseInt(product.Price || "0", 10);

            if (interpretedQuery.priceRange.min && price < interpretedQuery.priceRange.min) {
                isMatch = false;
            }
            if (interpretedQuery.priceRange.max && price > interpretedQuery.priceRange.max) {
                isMatch = false;
            }
        }

        // Check fabrics
        if (isMatch && interpretedQuery.fabrics && interpretedQuery.fabrics.length > 0) {
            const productDesc = (product["Product Description"] || "").toLowerCase();

            const fabricMatch = interpretedQuery.fabrics.some(fabric =>
                productDesc.includes(fabric.toLowerCase())
            );

            if (!fabricMatch) isMatch = false;
        }

        // Check sizes if specified
        if (isMatch && interpretedQuery.sizes && interpretedQuery.sizes.length > 0) {
            const productSizes = (product.Sizes || "").toLowerCase();

            const sizeMatch = interpretedQuery.sizes.some(size =>
                productSizes.includes(size.toLowerCase())
            );

            if (!sizeMatch) isMatch = false;
        }

        return isMatch;
    });
}

// Function to load and display products from the main website API directly in the chatbot
async function loadProductsFromMainSite(productCodes) {
    try {
        // Get base URL for the main website
        const baseUrl = window.location.href.split('/chatbot')[0];

        // Show loading message in the product recommendations
        productRecommendations.innerHTML = '<div class="loading-products">Loading products from catalog...</div>';

        console.log("Loading products with codes:", productCodes);
        console.log("Current chatbot products:", window.currentChatbotProducts ? window.currentChatbotProducts.length : 0);

        // Clear the loading message
        productRecommendations.innerHTML = '';

        if (!window.currentChatbotProducts || window.currentChatbotProducts.length === 0) {
            productRecommendations.innerHTML = '<div class="no-products">No products found. Please try a different search.</div>';
            return;
        }

        // Add heading for the products
        const heading = document.createElement('div');
        heading.className = 'products-heading';
        heading.innerHTML = `
            <h3>Products from Main Catalog (${window.currentChatbotProducts.length})</h3>
            <p>Showing products from our main catalog</p>
        `;
        productRecommendations.appendChild(heading);

        // Display each product using local product data
        window.currentChatbotProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card main-catalog';

            // Format the image path correctly
            let imgPath = product["Img Path"] || '';
            if (imgPath) {
                // Ensure the path has proper directory separators
                imgPath = imgPath.replace(/\\/g, '/');
                // Add a default image for product display
                imgPath = `${baseUrl}/${imgPath}/1.jpg`;
            } else {
                imgPath = 'https://via.placeholder.com/300x400?text=No+Image';
            }

            // Create color dot style based on product color
            const colorStyle = getColorStyle(product.Color);

            // Get individual product URL based on product ID
            const productId = product.ID || '';
            const productUrl = `${baseUrl}/products/${productId}`;

            card.innerHTML = `
                <div class="product-image" style="background-image: url('${imgPath}')">
                    <div class="product-price">Rs. ${product.Price || ''}</div>
                    <div class="product-availability">${product.Availability || 'In Stock'}</div>
                </div>
                <div class="product-details">
                    <div class="product-id">ID: ${productId}</div>
                    <div class="product-name">${product["Product Name"] || ''}</div>
                    <div class="product-description">${product["Product Description"] || ''}</div>
                    <div class="product-metadata">
                        <div class="product-color">
                            <span class="color-dot" style="background-color: ${colorStyle};"></span>
                            ${product.Color || ''}
                        </div>
                        <div class="sizes">${product.Sizes || ''}</div>
                    </div>
                </div>
                <a href="${productUrl}" target="_blank" class="product-link">View Product Details</a>
            `;

            productRecommendations.appendChild(card);
        });

        // Add a return to chatbot results button
        const returnButton = document.createElement('div');
        returnButton.className = 'return-to-chat-button';
        returnButton.innerHTML = `
            <button class="return-button">Return to Chatbot Results</button>
        `;
        productRecommendations.appendChild(returnButton);

        // Add listener to the return button
        document.querySelector('.return-button').addEventListener('click', () => {
            // Re-display the original search results
            displayProducts(window.currentChatbotProducts);
        });

        // Scroll to the top of recommendations
        productRecommendations.scrollTop = 0;

    } catch (error) {
        console.error('Error loading products from main site:', error);
        productRecommendations.innerHTML = `
            <div class="error-message">
                Error loading products: ${error.message}
                <div class="error-details">
                    Using local products data instead.
                </div>
            </div>
        `;

        // Display products directly using the saved current products
        setTimeout(() => {
            if (window.currentChatbotProducts && window.currentChatbotProducts.length > 0) {
                // Skip the API call entirely and just display what we have
                loadProductsDirectly(window.currentChatbotProducts);
            }
        }, 500);
    }
}

// Helper function to display products directly without API call
function loadProductsDirectly(products) {
    // Get base URL for the main website
    const baseUrl = window.location.href.split('/chatbot')[0];

    // Clear existing content
    productRecommendations.innerHTML = '';

    // Add heading
    const heading = document.createElement('div');
    heading.className = 'products-heading';
    heading.innerHTML = `
        <h3>Products from Catalog (${products.length})</h3>
        <p>Showing available products</p>
    `;
    productRecommendations.appendChild(heading);

    // Display each product
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card main-catalog';

        // Format the image path correctly
        let imgPath = product["Img Path"] || '';
        if (imgPath) {
            // Ensure the path has proper directory separators
            imgPath = imgPath.replace(/\\/g, '/');
            // Add a default image for product display
            imgPath = `${baseUrl}/${imgPath}/1.jpg`;
        } else {
            imgPath = 'https://via.placeholder.com/300x400?text=No+Image';
        }

        const colorStyle = getColorStyle(product.Color);
        const productId = product.ID || '';
        const productUrl = `${baseUrl}/products/${productId}`;

        card.innerHTML = `
            <div class="product-image" style="background-image: url('${imgPath}')">
                <div class="product-price">Rs. ${product.Price || ''}</div>
                <div class="product-availability">${product.Availability || 'In Stock'}</div>
            </div>
            <div class="product-details">
                <div class="product-id">ID: ${productId}</div>
                <div class="product-name">${product["Product Name"] || ''}</div>
                <div class="product-description">${product["Product Description"] || ''}</div>
                <div class="product-metadata">
                    <div class="product-color">
                        <span class="color-dot" style="background-color: ${colorStyle};"></span>
                        ${product.Color || ''}
                    </div>
                    <div class="sizes">${product.Sizes || ''}</div>
                </div>
            </div>
            <a href="${productUrl}" target="_blank" class="product-link">View in Main Store</a>
        `;

        productRecommendations.appendChild(card);
    });

    // Add return button
    const returnButton = document.createElement('div');
    returnButton.className = 'return-to-chat-button';
    returnButton.innerHTML = `
        <button class="return-button">Return to Chatbot Results</button>
    `;
    productRecommendations.appendChild(returnButton);

    // Add listener to the return button
    document.querySelector('.return-button').addEventListener('click', () => {
        displayProducts(window.currentChatbotProducts);
    });
}

// Display products in the recommendations section
function displayProducts(products) {
    // Clear existing products
    productRecommendations.innerHTML = '';

    if (!products || products.length === 0) {
        productRecommendations.innerHTML = '<div class="no-products">No matching products found. Try a different search!</div>';
        return;
    }

    // Store current products for later reference
    window.currentChatbotProducts = products;

    // Get base URL for the main website
    const baseUrl = window.location.href.split('/chatbot')[0];

    // Extract product IDs for the codes parameter
    const productCodes = products.map(product => product.ID).filter(Boolean);
    const codesParam = productCodes.join(',');

    // Create URL for the main products page
    const productsUrl = `${baseUrl}/products?codes=${codesParam}`;

    // Add a container with message and button
    const container = document.createElement('div');
    container.className = 'products-found-container';

    // Add a message showing how many products were found
    const message = document.createElement('div');
    message.className = 'products-found-message';
    message.textContent = `${products.length} matching products found!`;
    container.appendChild(message);

    // Add the "View All Products" button that opens the main website
    const viewAllButton = document.createElement('div');
    viewAllButton.className = 'view-all-products-button';
    viewAllButton.innerHTML = `
        <a href="${productsUrl}" target="_blank" class="view-all-link">
            View All ${products.length} Matching Products on Main Website
        </a>
    `;
    container.appendChild(viewAllButton);

    // Add the container to the recommendations section
    productRecommendations.appendChild(container);
}

// Get CSS color from color name
function getColorStyle(colorName) {
    // Handle basic and custom colors
    const colorMap = {
        'RED': '#e74c3c',
        'BLUE': '#3498db',
        'GREEN': '#2ecc71',
        'YELLOW': '#f1c40f',
        'ORANGE': '#e67e22',
        'PURPLE': '#9b59b6',
        'PINK': '#e84393',
        'WHITE': '#ecf0f1',
        'BLACK': '#2c3e50',
        'GREY': '#95a5a6',
        'BROWN': '#795548',
        'NAVY': '#34495e',
        'TEAL': '#1abc9c',
        'OLIVE': '#badc58',
        'MAROON': '#c0392b',
        'BEIGE': '#f5eacb',
        'RUST': '#b7410e',
        'MUSTARD': '#f9ca24',
        'CORAL': '#FF7F50',
        'OFF-WHITE': '#f8f9fa',
        'LILAC': '#B39EB5',
        'D-GREEN': '#1e5631',
        'D-PINK': '#FF1493',
        'L-GREEN': '#90EE90',
        'L-PINK': '#FFB6C1',
        'L-YELLOW': '#FFFACD',
        'MULTI': 'linear-gradient(to right, #3498db, #9b59b6, #e74c3c, #f1c40f)'
    };

    // Return the mapped color or a default if not found
    return colorMap[colorName?.toUpperCase()] || '#777777';
}

// Add a message to the chat
function addMessageToChat(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);

    const icon = sender === "user" ? "user" : "robot";
    const iconClass = sender === "user" ? "user-icon" : "bot-icon";

    messageElement.innerHTML = `
        <div class="message-content">
            <i class="fas fa-${icon} ${iconClass}"></i>
            <div class="text">${message}</div>
        </div>
    `;

    chatMessages.appendChild(messageElement);

    // If we're adding a message with designer options, attach event listeners directly
    if (sender === "bot" && message.includes("designer-option-btn")) {
        // Wait for DOM to update
        setTimeout(() => {
            // Get the buttons that were just added
            const newButtons = messageElement.querySelectorAll('.designer-option-btn');

            // Add event listeners based on which step we're on
            newButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const value = this.getAttribute('data-value');

                    // Call appropriate function based on current step
                    if (currentDesignerStep === 'skin_tone') {
                        selectSkinTone(value);
                    } else if (currentDesignerStep === 'season') {
                        selectSeason(value);
                    } else if (currentDesignerStep === 'event_type') {
                        selectEvent(value);
                    } else if (currentDesignerStep === 'budget') {
                        selectBudget(value);
                    } else if (this.id === 'designer-start-over-btn') {
                        startDesignerSteps();
                    }
                });
            });
        }, 100);
    }

    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const typingElement = document.createElement("div");
    typingElement.classList.add("message", "bot-message");
    typingElement.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingElement);
    scrollToBottom();
    return typingElement;
}

// Scroll to bottom of chat messages
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Set up special mode buttons
function setupSpecialModeButtons() {
    const contactBtn = document.getElementById('contact-btn');
    const returnsBtn = document.getElementById('returns-btn');
    const designerBtn = document.getElementById('designer-btn');
    const lensBtn = document.getElementById('lens-btn');

    // Contact button
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            activateContactMode();
        });
    }

    // Returns button
    if (returnsBtn) {
        returnsBtn.addEventListener('click', () => {
            activateReturnsMode();
        });
    }

    // Designer button
    if (designerBtn) {
        designerBtn.addEventListener('click', () => {
            toggleDesignerMode();
        });
    }

    // Lens button
    if (lensBtn) {
        lensBtn.addEventListener('click', () => {
            navigateToLensPage();
        });
    }
}

// Navigate to lens page
function navigateToLensPage() {
    // Get the base URL 
    const baseUrl = window.location.origin;
    const lensUrl = `${baseUrl}/lens`;

    console.log("Navigating to lens page:", lensUrl);

    try {
        // If we're in an iframe, try to navigate the parent window
        if (window !== window.parent) {
            console.log("Chatbot is in iframe, trying to navigate parent");
            window.parent.location.href = lensUrl;
        } else {
            // Direct navigation
            window.location.href = lensUrl;
        }
    } catch (e) {
        console.error("Failed to navigate:", e);
        // Fallback - open in new tab if cross-origin issues prevent navigation
        window.open(lensUrl, '_blank');
    }
}

// Activate Contact Mode
function activateContactMode() {
    // Show contact information directly in chat
    const contactInfo = `
        <div class="info-section">
            <h3>Contact Information</h3>
            <div class="contact-info">
                <p><strong>Phone:</strong> ${storeInfo.contact.phone}</p>
                <p><strong>Email:</strong> ${storeInfo.contact.email}</p>
                <p><strong>Address:</strong> ${storeInfo.contact.address}</p>
                <p><strong>Customer Service Hours:</strong> Monday-Saturday, 9:00 AM - 6:00 PM (PKT)</p>
            </div>
            <p>Our customer service team is always ready to assist you!</p>
        </div>
    `;

    // Display contact info in chat
    addMessageToChat(contactInfo, "bot");

    // Highlight the active button
    highlightActiveButton('contact-btn');

    // Auto-scroll to show the information
    scrollToBottom();
}

// Activate Returns Mode
function activateReturnsMode() {
    // Show returns policy information directly in chat
    const returnsInfo = `
        <div class="info-section">
            <h3>Returns & Exchanges Policy</h3>
            <p>We offer a ${storeInfo.returns.period} return period on all purchases.</p>
            <p><strong>Conditions:</strong> ${storeInfo.returns.condition}</p>
            <p><strong>Process:</strong> ${storeInfo.returns.process}</p>
            <p>For more details or assistance with returns, please contact our customer service team.</p>
        </div>
    `;

    // Display returns info in chat
    addMessageToChat(returnsInfo, "bot");

    // Highlight the active button
    highlightActiveButton('returns-btn');

    // Auto-scroll to show the information
    scrollToBottom();
}

// Toggle Designer Mode
function toggleDesignerMode() {
    // Toggle the mode state
    designerModeActive = !designerModeActive;

    if (designerModeActive) {
        // Activate Designer Mode
        currentMode = "designer";
        activateDesignerMode();
    } else {
        // Deactivate Designer Mode
        currentMode = "default";
        deactivateDesignerMode();
    }
}

// Activate Designer Mode
function activateDesignerMode() {
    // Reset preferences
    designerPreferences = {
        skin_tone: null,
        event_type: null,
        product_type: null,
        budget: null
    };

    // Show welcome message for Designer mode
    addMessageToChat(`
        <div class="info-section fashion-recommendation">
            <h3>Designer Mode Activated</h3>
            <p>Welcome to AI Fashion Designer mode! I'll help you find the perfect outfit based on your preferences.</p>
            <p>Let's start by selecting your options:</p>
        </div>
    `, "bot");

    // Change UI elements
    userInput.placeholder = "Use the options below to make your selections...";
    highlightActiveButton('designer-btn');

    // Clear product recommendations
    productRecommendations.innerHTML = '';

    // Fetch available filter options if not already loaded
    if (Object.keys(availableFilterOptions).length === 0) {
        fetchFilterOptions().then(() => {
            // Start the step-by-step process after fetching options
            setTimeout(() => {
                showSkinToneOptions();
            }, 500);
        });
    } else {
        // If options already loaded, proceed directly
        setTimeout(() => {
            showSkinToneOptions();
        }, 500);
    }
}

// Start the Designer mode step-by-step selection process
function startDesignerSteps() {
    currentDesignerStep = 'skin_tone';
    showSkinToneOptions();
}

// Show skin tone selection options
function showSkinToneOptions() {
    currentDesignerStep = 'skin_tone';

    // Create designer question container
    const questionContainer = document.createElement('div');
    questionContainer.className = 'message bot-message';
    questionContainer.innerHTML = `
        <div class="message-content">
            <i class="fas fa-robot bot-icon"></i>
            <div class="text">
                <div class="designer-question">
                    <h4>What is your skin tone?</h4>
                    <div class="designer-options" id="skin-tone-options">
                        <!-- Options will be added here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add to chat
    chatMessages.appendChild(questionContainer);
    scrollToBottom();

    // Create and add option buttons
    const optionsContainer = questionContainer.querySelector('#skin-tone-options');

    // Use available options from API if available, otherwise use defaults
    const options = availableFilterOptions.skin_tone || [
        { value: "Light/Fair", label: "Fair" },
        { value: "Medium/Olive", label: "Medium" },
        { value: "Deep/Dark", label: "Dark" }
    ];

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'designer-option-btn';
        button.textContent = typeof option === 'string' ? option : option.label;
        button.setAttribute('data-value', typeof option === 'string' ? option : option.value);


        // Add event listener
        button.addEventListener('click', function () {
            selectSkinTone(this.getAttribute('data-value'));
        });

        optionsContainer.appendChild(button);
    });


    // Add skip button
    const skipButton = document.createElement('button');
    skipButton.className = 'designer-option-btn skip-btn';
    skipButton.textContent = "Skip";
    skipButton.addEventListener('click', function () {
        // Skip this selection
        designerPreferences.skin_tone = null;
        addMessageToChat("You skipped the skin tone selection.", "user");

        // Move to next step
        setTimeout(() => {
            showProductTypeOptions();
        }, 300);
    });
    optionsContainer.appendChild(skipButton);
}

// Show event type selection options
function showEventOptions() {
    currentDesignerStep = 'event_type';

    // Create designer question container
    const questionContainer = document.createElement('div');
    questionContainer.className = 'message bot-message';
    questionContainer.innerHTML = `
        <div class="message-content">
            <i class="fas fa-robot bot-icon"></i>
            <div class="text">
                <div class="designer-question">
                    <h4>What type of event are you shopping for?</h4>
                    <div class="designer-options" id="event-options">
                        <!-- Options will be added here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add to chat
    chatMessages.appendChild(questionContainer);
    scrollToBottom();

    // Create and add option buttons
    const optionsContainer = questionContainer.querySelector('#event-options');

    // Use available options from API if available, otherwise use defaults
    const options = availableFilterOptions.occasion || [
        "Wedding", "Casual", "Formal"
    ];

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'designer-option-btn';
        button.textContent = option;
        button.setAttribute('data-value', option);
        // Add event listener
        button.addEventListener('click', function () {
            selectEvent(option);
        });

        optionsContainer.appendChild(button);
    });

    // Add skip button
    const skipButton = document.createElement('button');
    skipButton.className = 'designer-option-btn skip-btn';
    skipButton.textContent = "Skip";
    skipButton.addEventListener('click', function () {
        // Skip this selection
        designerPreferences.event_type = null;
        addMessageToChat("You skipped the event type selection.", "user");

        // Move to next step
        setTimeout(() => {
            showBudgetOptions();
        }, 300);
    });
    optionsContainer.appendChild(skipButton);
}

// Show product type options
function showProductTypeOptions() {
    currentDesignerStep = 'product_type';

    // Create designer question container
    const questionContainer = document.createElement('div');
    questionContainer.className = 'message bot-message';
    questionContainer.innerHTML = `
        <div class="message-content">
            <i class="fas fa-robot bot-icon"></i>
            <div class="text">
                <div class="designer-question">
                    <h4>What type of product are you looking for?</h4>
                    <div class="designer-options" id="product-type-options">
                        <!-- Options will be added here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add to chat
    chatMessages.appendChild(questionContainer);
    scrollToBottom();

    // Create and add option buttons
    const optionsContainer = questionContainer.querySelector('#product-type-options');

    // Use available options from API if available, otherwise use defaults
    const options = availableFilterOptions.product_type || [
        "Top", "Bottom", "Accessory", "2 Piece Outfit", "Complete Outfit"
    ];

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'designer-option-btn';
        button.textContent = option;
        button.setAttribute('data-value', option);

        // Add event listener
        button.addEventListener('click', function () {
            selectProductType(option);
        });

        optionsContainer.appendChild(button);
    });


    // Add skip button
    const skipButton = document.createElement('button');
    skipButton.className = 'designer-option-btn skip-btn';
    skipButton.textContent = "Skip";
    skipButton.addEventListener('click', function () {
        // Skip this selection
        designerPreferences.product_type = null;
        addMessageToChat("You skipped the product type selection.", "user");

        // Move to next step
        setTimeout(() => {
            showEventOptions();
        }, 300);
    });
    optionsContainer.appendChild(skipButton);
}

// Handler for product type selection
function selectProductType(value) {
    designerPreferences.product_type = value;
    addMessageToChat(`You selected: <strong>${value}</strong> product type`, "user");

    // Move to next step
    setTimeout(() => {
        showBudgetOptions();
    }, 300);
}


// Show budget selection options
function showBudgetOptions() {
    currentDesignerStep = 'budget';

    // Create designer question container
    const questionContainer = document.createElement('div');
    questionContainer.className = 'message bot-message';
    questionContainer.innerHTML = `
        <div class="message-content">
            <i class="fas fa-robot bot-icon"></i>
            <div class="text">
                <div class="designer-question">
                    <h4>What is your budget range?</h4>
                    <div class="designer-options" id="budget-options">
                        <!-- Options will be added here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add to chat
    chatMessages.appendChild(questionContainer);
    scrollToBottom();

    // Create and add option buttons
    const optionsContainer = questionContainer.querySelector('#budget-options');

    const options = [
        { value: "budget", label: "Under 4000" },
        { value: "mid_range", label: "4000-10000" },
        { value: "premium", label: "Above 10000" }
    ];

    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'designer-option-btn';
        button.textContent = option.label;
        button.setAttribute('data-value', option.value);

        // Add event listener
        button.addEventListener('click', function () {
            selectBudget(option.value, option.label);
        });

        optionsContainer.appendChild(button);
    });
}

// Handler for skin tone selection
function selectSkinTone(value) {
    designerPreferences.skin_tone = value;
    addMessageToChat(`You selected: <strong>${value}</strong> skin tone`, "user");

    // Move to next step
    setTimeout(() => {
        showProductTypeOptions();
    }, 300);
}

// Handler for season selection


// Handler for event selection
function selectEvent(value) {
    designerPreferences.event_type = value;
    addMessageToChat(`You selected: <strong>${value}</strong> event`, "user");

    // Move to next step
    setTimeout(() => {
        showBudgetOptions();
    }, 300);
}

// Handler for budget selection
function selectBudget(value, label) {
    designerPreferences.budget = value;
    addMessageToChat(`You selected budget: <strong>${label}</strong>`, "user");

    // All selections complete, show summary
    setTimeout(() => {
        showPreferenceSummary(label);
    }, 300);
}

// Show summary of preferences and get recommendations
function showPreferenceSummary(budgetLabel) {
    const summaryHtml = `
        <div class="designer-question preference-summary">
            <h4>Your Preferences Summary:</h4>
            <div class="preference-list">
                <div class="preference-item"><span class="preference-label">Skin Tone:</span> ${designerPreferences.skin_tone || 'Not specified'}</div>
                <div class="preference-item"><span class="preference-label">Event:</span> ${designerPreferences.event_type || 'Not specified'}</div>
                <div class="preference-item"><span class="preference-label">Product Type:</span> ${designerPreferences.product_type || 'Not specified'}</div>
                <div class="preference-item"><span class="preference-label">Budget:</span> ${budgetLabel || designerPreferences.budget}</div>
            </div>
            <p>Finding perfect outfits for you...</p>
        </div>
    `;

    addMessageToChat(summaryHtml, "bot");

    // Reset step tracker
    currentDesignerStep = null;

    // Get recommendations based on preferences
    getDesignerRecommendations();
}

// Get recommendations based on selected preferences
async function getDesignerRecommendations() {
    try {
        // Show processing message
        addMessageToChat("Processing your outfit recommendation request...", "bot");

        // Call the Flask API
        const response = await fetch(RECOMMENDATION_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(designerPreferences)
        });

        const data = await response.json();

        if (data.success) {
            // Display recommendations
            // Store all recommendations
            cachedRecommendations = data.recommendations;
            currentRecommendationIndex = 0;

            // Display the first set of recommendations
            displayDesignerRecommendations(cachedRecommendations.slice(0, 3));

            // Add a "start over" button and "show more" button

            // Add a "start over" button
            addMessageToChat(`
                <div class="designer-question">
                    <h4>What would you like to do next?</h4>
                    <div class="designer-options">
                        <button id="show-more-recommendations-btn" class="designer-option-btn">Show More Recommendations</button>
                        <button id="designer-start-over-btn" class="designer-option-btn">Start Over</button>
                    </div>
                </div>
            `, "bot");

            // Add event listener to start over button
            document.getElementById('designer-start-over-btn').addEventListener('click', startDesignerSteps);
            document.getElementById('show-more-recommendations-btn').addEventListener('click', showMoreRecommendations);

        } else {
            // Display error message
            addMessageToChat(`I'm sorry, I couldn't get recommendations at the moment. ${data.error || 'Please try again later.'}`, "bot");
        }
    } catch (error) {
        console.error("Error in designer mode:", error);
        addMessageToChat("I'm having trouble connecting to the recommendation service. Please make sure the server is running and try again.", "bot");
    }
}

// Function to show more recommendations
function showMoreRecommendations() {
    // Increment the index to show the next set of recommendations
    currentRecommendationIndex += 3;

    // Check if there are more recommendations to show
    if (currentRecommendationIndex < cachedRecommendations.length) {
        // Display the next set of recommendations
        displayDesignerRecommendations(cachedRecommendations.slice(currentRecommendationIndex, currentRecommendationIndex + 3));

        // Add a "start over" button and "show more" button
        addMessageToChat(`
            <div class="designer-question">
                <h4>What would you like to do next?</h4>
                <div class="designer-options">
                    <button id="show-more-recommendations-btn" class="designer-option-btn">Show More Recommendations</button>
                    <button id="designer-start-over-btn" class="designer-option-btn">Start Over</button>
                </div>
            </div>
        `, "bot");

        // Add event listeners to buttons
        document.getElementById('designer-start-over-btn').addEventListener('click', startDesignerSteps);
        document.getElementById('show-more-recommendations-btn').addEventListener('click', showMoreRecommendations);
    } else {
        // No more recommendations to show
        addMessageToChat("No more recommendations available. Please start over to get new recommendations.", "bot");
    }
}

// Function to get more recommendations with the same preferences
async function getMoreRecommendations() {
    try {
        // Show processing message
        addMessageToChat("Finding more outfit recommendations for you...", "bot");

        // Add a refresh parameter to avoid getting the same results
        // Also request additional recommendations
        const requestParams = {
            ...designerPreferences,
            refresh: Math.random(), // Add random value to force new recommendations
            top_n: 3, // Request 3 recommendations
            exclude_previous: true // Flag to exclude previously recommended items
        };

        // Call the Flask API
        const response = await fetch(RECOMMENDATION_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestParams)
        });

        const data = await response.json();

        if (data.success && data.recommendations && data.recommendations.length > 0) {
            // Display additional recommendations (append, don't replace)
            appendDesignerRecommendations(data.recommendations);

            // Add buttons again
            addMessageToChat(`
                <div class="designer-question">
                    <h4>What would you like to do next?</h4>
                    <div class="designer-options">
                        <button id="show-more-recommendations-btn" class="designer-option-btn">Show More Recommendations</button>
                        <button id="designer-start-over-btn" class="designer-option-btn">Start Over</button>
                    </div>
                </div>
            `, "bot");

            // Add event listeners to buttons
            document.getElementById('designer-start-over-btn').addEventListener('click', startDesignerSteps);
            document.getElementById('show-more-recommendations-btn').addEventListener('click', getMoreRecommendations);
        } else {
            // Display error message
            addMessageToChat(`I'm sorry, I couldn't find additional recommendations. ${data.error || 'Please try different preferences.'}`, "bot");
        }
    } catch (error) {
        console.error("Error getting more recommendations:", error);
        addMessageToChat("I'm having trouble connecting to the recommendation service. Please make sure the server is running and try again.", "bot");
    }
}

// Function to append additional recommendations without clearing the existing ones
function appendDesignerRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        addMessageToChat("I couldn't find any additional recommendations based on your preferences.", "bot");
        return;
    }

    // Display an intro message
    addMessageToChat("Here are more outfit recommendations for you:", "bot");

    // Display each recommendation with explanation
    recommendations.forEach(rec => {
        // First add the explanation in the chat
        const explanationHtml = `
            <div class="info-section fashion-recommendation">
                <h3>Additional Outfit Recommendation</h3>
                <div class="product-name">${rec.product_name}</div>
                <div class="recommendation-analysis">
                    <p>${rec.explanation}</p>
                </div>
                <p><strong>Price:</strong> Rs. ${rec.price}</p>
                <p><strong>Color:</strong> ${rec.color}</p>
            </div>
        `;

        addMessageToChat(explanationHtml, "bot");

        // Then add the product card in the recommendations area (without clearing previous ones)
        const baseUrl = window.location.href.split('/chatbot')[0];
        let imgPath = `${baseUrl}/images/${rec.product_id}/1.jpg`;
        const colorStyle = getColorStyle(rec.color);

        const card = document.createElement('div');
        card.className = 'product-card';

        // Find availability info from product data if possible
        let availability = "In Stock";
        let sizes = "S, M, L, XL";

        // Try to find this product in the productData array to get more details
        const matchingProduct = productData.find(p =>
            p.ID === rec.product_id ||
            p["Product Name"] === rec.product_name
        );

        if (matchingProduct) {
            availability = matchingProduct.Availability || availability;
            sizes = matchingProduct.Sizes || sizes;
        }

        card.innerHTML = `
            <div class="product-image" style="background-image: url('${imgPath}')">
                <div class="product-price">Rs. ${rec.price}</div>
                <div class="product-availability">${availability}</div>
            </div>
            <div class="product-details">
                <div class="product-id">ID: ${rec.product_id || ''}</div>
                <div class="product-name">${rec.product_name}</div>
                <div class="product-description">${rec.description}</div>
                <div class="product-metadata">
                    <div class="product-color">
                        <span class="color-dot" style="background-color: ${colorStyle};"></span>
                        ${rec.color}
                    </div>
                    <div class="sizes">${sizes}</div>
                </div>
            </div>
            <a href="#" class="product-link">View Details</a>
        `;

        productRecommendations.appendChild(card);
    });

    // Scroll to show both the chat and recommendations
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Deactivate Designer Mode
function deactivateDesignerMode() {
    // Notify user that designer mode is deactivated
    addMessageToChat("Designer Mode has been deactivated. You can now continue with regular product searches.", "bot");

    // Reset UI elements
    userInput.placeholder = "Search for products or ask questions...";
    document.getElementById('designer-btn').classList.remove('active-mode');

    // Reset designer variables
    currentDesignerStep = null;
    designerPreferences = {
        skin_tone: null,
        event_type: null,
        product_type: null,
        budget: null
    };
}

// Helper function to highlight the active mode button
function highlightActiveButton(activeButtonId) {
    // Reset all buttons (both special-mode and suggestion buttons)
    document.querySelectorAll('.special-mode-btn, .suggestion-btn').forEach(btn => {
        btn.classList.remove('active-mode');
    });

    // Determine if the activeButtonId is an ID or a text content (for shipping button)
    if (activeButtonId === 'shipping') {
        // Find the "Shipping Info" button by its text content
        const shippingBtn = Array.from(document.querySelectorAll('.suggestion-btn')).find(
            btn => btn.textContent.trim() === "Shipping Info"
        );

        if (shippingBtn) {
            shippingBtn.classList.add('active-mode');
        }
    } else {
        // Highlight active button by ID
        const activeButton = document.getElementById(activeButtonId);
        if (activeButton) {
            activeButton.classList.add('active-mode');
        }
    }
}

// Activate Shipping Mode
function activateShippingMode() {
    // Show shipping information directly in chat
    const shippingInfo = `
        <div class="info-section">
            <h3>Shipping Information</h3>
            <ul>
                <li><strong>Standard Shipping:</strong> ${storeInfo.shipping.standard}</li>
                <li><strong>Express Shipping:</strong> ${storeInfo.shipping.express}</li>
                <li><strong>International Shipping:</strong> ${storeInfo.shipping.international}</li>
            </ul>
            <p>Your order confirmation email will include tracking information once your package has shipped.</p>
        </div>
    `;

    // Display shipping info in chat
    addMessageToChat(shippingInfo, "bot");

    // Highlight the shipping button using our centralized function
    highlightActiveButton('shipping');

    // Auto-scroll to show the information
    scrollToBottom();
}

// Setup lens input button
function setupLensInputButton() {
    const lensInputBtn = document.getElementById('lens-input-btn');

    if (lensInputBtn) {
        lensInputBtn.addEventListener('click', () => {
            navigateToLensPage();
        });
    }
}
