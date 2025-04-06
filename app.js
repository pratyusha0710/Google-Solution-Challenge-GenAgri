const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar_menu');
const navLogo=document.querySelector('#navbar_logo')

const mobileMenu=()=>{
	menu.classList.toggle('is-active');
	menuLinks.classList.toggle('active');

};
menu.addEventListener('click',mobileMenu);

const highlightMenu = () => {
    const homeMenu = document.querySelector('#home-page');
    const servicesMenu = document.querySelector('#service-page');
    const latestMenu = document.querySelector('#latest-page');
    let scrollPos = window.scrollY;

    // Remove all highlights first
    homeMenu.classList.remove('highlight');
    servicesMenu.classList.remove('highlight');
    latestMenu.classList.remove('highlight');

    // Add highlight based on scroll position
    if (window.innerWidth > 960) {
        if (scrollPos < 600) {
            homeMenu.classList.add('highlight');
        } else if (scrollPos >= 600 && scrollPos < 1400) {
            servicesMenu.classList.add('highlight');
        } else if (scrollPos >= 1400) {
            latestMenu.classList.add('highlight');
        }
    }
};

window.addEventListener('scroll', highlightMenu);
// Remove the click event listener as it's not needed
// window.addEventListener('click', highlightMenu);

const hideMobile=()=>{
	const menuBars=document.querySelector('.is-active')
	if(window.innerWidth<=768 && menuBars){
		menu.classList.toggle('is-active')
		menuLinks.classList.remove('active')
	}
}

menuLinks.addEventListener('click',hideMobile);
navLogo.addEventListener('click',hideMobile);

// Image Upload Functionality
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const cameraBtn = document.getElementById('cameraBtn');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

// Handle file selection
fileInput.addEventListener('change', handleFiles, false);

// Camera functionality
cameraBtn.addEventListener('click', openCamera, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
}

function handleFiles(e) {
    const files = e.target.files;
    if (files.length) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                analyzeBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }
}

// Camera Functions
function openCamera() {
    const modal = document.createElement('div');
    modal.className = 'camera-modal';
    modal.innerHTML = `
        <span class="close-camera">&times;</span>
        <div class="camera-container">
            <video id="cameraFeed" autoplay playsinline></video>
            <div class="camera-controls">
                <button class="capture-btn"><i class="fas fa-camera"></i></button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    const video = modal.querySelector('#cameraFeed');
    const closeBtn = modal.querySelector('.close-camera');
    const captureBtn = modal.querySelector('.capture-btn');

    closeBtn.addEventListener('click', () => {
        stopCameraStream();
        modal.remove();
    });

    captureBtn.addEventListener('click', () => {
        capturePhoto(video);
        stopCameraStream();
        modal.remove();
    });

    // Start camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => {
                console.error("Error accessing camera: ", err);
                alert("Could not access the camera. Please check permissions.");
            });
    }
}

function stopCameraStream() {
    const video = document.querySelector('#cameraFeed');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
}

function capturePhoto(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/png');
    imagePreview.innerHTML = `<img src="${imageDataUrl}" alt="Captured Photo">`;
    analyzeBtn.disabled = false;
}


function handleFiles(e) {
    const files = e.target.files;
    if (files.length) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Display image
                console.log
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                analyzeBtn.disabled = false;
                
                // When you're ready to integrate with your model:
                // analyzeImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
}

// Replace the analyzeImage function with this:
async function analyzeImage(imageData) {
    const resultsOutput = document.getElementById('resultsOutput');
    resultsOutput.innerHTML = '<p>Analyzing image...</p>';
    
    try {
        // Create FormData object to send the file
        const formData = new FormData();
        const fileInput = document.getElementById('fileInput');
        
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        } else {
            // Handle case where image came from camera
            const img = document.querySelector('#imagePreview img');
            if (img) {
                const blob = await fetch(img.src).then(r => r.blob());
                formData.append('file', blob, 'captured.jpg');
            }
        }

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const results = await response.json();
        
        if (results.status === 'success') {
            // Display results
            resultsOutput.innerHTML = `
                <h4>Analysis Results:</h4>
                <p><strong>Health Status:</strong> ${results.results.health_status}</p>
                <p><strong>Disease Detected:</strong> ${results.results.disease_detected}</p>
                <p><strong>Confidence:</strong> ${results.results.confidence}</p>
                <p><strong>Recommendations:</strong> ${results.results.recommendations}</p>
            `;
            
            // Update the uploaded image display
            document.querySelector('.uploaded-image #imagePreview').innerHTML = 
                `<img src="${results.image_url}" alt="Uploaded Crop">`;
        } else {
            resultsOutput.innerHTML = '<p>Error analyzing image. Please try again.</p>';
        }
    } catch (error) {
        resultsOutput.innerHTML = '<p>Error analyzing image. Please try again.</p>';
        console.error('Analysis error:', error);
    }
}

// Connect the Analyze button
document.getElementById('analyzeBtn').addEventListener('click', function() {
    const img = document.querySelector('#imagePreview img');
    if (img) {
        analyzeImage(img.src);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Soil Analysis Button
    document.getElementById('analyzeSoilBtn')?.addEventListener('click', function() {
        const nitrogen = document.getElementById('nitrogen').value;
        const phosphorous = document.getElementById('phosphorous').value;
        const potassium = document.getElementById('potassium').value;
        const ph = document.getElementById('ph').value;
        const rainfall = document.getElementById('rainfall').value;
        const soilType = document.getElementById('soil-type').value;
        
        // Validate inputs
        if (!nitrogen || !phosphorous || !potassium || !ph || !rainfall || !soilType) {
            alert('Please fill all fields');
            return;
        }
        
        analyzeSoil(nitrogen, phosphorous, potassium, ph, rainfall, soilType);
    });
});

function analyzeSoil(n, p, k, ph, rainfall, soilType) {
    const resultsDiv = document.getElementById('soilResults');
    
    // Simple analysis logic - in a real app, this would come from your backend/AI
    let recommendations = [];
    let optimalCrops = [];
    
    // Nitrogen analysis
    if (n < 50) recommendations.push("Your soil is low in nitrogen. Consider adding nitrogen-rich fertilizers like urea or ammonium nitrate.");
    else if (n > 200) recommendations.push("Your soil has excessive nitrogen. Reduce nitrogen fertilizers to prevent overgrowth and lodging.");
    else recommendations.push("Nitrogen levels are optimal for most crops.");
    
    // Phosphorous analysis
    if (p < 30) recommendations.push("Phosphorous levels are low. Add phosphatic fertilizers like DAP or SSP to improve root development.");
    else if (p > 100) recommendations.push("Phosphorous levels are high. Avoid adding more phosphorous as it can inhibit micronutrient uptake.");
    else recommendations.push("Phosphorous levels are in the ideal range for plant growth.");
    
    // Potassium analysis
    if (k < 100) recommendations.push("Potassium levels are low. Add potash fertilizers to improve disease resistance and fruit quality.");
    else if (k > 300) recommendations.push("Potassium levels are very high. No additional potassium needed this season.");
    else recommendations.push("Potassium levels are sufficient for healthy plant growth.");
    
    // pH analysis
    if (ph < 6) recommendations.push(`Soil is acidic (pH ${ph}). Consider adding lime to raise pH for better nutrient availability.`);
    else if (ph > 7.5) recommendations.push(`Soil is alkaline (pH ${ph}). Sulfur or organic matter can help lower pH.`);
    else recommendations.push(`Soil pH (${ph}) is in the optimal range for most crops.`);
    
    // Generate crop recommendations based on conditions
    if (soilType === 'loamy' && ph >= 6 && ph <= 7 && rainfall > 500) {
        optimalCrops = ["Wheat", "Maize", "Soybeans", "Cotton"];
    } else if (soilType === 'black' && rainfall > 600) {
        optimalCrops = ["Sugarcane", "Cotton", "Soybeans"];
    } else if (soilType === 'sandy' && rainfall < 500) {
        optimalCrops = ["Millet", "Groundnuts", "Watermelon"];
    } else {
        optimalCrops = ["Consult local agricultural expert for best crop choices"];
    }
    
    // Generate results HTML
    let html = `
        <div class="soil-metrics">
            <h4>Soil Metrics</h4>
            <p><strong>Nitrogen:</strong> ${n} mg/kg</p>
            <p><strong>Phosphorous:</strong> ${p} mg/kg</p>
            <p><strong>Potassium:</strong> ${k} mg/kg</p>
            <p><strong>pH Level:</strong> ${ph}</p>
            <p><strong>Rainfall:</strong> ${rainfall} mm</p>
            <p><strong>Soil Type:</strong> ${soilType.charAt(0).toUpperCase() + soilType.slice(1)}</p>
        </div>
        
        <div class="soil-recommendations">
            <h4>Recommendations</h4>
            <ul>
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="crop-recommendations">
            <h4>Recommended Crops</h4>
            <ul>
                ${optimalCrops.map(crop => `<li>${crop}</li>`).join('')}
            </ul>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}