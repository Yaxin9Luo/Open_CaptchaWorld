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
    let selectedCells = []; // Track selected cells for Unusual_Detection
    let bingoSelectedCells = []; // Track selected cells for Bingo swap

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

    // Function to set up sliding puzzle
    function setupSlidePuzzle() {
        // Remove any existing controls first
        const existingSlider = document.querySelector('.slider-component');
        if (existingSlider) {
            existingSlider.remove();
        }
        
        // Clear the puzzle image container
        puzzleImageContainer.innerHTML = '';
        
        // Create a container for the background image
        const backgroundContainer = document.createElement('div');
        backgroundContainer.className = 'background-container';
        backgroundContainer.style.position = 'relative';
        backgroundContainer.style.width = '100%';
        backgroundContainer.style.height = 'auto';
        
        // Add background image
        const backgroundImg = document.createElement('img');
        backgroundImg.src = currentPuzzle.background_image;
        backgroundImg.alt = 'Slide puzzle background';
        backgroundImg.style.width = '100%';
        backgroundImg.style.height = 'auto';
        backgroundImg.style.display = 'block';
        backgroundContainer.appendChild(backgroundImg);
        
        // Create draggable slider component
        const sliderComponent = document.createElement('div');
        sliderComponent.className = 'slider-component';
        sliderComponent.style.position = 'absolute';
        sliderComponent.style.cursor = 'move';
        sliderComponent.style.zIndex = '10';
        sliderComponent.style.userSelect = 'none';
        sliderComponent.style.touchAction = 'none';
        
        // Add component image
        const componentImg = document.createElement('img');
        componentImg.src = currentPuzzle.component_image;
        componentImg.alt = 'Slide component';
        componentImg.style.width = '100%';
        componentImg.style.height = 'auto';
        componentImg.style.display = 'block';
        componentImg.draggable = false; // Prevent default dragging behavior
        sliderComponent.appendChild(componentImg);
        
        // Add slider component to the background container
        backgroundContainer.appendChild(sliderComponent);
        
        // Add the whole setup to the puzzle image container
        puzzleImageContainer.appendChild(backgroundContainer);
        
        // Wait for images to load to get proper dimensions
        backgroundImg.onload = () => {
            // Get container dimensions
            const containerWidth = backgroundImg.width;
            const containerHeight = backgroundImg.height;
            
            // Load component image to get its dimensions
            componentImg.onload = () => {
                const componentWidth = componentImg.width;
                const componentHeight = componentImg.height;
                
                // Initial position for the slider component - bottom right corner (far from typical target)
                const initialLeft = containerWidth - componentWidth - 20;
                const initialTop = containerHeight - componentHeight - 20;
                
                sliderComponent.style.left = `${initialLeft}px`;
                sliderComponent.style.top = `${initialTop}px`;
                
                // Initialize current position tracking variables
                currentX = initialLeft;
                currentY = initialTop;
                
                // In debug mode, fetch and show the target area
                if (DEBUG_MODE) {
                    fetch('/api/get_ground_truth', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            puzzle_type: currentPuzzle.puzzle_type,
                            puzzle_id: currentPuzzle.puzzle_id
                        })
                    })
                    .then(response => response.json())
                    .then(gtData => {
                        if (gtData.answer) {
                            // Get tolerance value if available
                            const tolerance = gtData.answer.tolerance || 15; // Default to 15px
                            showSliderTargetArea(gtData.answer, backgroundContainer, tolerance);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching ground truth:', error);
                    });
                }
            };
        };
        
        // Set up draggable functionality
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        // Track current position
        let currentX = 0;
        let currentY = 0;
        
        // Mouse events for desktop
        sliderComponent.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(sliderComponent.style.left) || 0;
            startTop = parseInt(sliderComponent.style.top) || 0;
            sliderComponent.style.opacity = '0.8';
            
            // Prevent default browser behavior
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            // Calculate new position
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Calculate new position
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            // Get container dimensions
            const containerRect = backgroundContainer.getBoundingClientRect();
            const sliderRect = sliderComponent.getBoundingClientRect();
            
            // Ensure the slider stays within the container bounds
            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft > containerRect.width - sliderRect.width) 
                newLeft = containerRect.width - sliderRect.width;
            if (newTop > containerRect.height - sliderRect.height) 
                newTop = containerRect.height - sliderRect.height;
            
            sliderComponent.style.left = `${newLeft}px`;
            sliderComponent.style.top = `${newTop}px`;
            
            // Update current position
            currentX = newLeft;
            currentY = newTop;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                sliderComponent.style.opacity = '1';
                
                // Calculate center point
                const componentRect = componentImg.getBoundingClientRect();
                const centerX = currentX + (componentRect.width / 2);
                const centerY = currentY + (componentRect.height / 2);
                
                // Log final position for debugging
                console.log('Slider final position (top-left):', { x: currentX, y: currentY });
                console.log('Slider center position:', { x: centerX, y: centerY });
            }
        });
        
        // Touch events for mobile
        sliderComponent.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startLeft = parseInt(sliderComponent.style.left) || 0;
            startTop = parseInt(sliderComponent.style.top) || 0;
            sliderComponent.style.opacity = '0.8';
            
            // Prevent default browser behavior
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            // Calculate new position
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            // Calculate new position
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            // Get container dimensions
            const containerRect = backgroundContainer.getBoundingClientRect();
            const sliderRect = sliderComponent.getBoundingClientRect();
            
            // Ensure the slider stays within the container bounds
            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft > containerRect.width - sliderRect.width) 
                newLeft = containerRect.width - sliderRect.width;
            if (newTop > containerRect.height - sliderRect.height) 
                newTop = containerRect.height - sliderRect.height;
            
            sliderComponent.style.left = `${newLeft}px`;
            sliderComponent.style.top = `${newTop}px`;
            
            // Update current position
            currentX = newLeft;
            currentY = newTop;
        });
        
        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                sliderComponent.style.opacity = '1';
                
                // Calculate center point
                const componentRect = componentImg.getBoundingClientRect();
                const centerX = currentX + (componentRect.width / 2);
                const centerY = currentY + (componentRect.height / 2);
                
                // Log final position for debugging
                console.log('Slider final position (top-left):', { x: currentX, y: currentY });
                console.log('Slider center position:', { x: centerX, y: centerY });
            }
        });
        
        // Add submit button for the sliding puzzle
        const submitSection = document.createElement('div');
        submitSection.className = 'slider-submit';
        const sliderSubmitBtn = document.createElement('button');
        sliderSubmitBtn.textContent = 'Submit';
        sliderSubmitBtn.className = 'submit-slider';
        
        sliderSubmitBtn.addEventListener('click', () => {
            // When submitting, we need to get the final position
            // and normalize it to the image dimensions
            const componentRect = componentImg.getBoundingClientRect();
            
            // Calculate center point of the component
            const centerX = currentX + (componentRect.width / 2);
            const centerY = currentY + (componentRect.height / 2);
            
            // Submit this position
            console.log('Submitting slider position:', { x: centerX, y: centerY });
            submitSliderPosition(centerX, centerY);
        });
        
        submitSection.appendChild(sliderSubmitBtn);
        
        // Add to puzzle container
        const imageWrapper = document.querySelector('.puzzle-image-wrapper');
        imageWrapper.appendChild(submitSection);
    }
    
    // Function to show the target area for the slider in debug mode
    function showSliderTargetArea(targetPosition, container, tolerance = 15) {
        if (!DEBUG_MODE || !targetPosition) return;
        
        // Remove any existing debug targets
        const existingTarget = document.querySelector('.target-area');
        if (existingTarget) {
            existingTarget.remove();
        }
        
        // Create a target element
        const targetArea = document.createElement('div');
        targetArea.className = 'target-area';
        
        // Get target coordinates
        const [targetX, targetY] = targetPosition;
        
        // We'll visualize this as a circle
        const diameter = tolerance * 2;
        
        // Style the target area
        targetArea.style.position = 'absolute';
        targetArea.style.left = `${targetX - tolerance}px`;
        targetArea.style.top = `${targetY - tolerance}px`;
        targetArea.style.width = `${diameter}px`;
        targetArea.style.height = `${diameter}px`;
        targetArea.style.borderRadius = '50%';
        targetArea.style.border = '2px dashed green';
        targetArea.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
        targetArea.style.zIndex = '5';
        targetArea.style.pointerEvents = 'none'; // Allow clicks to pass through
        
        // Add coordinates label
        const coordsLabel = document.createElement('div');
        coordsLabel.className = 'coords-label';
        coordsLabel.textContent = `Target: (${targetX}, ${targetY}) ±${tolerance}px`;
        coordsLabel.style.position = 'absolute';
        coordsLabel.style.top = '-25px';
        coordsLabel.style.left = '0';
        coordsLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        coordsLabel.style.color = 'white';
        coordsLabel.style.padding = '2px 5px';
        coordsLabel.style.fontSize = '10px';
        coordsLabel.style.borderRadius = '3px';
        coordsLabel.style.whiteSpace = 'nowrap';
        targetArea.appendChild(coordsLabel);
        
        // Add to the container
        container.appendChild(targetArea);
        
        // Log the target details
        console.log('Target position:', { 
            x: targetX, 
            y: targetY,
            tolerance: tolerance
        });
    }

    // Function to submit slider position
    function submitSliderPosition(x, y) {
        if (!currentPuzzle) {
            resultMessage.textContent = 'Loading puzzle, please wait...';
            resultMessage.className = 'result-message incorrect';
            return;
        }
        
        // Send position to the server for verification
        fetch('/api/check_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                puzzle_type: currentPuzzle.puzzle_type,
                puzzle_id: currentPuzzle.puzzle_id,
                answer: [x, y]
            })
        })
        .then(response => response.json())
        .then(data => {
            // Update stats
            benchmarkStats.total++;
            if (data.correct) {
                benchmarkStats.correct++;
                resultMessage.textContent = 'Correct! The slider was placed in the right position.';
                resultMessage.className = 'result-message correct';
            } else {
                resultMessage.textContent = 'Incorrect. Please try again with a better position.';
                resultMessage.className = 'result-message incorrect';
            }
            
            updateStats();
            
            // Record benchmark result
            recordBenchmarkResult({
                puzzle_type: currentPuzzle.puzzle_type,
                puzzle_id: currentPuzzle.puzzle_id,
                user_answer: [x, y],
                correct_answer: data.correct_answer,
                correct: data.correct
            });
            
            // Disable the submit button to prevent multiple submissions
            const submitBtn = document.querySelector('.submit-slider');
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            
            // Also disable rotation submit button if it exists
            const rotateSubmitBtn = document.querySelector('.submit-rotation');
            if (rotateSubmitBtn) {
                rotateSubmitBtn.disabled = true;
            }
            
            // Also disable image recognition submit button if it exists
            const imageRecognitionSubmitBtn = document.querySelector('.submit-image-recognition');
            if (imageRecognitionSubmitBtn) {
                imageRecognitionSubmitBtn.disabled = true;
            }
            
            // Also disable bingo submit button if it exists
            const bingoSubmitBtn = document.querySelector('.submit-bingo');
            if (bingoSubmitBtn) {
                bingoSubmitBtn.disabled = true;
            }
            
            // Also disable image matching submit button if it exists
            const imageMatchingSubmitBtn = document.querySelector('.submit-image-matching');
            if (imageMatchingSubmitBtn) {
                imageMatchingSubmitBtn.disabled = true;
            }
            
            // Load a new puzzle after a delay
            setTimeout(loadNewPuzzle, 2000);
        })
        .catch(error => {
            console.error('Error checking answer:', error);
            resultMessage.textContent = 'Error checking answer. Please try again.';
            resultMessage.className = 'result-message incorrect';
        });
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

    // Function to set up unusual detection grid
    function setupUnusualDetectionGrid() {
        // Remove any existing grid
        const existingGrid = document.querySelector('.unusual-detection-grid');
        if (existingGrid) {
            existingGrid.remove();
        }
        
        // Clear the puzzle image container
        puzzleImageContainer.innerHTML = '';
        
        // Get the grid dimensions from the current puzzle data
        const gridSize = currentPuzzle.grid_size || [2, 3]; // Default to 2x3 if not specified
        const [rows, cols] = gridSize;
        
        // Create the grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'unusual-detection-grid';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gap = '2px';
        gridContainer.style.width = '100%';
        gridContainer.style.aspectRatio = `${cols} / ${rows}`;
        
        // First, load the full image to get its dimensions
        const fullImg = new Image();
        fullImg.onload = () => {
            const imgWidth = fullImg.width;
            const imgHeight = fullImg.height;
            const cellWidth = imgWidth / cols;
            const cellHeight = imgHeight / rows;
            
            // Create individual image elements for each cell
            const totalCells = rows * cols;
            for (let i = 0; i < totalCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.index = i;
                cell.style.position = 'relative';
                cell.style.border = '2px solid #333';
                cell.style.cursor = 'pointer';
                cell.style.overflow = 'hidden';
                
                // Create an individual image for this cell
                const cellImg = document.createElement('img');
                cellImg.className = 'cell-image';
                cellImg.style.width = '100%';
                cellImg.style.height = '100%';
                cellImg.style.objectFit = 'cover';
                cellImg.style.display = 'block';
                cell.appendChild(cellImg);
                
                // Calculate which part of the source image this cell represents
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                // Create a canvas to extract just this portion of the image
                const canvas = document.createElement('canvas');
                canvas.width = cellWidth;
                canvas.height = cellHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw just the portion we want
                ctx.drawImage(
                    fullImg,
                    col * cellWidth, row * cellHeight, // Source x, y
                    cellWidth, cellHeight, // Source width, height
                    0, 0, // Destination x, y
                    cellWidth, cellHeight // Destination width, height
                );
                
                // Set the cell image source to this canvas data
                cellImg.src = canvas.toDataURL();
                
                // Create an overlay for selection state
                const overlay = document.createElement('div');
                overlay.className = 'cell-overlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 120, 255, 0.5)';
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.2s ease';
                overlay.style.pointerEvents = 'none';
                cell.appendChild(overlay);
                
                // Add a checkmark icon to indicate selection
                const checkmark = document.createElement('div');
                checkmark.className = 'checkmark';
                checkmark.innerHTML = '✓';
                checkmark.style.position = 'absolute';
                checkmark.style.top = '50%';
                checkmark.style.left = '50%';
                checkmark.style.transform = 'translate(-50%, -50%)';
                checkmark.style.color = 'white';
                checkmark.style.fontSize = '32px';
                checkmark.style.fontWeight = 'bold';
                checkmark.style.opacity = '0';
                checkmark.style.transition = 'opacity 0.2s ease';
                checkmark.style.pointerEvents = 'none';
                cell.appendChild(checkmark);
                
                // Add click event handler for selection
                cell.addEventListener('click', (e) => {
                    toggleCellSelection(i, cell);
                });
                
                // Add the cell to the grid
                gridContainer.appendChild(cell);
            }
            
            // Add the grid to the puzzle image container
            puzzleImageContainer.appendChild(gridContainer);
            
            // Add a submit button below the grid
            const submitSection = document.createElement('div');
            submitSection.className = 'unusual-submit';
            submitSection.style.textAlign = 'center';
            submitSection.style.marginTop = '15px';
            
            const unusualSubmitBtn = document.createElement('button');
            unusualSubmitBtn.textContent = 'Submit';
            unusualSubmitBtn.className = 'submit-unusual';
            unusualSubmitBtn.addEventListener('click', submitAnswer);
            submitSection.appendChild(unusualSubmitBtn);
            
            // Add to puzzle container
            const imageWrapper = document.querySelector('.puzzle-image-wrapper');
            imageWrapper.appendChild(submitSection);
            
            // Reset selected cells
            selectedCells = [];
        };
        
        // Set the source to load the image
        fullImg.src = currentPuzzle.image_path;
        fullImg.style.display = 'none';
    }
    
    function toggleCellSelection(index, cellElement) {
        // Check if this cell is already selected
        const isSelected = selectedCells.includes(index);
        
        if (isSelected) {
            // Deselect the cell
            selectedCells = selectedCells.filter(i => i !== index);
            cellElement.querySelector('.cell-overlay').style.opacity = '0';
            cellElement.querySelector('.checkmark').style.opacity = '0';
            cellElement.style.transform = 'scale(1)';
            cellElement.style.borderColor = '#333';
        } else {
            // Select the cell
            selectedCells.push(index);
            cellElement.querySelector('.cell-overlay').style.opacity = '1';
            cellElement.querySelector('.checkmark').style.opacity = '1';
            cellElement.style.transform = 'scale(0.95)';
            cellElement.style.borderColor = '#0078ff';
        }
        
        console.log('Selected cells:', selectedCells);
    }

    // Function to set up Bingo swap puzzle
    function setupBingoSwap() {
        // Remove any existing grid
        const existingGrid = document.querySelector('.bingo-grid');
        if (existingGrid) {
            existingGrid.remove();
        }
        
        // Clear the puzzle image container
        puzzleImageContainer.innerHTML = '';
        
        // Get the grid dimensions from the current puzzle data
        const gridSize = currentPuzzle.grid_size || [3, 3]; // Default to 3x3 if not specified
        const [rows, cols] = gridSize;
        
        // Create the grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'bingo-grid';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gap = '2px';
        gridContainer.style.width = '100%';
        gridContainer.style.aspectRatio = `${cols} / ${rows}`;
        
        // First, load the full image to get its dimensions
        const fullImg = new Image();
        fullImg.onload = () => {
            const imgWidth = fullImg.width;
            const imgHeight = fullImg.height;
            const cellWidth = imgWidth / cols;
            const cellHeight = imgHeight / rows;
            
            // Create individual image elements for each cell
            const totalCells = rows * cols;
            for (let i = 0; i < totalCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.index = i;
                cell.style.position = 'relative';
                cell.style.border = '2px solid #333';
                cell.style.cursor = 'pointer';
                cell.style.overflow = 'hidden';
                
                // Create an individual image for this cell
                const cellImg = document.createElement('img');
                cellImg.className = 'cell-image';
                cellImg.style.width = '100%';
                cellImg.style.height = '100%';
                cellImg.style.objectFit = 'cover';
                cellImg.style.display = 'block';
                cell.appendChild(cellImg);
                
                // Calculate which part of the source image this cell represents
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                // Create a canvas to extract just this portion of the image
                const canvas = document.createElement('canvas');
                canvas.width = cellWidth;
                canvas.height = cellHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw just the portion we want
                ctx.drawImage(
                    fullImg,
                    col * cellWidth, row * cellHeight, // Source x, y
                    cellWidth, cellHeight, // Source width, height
                    0, 0, // Destination x, y
                    cellWidth, cellHeight // Destination width, height
                );
                
                // Create a data URL and set it as the image source
                cellImg.src = canvas.toDataURL();
                
                // Create an overlay for selection state
                const overlay = document.createElement('div');
                overlay.className = 'cell-overlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 120, 255, 0.5)';
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.2s ease';
                overlay.style.pointerEvents = 'none';
                cell.appendChild(overlay);
                
                // Add click handler for selection
                cell.addEventListener('click', (e) => {
                    toggleBingoCellSelection(i, cell);
                });
                
                // Add the cell to the grid
                gridContainer.appendChild(cell);
            }
            
            // Add the grid to the puzzle image container
            puzzleImageContainer.appendChild(gridContainer);
            
            // Add a submit button below the grid
            const submitSection = document.createElement('div');
            submitSection.className = 'bingo-submit';
            submitSection.style.textAlign = 'center';
            submitSection.style.marginTop = '15px';
            
            const bingoSubmitBtn = document.createElement('button');
            bingoSubmitBtn.textContent = 'Swap and Submit';
            bingoSubmitBtn.className = 'submit-bingo';
            bingoSubmitBtn.addEventListener('click', () => {
                if (bingoSelectedCells.length === 2) {
                    // Visually swap the cells
                    swapBingoCells();
                    // Submit the answer
                    setTimeout(submitAnswer, 500);
                } else {
                    resultMessage.textContent = 'Please select exactly two cells to swap.';
                    resultMessage.className = 'result-message error';
                }
            });
            submitSection.appendChild(bingoSubmitBtn);
            
            // Add to puzzle container
            const imageWrapper = document.querySelector('.puzzle-image-wrapper');
            imageWrapper.appendChild(submitSection);
            
            // Reset selected cells
            bingoSelectedCells = [];
        };
        
        // Set the source to load the image
        fullImg.src = currentPuzzle.image_path;
        fullImg.style.display = 'none';
    }

    function toggleBingoCellSelection(index, cellElement) {
        const overlay = cellElement.querySelector('.cell-overlay');
        
        // Check if this cell is already selected
        const selectedIndex = bingoSelectedCells.indexOf(index);
        
        if (selectedIndex !== -1) {
            // If already selected, unselect it
            bingoSelectedCells.splice(selectedIndex, 1);
            overlay.style.opacity = '0';
        } else {
            // If we already have 2 selected cells, remove the first one
            if (bingoSelectedCells.length >= 2) {
                const firstCell = document.querySelector(`.grid-cell[data-index="${bingoSelectedCells[0]}"]`);
                if (firstCell) {
                    firstCell.querySelector('.cell-overlay').style.opacity = '0';
                }
                bingoSelectedCells.shift(); // Remove the first element
            }
            
            // Add this cell to selected
            bingoSelectedCells.push(index);
            overlay.style.opacity = '0.5';
        }
        
        console.log('Selected cells for Bingo:', bingoSelectedCells);
    }

    function swapBingoCells() {
        if (bingoSelectedCells.length !== 2) return;
        
        // Get the two cells to swap
        const cell1 = document.querySelector(`.grid-cell[data-index="${bingoSelectedCells[0]}"]`);
        const cell2 = document.querySelector(`.grid-cell[data-index="${bingoSelectedCells[1]}"]`);
        
        if (!cell1 || !cell2) return;
        
        // Get the images inside the cells
        const img1 = cell1.querySelector('.cell-image');
        const img2 = cell2.querySelector('.cell-image');
        
        if (!img1 || !img2) return;
        
        // Swap the image sources
        const tempSrc = img1.src;
        img1.src = img2.src;
        img2.src = tempSrc;
        
        // Apply a highlight to the solution line if it exists
        if (currentPuzzle.solution_line) {
            // Get the answer from the ground truth
            const correctSwaps = currentPuzzle.answer;
            const selectedSwapSet = new Set(bingoSelectedCells);
            
            // Check which solution was achieved by comparing our selection with possible answers
            let solutionKey = null;
            
            // Check vertical solution
            if (currentPuzzle.solution_line.vertical && 
                checkIfSolutionMatches(correctSwaps, selectedSwapSet)) {
                solutionKey = 'vertical';
            } 
            // Check horizontal solution
            else if (currentPuzzle.solution_line.horizontal && 
                checkIfSolutionMatches(correctSwaps, selectedSwapSet)) {
                solutionKey = 'horizontal';
            }
            // Check diagonal solution
            else if (currentPuzzle.solution_line.diagonal && 
                checkIfSolutionMatches(correctSwaps, selectedSwapSet)) {
                solutionKey = 'diagonal';
            }
            
            // If we found a matching solution, highlight it
            if (solutionKey && currentPuzzle.solution_line[solutionKey]) {
                for (const cellIndex of currentPuzzle.solution_line[solutionKey]) {
                    const solutionCell = document.querySelector(`.grid-cell[data-index="${cellIndex}"]`);
                    if (solutionCell) {
                        solutionCell.style.border = '2px solid green';
                    }
                }
            }
        }
    }
    
    // Helper function to check if selected cells match any solution
    function checkIfSolutionMatches(correctSwaps, selectedSwapSet) {
        // Go through each possible correct swap and check if our selection matches any of them
        for (const correctSwap of correctSwaps) {
            const correctSwapSet = new Set(correctSwap);
            // Check if our selected cells match this solution (order doesn't matter)
            if (setsEqual(selectedSwapSet, correctSwapSet)) {
                return true;
            }
        }
        return false;
    }
    
    // Helper function to compare sets for equality
    function setsEqual(set1, set2) {
        if (set1.size !== set2.size) return false;
        for (const item of set1) {
            if (!set2.has(item)) return false;
        }
        return true;
    }

    function loadNewPuzzle() {
        // Reset state
        clickCoordinates = null;
        processingClick = false;
        currentRotationAngle = 0;
        selectedCells = [];
        bingoSelectedCells = [];
        
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
        
        // Remove any slider components and submit buttons
        const existingSliderSubmit = document.querySelector('.slider-submit');
        if (existingSliderSubmit) {
            existingSliderSubmit.remove();
        }
        
        // Remove any unusual detection grid and submit buttons
        const existingUnusualSubmit = document.querySelector('.unusual-submit');
        if (existingUnusualSubmit) {
            existingUnusualSubmit.remove();
        }
        
        // Remove any image recognition grid and submit buttons
        const existingImageRecognitionSubmit = document.querySelector('.image-recognition-submit');
        if (existingImageRecognitionSubmit) {
            existingImageRecognitionSubmit.remove();
        }
        
        // Remove any bingo grid and submit buttons
        const existingBingoSubmit = document.querySelector('.bingo-submit');
        if (existingBingoSubmit) {
            existingBingoSubmit.remove();
        }
        
        // Remove any image matching controls and submit buttons
        const existingImageMatchingControls = document.querySelector('.image-matching-controls');
        if (existingImageMatchingControls) {
            existingImageMatchingControls.remove();
        }
        
        const existingImageMatchingSubmit = document.querySelector('.image-matching-submit');
        if (existingImageMatchingSubmit) {
            existingImageMatchingSubmit.remove();
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
                } else if (data.input_type === 'slide') {
                    // Setup for slide-based CAPTCHAs
                    inputGroup.style.display = 'none';
                    puzzleImage.style.display = 'none';
                    puzzleImageContainer.style.display = 'block';
                    
                    // Update prompt for the slide puzzle
                    if (data.prompt) {
                        puzzlePrompt.textContent = data.prompt;
                    } else {
                        puzzlePrompt.textContent = "Drag the slider component to the correct position.";
                    }
                    
                    // Set up sliding puzzle interface
                    setupSlidePuzzle();
                } else if (data.input_type === 'multiselect') {
                    // Setup for unusual detection CAPTCHAs
                    inputGroup.style.display = 'none';
                    puzzleImage.style.display = 'none';
                    puzzleImageContainer.style.display = 'block';
                    
                    // Update prompt for the unusual detection puzzle
                    if (data.prompt) {
                        puzzlePrompt.textContent = data.prompt;
                    } else {
                        puzzlePrompt.textContent = "Select the unusual items in the image.";
                    }
                    
                    // Set up unusual detection grid
                    setupUnusualDetectionGrid();
                } else if (data.input_type === 'image_grid') {
                    // Setup for image recognition CAPTCHAs
                    inputGroup.style.display = 'none';
                    puzzleImage.style.display = 'none';
                    puzzleImageContainer.style.display = 'block';
                    
                    // Update prompt for the image recognition puzzle
                    if (data.prompt) {
                        puzzlePrompt.textContent = data.prompt;
                    } else if (data.question) {
                        puzzlePrompt.textContent = data.question;
                    } else {
                        puzzlePrompt.textContent = "Select all images that match the description.";
                    }
                    
                    // Set up image recognition grid
                    setupImageRecognition();
                } else if (data.input_type === 'bingo_swap') {
                    // Setup for Bingo swap CAPTCHA
                    inputGroup.style.display = 'none';
                    puzzleImage.style.display = 'none';
                    puzzleImageContainer.style.display = 'block';
                    
                    // Update prompt for the Bingo puzzle
                    if (data.prompt) {
                        puzzlePrompt.textContent = data.prompt;
                    } else {
                        puzzlePrompt.textContent = "Please click two images to exchange their position to line up the same images to a line, you can only exchange the images once.";
                    }
                    
                    // Set up Bingo grid
                    setupBingoSwap();
                } else if (data.input_type === 'image_matching') {
                    // Setup for Image Matching CAPTCHA
                    inputGroup.style.display = 'none';
                    puzzleImage.style.display = 'none';
                    puzzleImageContainer.style.display = 'block';
                    
                    // Update prompt for the Image Matching puzzle
                    if (data.prompt) {
                        puzzlePrompt.textContent = data.prompt;
                    } else {
                        puzzlePrompt.textContent = "Using the arrows, match the animal in the left and right image.";
                    }
                    
                    // Set up Image Matching interface
                    setupImageMatching();
                } else if (data.input_type === 'patch_select') {
                    // Hide standard input display but keep it for value storage
                    userAnswerInput.style.display = 'none';
                    
                    // Customize submit button
                    submitBtn.textContent = 'Verify';
                    submitBtn.style.display = 'block';
                    
                    // Setup patch selection grid
                    setupPatchSelectGrid();
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
        // Disable submit button to prevent double submissions
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        let answerData = {
            puzzle_type: currentPuzzle.puzzle_type,
            puzzle_id: currentPuzzle.puzzle_id
        };
        
        // Handle different input types
        if (currentPuzzle.input_type === 'click' && clickCoordinates) {
            // For click input, send the click coordinates
            answerData.answer = clickCoordinates;
        } else if (currentPuzzle.input_type === 'rotation') {
            // For rotation input, send the current rotation angle
            answerData.answer = currentRotationAngle;
        } else if (currentPuzzle.input_type === 'slide') {
            // For slide puzzle, calculate the current position of the slider
            const sliderComponent = document.querySelector('.slider-component');
            if (sliderComponent) {
                // Get the current position (from CSS left/top values)
                const currentX = parseInt(sliderComponent.style.left) || 0;
                const currentY = parseInt(sliderComponent.style.top) || 0;
                
                // Add slider position to answer data
                answerData.answer = [currentX, currentY];
            } else {
                console.error('Slider component not found');
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Check Position';
                return;
            }
        } else if (currentPuzzle.input_type === 'multiselect') {
            // For multiselect input, send the selected cell indices
            answerData.answer = selectedCells;
        } else if (currentPuzzle.input_type === 'image_grid') {
            // For image grid selection, send the selected image indices
            const selectedImages = Array.from(document.querySelectorAll('.image-grid-item.selected'))
                .map(item => parseInt(item.dataset.index));
            answerData.answer = selectedImages;
        } else if (currentPuzzle.input_type === 'bingo_swap') {
            // For bingo swap, send the selected cells to swap
            answerData.answer = bingoSelectedCells;
        } else if (currentPuzzle.input_type === 'image_matching') {
            // For image matching, send the current option index
            const currentOptionIndex = currentPuzzle.current_option_index || 0;
            answerData.answer = currentOptionIndex;
        } else if (currentPuzzle.input_type === 'patch_select') {
            // For patch select, send the selected patch indices
            try {
                // Get the selected patches from userAnswerInput.value (JSON string)
                const selectedPatches = JSON.parse(userAnswerInput.value);
                answerData.answer = selectedPatches;
            } catch (error) {
                console.error('Error parsing selected patches:', error);
                answerData.answer = [];
            }
        } else {
            // For text/number inputs, use the input value
            answerData.answer = userAnswerInput.value;
        }
        
        // Send answer to server for verification
        fetch('/api/check_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answerData)
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
                user_answer: answerData.answer,
                correct_answer: data.correct_answer,
                correct: data.correct
            });
            
            // Disable the submit button after submission
            if (currentPuzzle.input_type !== 'click') {
                submitBtn.disabled = true;
                
                // Also disable rotation submit button if it exists
                const rotateSubmitBtn = document.querySelector('.submit-rotation');
                if (rotateSubmitBtn) {
                    rotateSubmitBtn.disabled = true;
                }
                
                // Also disable image recognition submit button if it exists
                const imageRecognitionSubmitBtn = document.querySelector('.submit-image-recognition');
                if (imageRecognitionSubmitBtn) {
                    imageRecognitionSubmitBtn.disabled = true;
                }
                
                // Also disable bingo submit button if it exists
                const bingoSubmitBtn = document.querySelector('.submit-bingo');
                if (bingoSubmitBtn) {
                    bingoSubmitBtn.disabled = true;
                }
                
                // Also disable image matching submit button if it exists
                const imageMatchingSubmitBtn = document.querySelector('.submit-image-matching');
                if (imageMatchingSubmitBtn) {
                    imageMatchingSubmitBtn.disabled = true;
                }
            }
            
            // Load a new puzzle after a delay
            setTimeout(loadNewPuzzle, 2000);
        })
        .catch(error => {
            console.error('Error checking answer:', error);
            resultMessage.textContent = 'Error checking answer. Please try again.';
            resultMessage.className = 'result-message incorrect';
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
        // Ensure we have the timestamp field
        if (!result.timestamp) {
            result.timestamp = new Date().toISOString();
        }
        
        // Send the benchmark result to be recorded
        fetch('/api/benchmark_results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Benchmark result recorded:', data);
        })
        .catch(error => {
            console.error('Error recording benchmark result:', error);
        });
    }
    
    // Auto-start benchmark when page loads
    loadNewPuzzle();

    // Function to update position display for the slider
    function updateSliderPositionDisplay(x, y, componentWidth, componentHeight) {
        // Remove any existing position display
        const existingDisplay = document.querySelector('.slider-position-display');
        if (existingDisplay) {
            existingDisplay.remove();
        }
        
        if (!DEBUG_MODE) return;
        
        // Calculate center point
        const centerX = x + (componentWidth / 2);
        const centerY = y + (componentHeight / 2);
        
        // Create the position display element
        const posDisplay = document.createElement('div');
        posDisplay.className = 'slider-position-display';
        posDisplay.textContent = `Position: (${Math.round(centerX)}, ${Math.round(centerY)})`;
        posDisplay.style.position = 'fixed';
        posDisplay.style.top = '10px';
        posDisplay.style.right = '10px';
        posDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        posDisplay.style.color = 'white';
        posDisplay.style.padding = '5px 10px';
        posDisplay.style.borderRadius = '4px';
        posDisplay.style.fontSize = '12px';
        posDisplay.style.zIndex = '1000';
        
        // Add to document body
        document.body.appendChild(posDisplay);
    }

    // Function to set up image recognition grid
    function setupImageRecognition() {
        // Remove any existing grid
        const existingGrid = document.querySelector('.image-recognition-grid');
        if (existingGrid) {
            existingGrid.remove();
        }
        
        // Clear the puzzle image container
        puzzleImageContainer.innerHTML = '';
        
        // Get the grid dimensions
        const gridSize = currentPuzzle.grid_size || [3, 3]; // Default to 3x3 grid
        const [rows, cols] = gridSize;
        
        // Create the grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'image-recognition-grid';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gap = '5px';
        gridContainer.style.width = '100%';
        gridContainer.style.aspectRatio = `${cols} / ${rows}`;
        
        // Get the list of images
        const images = currentPuzzle.images || [];
        
        // Create individual cells for each image
        for (let i = 0; i < images.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            cell.style.position = 'relative';
            cell.style.border = '2px solid #333';
            cell.style.cursor = 'pointer';
            cell.style.overflow = 'hidden';
            
            // Create image element
            const img = document.createElement('img');
            img.src = images[i];
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
            cell.appendChild(img);
            
            // Create an overlay for selection state
            const overlay = document.createElement('div');
            overlay.className = 'cell-overlay';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 120, 255, 0.5)';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.2s ease';
            overlay.style.pointerEvents = 'none';
            cell.appendChild(overlay);
            
            // Add a checkmark icon to indicate selection
            const checkmark = document.createElement('div');
            checkmark.className = 'checkmark';
            checkmark.innerHTML = '✓';
            checkmark.style.position = 'absolute';
            checkmark.style.top = '50%';
            checkmark.style.left = '50%';
            checkmark.style.transform = 'translate(-50%, -50%)';
            checkmark.style.color = 'white';
            checkmark.style.fontSize = '32px';
            checkmark.style.fontWeight = 'bold';
            checkmark.style.opacity = '0';
            checkmark.style.transition = 'opacity 0.2s ease';
            checkmark.style.pointerEvents = 'none';
            cell.appendChild(checkmark);
            
            // Add click handler for selection
            cell.addEventListener('click', (e) => {
                toggleCellSelection(i, cell);
            });
            
            // Add the cell to the grid
            gridContainer.appendChild(cell);
        }
        
        // Add the grid to the puzzle image container
        puzzleImageContainer.appendChild(gridContainer);
        
        // Add a submit button below the grid
        const submitSection = document.createElement('div');
        submitSection.className = 'image-recognition-submit';
        submitSection.style.textAlign = 'center';
        submitSection.style.marginTop = '15px';
        
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit';
        submitBtn.className = 'submit-image-recognition';
        submitBtn.addEventListener('click', submitAnswer);
        submitSection.appendChild(submitBtn);
        
        // Add to puzzle container
        const imageWrapper = document.querySelector('.puzzle-image-wrapper');
        imageWrapper.appendChild(submitSection);
        
        // Reset selected cells
        selectedCells = [];
    }

    // Function to set up Image Matching puzzle
    function setupImageMatching() {
        // Remove any existing controls first
        const existingControls = document.querySelector('.image-matching-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        // Clear the puzzle image container
        puzzleImageContainer.innerHTML = '';
        
        // Create a container for the reference image
        const referenceContainer = document.createElement('div');
        referenceContainer.className = 'reference-image-container';
        const referenceImg = document.createElement('img');
        referenceImg.id = 'reference-image';
        referenceImg.src = currentPuzzle.reference_image;
        referenceImg.alt = 'Reference image';
        referenceContainer.appendChild(referenceImg);
        
        // Create a container for the option image
        const optionContainer = document.createElement('div');
        optionContainer.className = 'option-image-container';
        const optionImg = document.createElement('img');
        optionImg.id = 'option-image';
        optionImg.src = currentPuzzle.option_images[0]; // Start with the first option
        optionImg.alt = 'Option image';
        optionContainer.appendChild(optionImg);
        
        // Create a two-column layout for image matching puzzle
        const matchingLayout = document.createElement('div');
        matchingLayout.className = 'matching-layout';
        matchingLayout.appendChild(referenceContainer);
        matchingLayout.appendChild(optionContainer);
        
        // Replace the existing puzzle image
        puzzleImageContainer.innerHTML = '';
        puzzleImageContainer.appendChild(matchingLayout);
        
        // Create navigation controls
        const navControls = document.createElement('div');
        navControls.className = 'image-matching-controls';
        
        // Create left navigation button
        const leftBtn = document.createElement('button');
        leftBtn.className = 'navigate-left';
        leftBtn.innerHTML = '&#9664;'; // Left arrow
        leftBtn.setAttribute('aria-label', 'Previous image');
        
        // Create right navigation button
        const rightBtn = document.createElement('button');
        rightBtn.className = 'navigate-right';
        rightBtn.innerHTML = '&#9654;'; // Right arrow
        rightBtn.setAttribute('aria-label', 'Next image');
        
        // Create indicator dots
        const indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'indicator-dots';
        
        for (let i = 0; i < currentPuzzle.option_images.length; i++) {
            const dot = document.createElement('span');
            dot.className = i === 0 ? 'dot active' : 'dot';
            indicatorContainer.appendChild(dot);
        }
        
        // Add buttons and indicators to controls
        navControls.appendChild(leftBtn);
        navControls.appendChild(indicatorContainer);
        navControls.appendChild(rightBtn);
        
        // Add to puzzle container
        const imageWrapper = document.querySelector('.puzzle-image-wrapper');
        imageWrapper.appendChild(navControls);
        
        // Add event listeners for navigation buttons
        let currentIndex = 0;
        
        leftBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + currentPuzzle.option_images.length) % currentPuzzle.option_images.length;
            updateOptionImage();
        });
        
        rightBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % currentPuzzle.option_images.length;
            updateOptionImage();
        });
        
        function updateOptionImage() {
            // Update the option image
            optionImg.src = currentPuzzle.option_images[currentIndex];
            
            // Update the indicator dots
            const dots = indicatorContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.className = i === currentIndex ? 'dot active' : 'dot';
            });
            
            // Update the current index in the puzzle data
            currentPuzzle.current_option_index = currentIndex;
        }
        
        // Auto-show submit button for image matching puzzles
        const submitSection = document.createElement('div');
        submitSection.className = 'image-matching-submit';
        const matchingSubmitBtn = document.createElement('button');
        matchingSubmitBtn.textContent = 'Submit';
        matchingSubmitBtn.className = 'submit-image-matching';
        matchingSubmitBtn.addEventListener('click', submitAnswer);
        submitSection.appendChild(matchingSubmitBtn);
        
        // Add to puzzle container
        imageWrapper.appendChild(submitSection);
    }

    // Function to set up patch selection grid
    function setupPatchSelectGrid() {
        // Remove any existing grid first
        const existingGrid = document.querySelector('.patch-select-grid');
        if (existingGrid) {
            existingGrid.remove();
        }
        
        // Clear the puzzle image container
        puzzleImageContainer.innerHTML = '';
        
        // Create a container for the patch select grid
        const gridContainer = document.createElement('div');
        gridContainer.className = 'patch-select-grid';
        
        // Get grid dimensions from the puzzle data
        const gridSize = currentPuzzle.grid_size || [6, 6];
        const rows = gridSize[0];
        const cols = gridSize[1];
        
        // Set grid styles
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gap = '3px';
        gridContainer.style.width = '100%';
        gridContainer.style.aspectRatio = `${cols}/${rows}`;
        gridContainer.style.position = 'relative';
        
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'patch-select-image-container';
        imageContainer.style.position = 'absolute';
        imageContainer.style.top = '0';
        imageContainer.style.left = '0';
        imageContainer.style.width = '100%';
        imageContainer.style.height = '100%';
        imageContainer.style.zIndex = '0';
        
        // Add the puzzle image
        const img = document.createElement('img');
        img.src = currentPuzzle.image_path;
        img.alt = 'CAPTCHA image';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        imageContainer.appendChild(img);
        
        // Add image container to grid container
        gridContainer.appendChild(imageContainer);
        
        // Create grid cells for selection
        const selectedPatches = [];
        
        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'patch-select-cell';
            cell.dataset.index = i;
            cell.style.position = 'relative';
            cell.style.zIndex = '1';
            cell.style.cursor = 'pointer';
            
            // Add a checkmark icon to indicate selection
            const checkmark = document.createElement('div');
            checkmark.className = 'checkmark';
            checkmark.innerHTML = '✓';
            checkmark.style.position = 'absolute';
            checkmark.style.top = '50%';
            checkmark.style.left = '50%';
            checkmark.style.transform = 'translate(-50%, -50%)';
            checkmark.style.color = 'white';
            checkmark.style.fontSize = '32px';
            checkmark.style.fontWeight = 'bold';
            checkmark.style.opacity = '0';
            checkmark.style.transition = 'opacity 0.2s ease';
            checkmark.style.pointerEvents = 'none';
            checkmark.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.7)';
            checkmark.style.zIndex = '3';
            cell.appendChild(checkmark);
            
            // Add click event to toggle selection
            cell.addEventListener('click', () => {
                // Toggle selection
                if (cell.classList.contains('selected')) {
                    cell.classList.remove('selected');
                    // Hide checkmark
                    checkmark.style.opacity = '0';
                    // Remove from selected array
                    const index = selectedPatches.indexOf(i);
                    if (index > -1) {
                        selectedPatches.splice(index, 1);
                    }
                } else {
                    cell.classList.add('selected');
                    // Show checkmark
                    checkmark.style.opacity = '1';
                    // Add to selected array
                    selectedPatches.push(i);
                }
                
                // Update the answer in the UI
                userAnswerInput.value = JSON.stringify(selectedPatches);
                
                // Log selected patches for debugging
                console.log('Selected patches:', selectedPatches);
            });
            
            gridContainer.appendChild(cell);
        }
        
        // Add the grid to the puzzle container
        puzzleImageContainer.appendChild(gridContainer);
        
        // Update the prompt to include the target object
        puzzlePrompt.textContent = `Select all squares with ${currentPuzzle.target_object}`;
        
        // Hide the regular input and replace with verify button
        userAnswerInput.style.display = 'none';
        submitBtn.textContent = 'Verify';
        submitBtn.style.display = 'block';
        
        // Clear any previous answer
        userAnswerInput.value = '[]';
    }
}); 