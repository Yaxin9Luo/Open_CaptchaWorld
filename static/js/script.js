document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const submitBtn = document.getElementById('submit-answer');
    const userAnswerInput = document.getElementById('user-answer');
    const puzzleImage = document.getElementById('puzzle-image');
    const puzzleImageContainer = document.querySelector('.puzzle-image-container');
    const resultMessage = document.getElementById('result-message');
    const totalCount = document.getElementById('total-count');
    const correctCount = document.getElementById('correct-count');
    const accuracyEl = document.getElementById('accuracy');
    const puzzlePrompt = document.getElementById('puzzle-prompt');
    const puzzleContainer = document.getElementById('puzzle-container');
    const inputGroup = document.querySelector('.input-group');

    // Debug mode - set to true to show ground truth areas
    const DEBUG_MODE = false;

    // Tracking state
    let currentPuzzle = null;
    let benchmarkStats = {
        total: 0,
        correct: 0
    };
    let clickCoordinates = null;
    let processingClick = false; // Flag to prevent multiple clicks while processing
    let currentRotationAngle = 0; // Track current rotation for Rotation_Match

    // Event listeners
    submitBtn.addEventListener('click', submitAnswer);
    userAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });

    // Add click event handler directly to the puzzle image
    puzzleImage.addEventListener('click', handleImageClick);

    // Functions
    function handleImageClick(e) {
        if (currentPuzzle && currentPuzzle.input_type === 'click' && !processingClick) {
            // Prevent multiple clicks while processing
            processingClick = true;
            
            // Get click coordinates relative to the image
            const rect = e.target.getBoundingClientRect();
            const x = Math.round(e.clientX - rect.left);
            const y = Math.round(e.clientY - rect.top);
            
            // Store coordinates for submission
            clickCoordinates = [x, y];
            
            // Show where user clicked
            showClickMarker(x, y);
            
            // Log for debugging
            console.log('Click received:', { x, y, target: e.target.id });
            
            // Auto-submit after click
            setTimeout(() => {
                submitAnswer();
            }, 300); // Small delay to allow user to see their click
        }
    }

    // Function to handle rotation
    function setupRotationControls() {
        // Remove any existing controls first
        const existingControls = document.querySelector('.rotation-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        // Create rotation controls
        const rotationControls = document.createElement('div');
        rotationControls.className = 'rotation-controls';
        
        // Create left rotation button
        const leftBtn = document.createElement('button');
        leftBtn.className = 'rotate-left';
        leftBtn.innerHTML = '&#8630;'; // Counter-clockwise arrow
        leftBtn.setAttribute('aria-label', 'Rotate left');
        
        // Create right rotation button
        const rightBtn = document.createElement('button');
        rightBtn.className = 'rotate-right';
        rightBtn.innerHTML = '&#8631;'; // Clockwise arrow
        rightBtn.setAttribute('aria-label', 'Rotate right');
        
        // Add buttons to controls
        rotationControls.appendChild(leftBtn);
        rotationControls.appendChild(rightBtn);
        
        // Add to puzzle container
        const imageWrapper = document.querySelector('.puzzle-image-wrapper');
        
        // Create a container for the reference image
        const referenceContainer = document.createElement('div');
        referenceContainer.className = 'reference-image-container';
        const referenceImg = document.createElement('img');
        referenceImg.id = 'reference-image';
        referenceImg.src = currentPuzzle.reference_image;
        referenceImg.alt = 'Reference direction';
        referenceContainer.appendChild(referenceImg);
        
        // Create a container for the object image
        const objectContainer = document.createElement('div');
        objectContainer.className = 'object-image-container';
        const objectImg = document.createElement('img');
        objectImg.id = 'object-image';
        objectImg.src = currentPuzzle.object_image;
        objectImg.alt = 'Rotatable object';
        objectContainer.appendChild(objectImg);
        
        // Create a two-column layout for rotation puzzle
        const rotationLayout = document.createElement('div');
        rotationLayout.className = 'rotation-layout';
        rotationLayout.appendChild(referenceContainer);
        rotationLayout.appendChild(objectContainer);
        
        // Replace the existing puzzle image
        puzzleImageContainer.innerHTML = '';
        puzzleImageContainer.appendChild(rotationLayout);
        
        // Add rotation controls below the image
        imageWrapper.appendChild(rotationControls);
        
        // Add event listeners for rotation buttons
        leftBtn.addEventListener('click', () => rotateObject(-45));
        rightBtn.addEventListener('click', () => rotateObject(45));
        
        // Set initial angle
        currentRotationAngle = currentPuzzle.current_angle || 0;
        updateObjectRotation();
    }
    
    function rotateObject(angleDelta) {
        // Update the current angle
        currentRotationAngle = (currentRotationAngle + angleDelta) % 360;
        if (currentRotationAngle < 0) {
            currentRotationAngle += 360;
        }
        
        // Apply the rotation
        updateObjectRotation();
        
        // Log for debugging
        console.log('Rotated to:', currentRotationAngle);
    }
    
    function updateObjectRotation() {
        const objectImg = document.getElementById('object-image');
        if (objectImg) {
            // Option 1: Use CSS transform to rotate the image
            objectImg.style.transform = `rotate(${currentRotationAngle}deg)`;
            
            // Option 2: Load a pre-rotated image if available
            // This would require having images at each rotation angle
            const baseName = currentPuzzle.object_base;
            // Find the closest pre-rotated image (0, 90, 180, 270)
            const angles = [0, 45, 90, 135, 180, 225, 270, 315];
            const closestAngle = angles.reduce((prev, curr) => 
                Math.abs(curr - currentRotationAngle) < Math.abs(prev - currentRotationAngle) ? curr : prev
            );
            
            // Load the pre-rotated image
            const rotatedImagePath = `/captcha_data/${currentPuzzle.puzzle_type}/${baseName}_${closestAngle}.png`;
            objectImg.src = rotatedImagePath;
            
            // Apply any additional rotation needed
            const remainingRotation = currentRotationAngle - closestAngle;
            if (remainingRotation !== 0) {
                objectImg.style.transform = `rotate(${remainingRotation}deg)`;
            } else {
                objectImg.style.transform = 'none';
            }
        }
    }

    // Add this new function to show the ground truth area
    function showGroundTruthArea(answer) {
        if (!DEBUG_MODE || !answer || !answer.area) return;
        
        // Remove any existing debug areas
        const existingArea = document.querySelector('.debug-area');
        if (existingArea) {
            existingArea.remove();
        }
        
        // Get the area boundaries
        const [[x1, y1], [x2, y2]] = answer.area;
        
        // Create and style the debug area element
        const debugArea = document.createElement('div');
        debugArea.className = 'debug-area';
        debugArea.style.position = 'absolute';
        debugArea.style.left = `${x1}px`;
        debugArea.style.top = `${y1}px`;
        debugArea.style.width = `${x2 - x1}px`;
        debugArea.style.height = `${y2 - y1}px`;
        debugArea.style.border = '2px dashed yellow';
        debugArea.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
        debugArea.style.pointerEvents = 'none'; // Allow clicks to pass through
        debugArea.style.zIndex = '5';
        
        // Add coordinates label
        const coordsLabel = document.createElement('div');
        coordsLabel.className = 'coords-label';
        coordsLabel.textContent = `TL: (${x1},${y1}) BR: (${x2},${y2})`;
        coordsLabel.style.position = 'absolute';
        coordsLabel.style.bottom = '0';
        coordsLabel.style.right = '0';
        coordsLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        coordsLabel.style.color = 'white';
        coordsLabel.style.padding = '2px 5px';
        coordsLabel.style.fontSize = '10px';
        coordsLabel.style.borderRadius = '3px';
        debugArea.appendChild(coordsLabel);
        
        // Add to the image container
        puzzleImageContainer.appendChild(debugArea);
        
        // Log the area details
        console.log('Ground truth area:', { 
            topLeft: [x1, y1], 
            bottomRight: [x2, y2], 
            width: x2 - x1, 
            height: y2 - y1,
            type: answer.type
        });
    }

    function showClickMarker(x, y) {
        // Remove any existing markers
        const existingMarker = document.querySelector('.click-marker');
        if (existingMarker) {
            existingMarker.remove();
        }
        
        // Create and add new marker
        const marker = document.createElement('div');
        marker.className = 'click-marker';
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        
        // Add coordinates label to the marker
        const coordsLabel = document.createElement('div');
        coordsLabel.className = 'coords-label';
        coordsLabel.textContent = `(${x},${y})`;
        coordsLabel.style.position = 'absolute';
        coordsLabel.style.top = '20px';
        coordsLabel.style.left = '20px';
        coordsLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        coordsLabel.style.color = 'white';
        coordsLabel.style.padding = '2px 5px';
        coordsLabel.style.fontSize = '10px';
        coordsLabel.style.borderRadius = '3px';
        coordsLabel.style.whiteSpace = 'nowrap';
        marker.appendChild(coordsLabel);
        
        // Add it directly to the image container for proper positioning
        puzzleImageContainer.appendChild(marker);
        
        // Log for debugging
        console.log('Marker placed at:', { x, y });
    }

    function loadNewPuzzle() {
        // Reset state
        clickCoordinates = null;
        processingClick = false;
        currentRotationAngle = 0;
        
        // Remove any click markers and debug areas
        const existingMarker = document.querySelector('.click-marker');
        if (existingMarker) {
            existingMarker.remove();
        }
        
        const existingArea = document.querySelector('.debug-area');
        if (existingArea) {
            existingArea.remove();
        }
        
        // Remove any rotation controls
        const existingControls = document.querySelector('.rotation-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        // Remove any existing rotation submit buttons
        const existingRotationSubmit = document.querySelector('.rotation-submit');
        if (existingRotationSubmit) {
            existingRotationSubmit.remove();
        }
        
        // Reset the puzzle prompt and image
        puzzlePrompt.textContent = 'Loading puzzle...';
        resultMessage.textContent = '';
        resultMessage.className = 'result-message';
        
        // Get a random puzzle from any available type
        fetch('/api/get_puzzle?random=true')
            .then(response => response.json())
            .then(data => {
                console.log("Received puzzle data:", data);
                currentPuzzle = data;
                
                // Reset container
                puzzleImageContainer.innerHTML = '';
                
                // Configure input based on puzzle type
                if (data.input_type === 'click') {
                    // Setup for click-based CAPTCHAs
                    puzzleImage.src = data.image_path;
                    inputGroup.style.display = 'none';
                    puzzleImage.style.cursor = 'pointer';
                    puzzleImage.classList.add('clickable');
                    puzzleImageContainer.style.display = 'block';
                    puzzleImage.style.display = 'block';
                    
                    // Add puzzle image back to container
                    puzzleImageContainer.appendChild(puzzleImage);
                    
                    // Update prompt after clearing
                    if (data.prompt) {
                        puzzlePrompt.textContent = data.prompt;
                    }
                    
                    // In debug mode, fetch the ground truth to show the area
                    if (DEBUG_MODE) {
                        // We need to get the correct answer to display the debug area
                        fetch('/api/get_ground_truth', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                puzzle_type: data.puzzle_type,
                                puzzle_id: data.puzzle_id
                            })
                        })
                        .then(response => response.json())
                        .then(gtData => {
                            if (gtData.answer) {
                                showGroundTruthArea(gtData.answer);
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching ground truth:', error);
                        });
                    }
                } else if (data.input_type === 'rotation') {
                    // Setup for rotation-based CAPTCHAs
                    inputGroup.style.display = 'none';
                    puzzleImage.style.display = 'none';
                    puzzleImageContainer.style.display = 'block';
                    
                    // Update prompt first to ensure it's from the rotation puzzle
                    if (data.prompt) {
                        puzzlePrompt.textContent = data.prompt;
                    } else {
                        puzzlePrompt.textContent = "Use the arrows to rotate the object to match the reference direction.";
                    }
                    
                    // Set up rotation interface
                    setupRotationControls();
                    
                    // Auto-show submit button for rotation puzzles
                    const submitSection = document.createElement('div');
                    submitSection.className = 'rotation-submit';
                    const rotateSubmitBtn = document.createElement('button');
                    rotateSubmitBtn.textContent = 'Submit';
                    rotateSubmitBtn.className = 'submit-rotation';
                    rotateSubmitBtn.addEventListener('click', submitAnswer);
                    submitSection.appendChild(rotateSubmitBtn);
                    
                    // Add to puzzle container
                    const imageWrapper = document.querySelector('.puzzle-image-wrapper');
                    imageWrapper.appendChild(submitSection);
                } else {
                    // Setup for text/number input CAPTCHAs
                    puzzleImage.src = data.image_path;
                    inputGroup.style.display = 'flex';
                    puzzleImage.style.cursor = 'default';
                    puzzleImage.classList.remove('clickable');
                    puzzleImageContainer.style.display = 'block';
                    puzzleImage.style.display = 'block';
                    
                    // Add puzzle image back to container
                    puzzleImageContainer.appendChild(puzzleImage);
                    
                    // Update prompt after clearing
                    if (data.prompt) {
                        puzzlePrompt.textContent = data.prompt;
                    }
                    
                    // Reset submit button
                    submitBtn.disabled = false;
                    
                    // Clear and focus input
                    userAnswerInput.value = '';
                    userAnswerInput.focus();
                    
                    // Set input type based on puzzle type
                    if (data.input_type === 'number') {
                        userAnswerInput.setAttribute('type', 'number');
                    } else {
                        userAnswerInput.setAttribute('type', 'text');
                    }
                }
            })
            .catch(error => {
                console.error('Error loading puzzle:', error);
                // Try again after a delay if there was an error
                setTimeout(loadNewPuzzle, 3000);
            });
    }

    function submitAnswer() {
        if (!currentPuzzle) {
            resultMessage.textContent = 'Loading puzzle, please wait...';
            resultMessage.className = 'result-message incorrect';
            return;
        }

        let answer;
        
        // Handle different input types
        if (currentPuzzle.input_type === 'click') {
            if (!clickCoordinates) {
                resultMessage.textContent = 'Please click on the image.';
                resultMessage.className = 'result-message incorrect';
                processingClick = false;
                return;
            }
            answer = clickCoordinates;
        } else if (currentPuzzle.input_type === 'rotation') {
            // For rotation puzzles, submit the current angle
            answer = currentRotationAngle;
        } else {
            answer = userAnswerInput.value.trim();
            if (!answer) {
                resultMessage.textContent = 'Please enter an answer.';
                resultMessage.className = 'result-message incorrect';
                return;
            }
        }

        // Send answer to server for verification
        fetch('/api/check_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                puzzle_type: currentPuzzle.puzzle_type,
                puzzle_id: currentPuzzle.puzzle_id,
                answer: answer
            })
        })
        .then(response => response.json())
        .then(data => {
            // Update stats
            benchmarkStats.total++;
            if (data.correct) {
                benchmarkStats.correct++;
                resultMessage.textContent = 'Correct!';
                resultMessage.className = 'result-message correct';
            } else {
                // Format correct answer display based on puzzle type
                let correctAnswerDisplay = '';
                
                if (currentPuzzle.puzzle_type === 'Geometry_Click') {
                    if (data.correct_answer && data.correct_answer.type) {
                        correctAnswerDisplay = `the ${data.correct_answer.type}`;
                    } else {
                        correctAnswerDisplay = 'the correct shape';
                    }
                    resultMessage.textContent = `Incorrect. You should have clicked on ${correctAnswerDisplay}.`;
                } else if (currentPuzzle.puzzle_type === 'Rotation_Match') {
                    // For rotation puzzles
                    correctAnswerDisplay = `${data.correct_answer}°`;
                    resultMessage.textContent = `Incorrect. The correct rotation is ${correctAnswerDisplay}.`;
                } else {
                    correctAnswerDisplay = data.correct_answer;
                    resultMessage.textContent = `Incorrect. The correct answer is ${correctAnswerDisplay}.`;
                }
                
                resultMessage.className = 'result-message incorrect';
            }
            
            updateStats();
            
            // Record benchmark result
            recordBenchmarkResult({
                puzzle_type: currentPuzzle.puzzle_type,
                puzzle_id: currentPuzzle.puzzle_id,
                user_answer: answer,
                correct_answer: data.correct_answer,
                is_correct: data.correct,
                timestamp: new Date().toISOString()
            });
            
            // Load a new puzzle after a short delay
            setTimeout(() => {
                loadNewPuzzle();
            }, 1500);
        })
        .catch(error => {
            console.error('Error checking answer:', error);
            processingClick = false;
        });
    }

    function updateStats() {
        totalCount.textContent = benchmarkStats.total;
        correctCount.textContent = benchmarkStats.correct;
        
        const accuracy = benchmarkStats.total > 0 
            ? ((benchmarkStats.correct / benchmarkStats.total) * 100).toFixed(1) 
            : '0.0';
        
        accuracyEl.textContent = `${accuracy}%`;
    }

    function recordBenchmarkResult(result) {
        fetch('/api/benchmark_results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        })
        .catch(error => {
            console.error('Error recording benchmark result:', error);
        });
    }
    
    // Auto-start benchmark when page loads
    loadNewPuzzle();
}); 