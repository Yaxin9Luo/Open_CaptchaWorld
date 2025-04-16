# CAPTCHA Puzzle Benchmark Project Summary

## Overview

The CAPTCHA Puzzle Benchmark is a web-based environment designed for testing and benchmarking Multimodal LLM (Large Language Model) Agents on various CAPTCHA-style puzzles. The application presents users with different types of CAPTCHA challenges and records their performance for benchmarking purposes.

## Project Structure

```
CAPTCHA Puzzle Benchmark/
├── app.py                    # Main Flask application
├── manage_captchas.py        # Command-line tool for managing CAPTCHAs
├── rotate_images.py          # Utility for creating rotation puzzles
├── requirements.txt          # Python dependencies
├── benchmark_results.json    # Log of benchmark attempts
├── README.md                 # Project documentation
├── static/                   # Static assets
│   ├── css/
│   │   └── style.css         # Application styling
│   └── js/
│       └── script.js         # Client-side JavaScript logic
├── templates/                # HTML templates
│   └── index.html            # Main application page
└── captcha_data/             # CAPTCHA puzzle data
    ├── Dice_Count/           # Dice counting puzzles
    ├── Geometry_Click/       # Geometric shape identification
    ├── Rotation_Match/       # Object rotation puzzles
    ├── Slide_Puzzle/         # Slider position puzzles
    ├── Unusual_Detection/    # Find unusual items
    ├── Image_Recognition/    # Image selection puzzles
    ├── Bingo/                # Image swapping puzzles
    ├── Image_Matching/       # Image matching puzzles
    ├── Patch_Select/         # Grid patch selection puzzles
    ├── Dart_Count/           # Dart counting puzzles
    ├── Object_Match/         # Object matching puzzles
    ├── Select_Animal/        # Animal selection puzzles
    ├── Coordinates/          # Position-based puzzles
    └── Path_Finder/          # Path finding puzzles
```

## Dependencies

The project uses the following Python dependencies (from requirements.txt):
- flask==2.0.1
- werkzeug==2.0.2
- flask-cors==3.0.10
- pillow==9.4.0

## Component Relationships

### Backend (Flask Application)

The core of the application is built with Flask, providing a RESTful API for the frontend to interact with:

1. **app.py**: Main server application that:
   - Serves the web interface
   - Provides API endpoints for puzzle retrieval and answer validation
   - Records benchmark results
   - Handles different CAPTCHA types with specialized logic

2. **manage_captchas.py**: Command-line utility for:
   - Adding new CAPTCHA types
   - Adding new puzzles to existing types
   - Listing available puzzles and types

3. **rotate_images.py**: Utility script for:
   - Creating rotated versions of images for rotation puzzles
   - Setting up rotation puzzle configurations

### Frontend

The frontend is built with vanilla JavaScript, HTML, and CSS:

1. **templates/index.html**: Main HTML structure with:
   - Container for CAPTCHA puzzles
   - Input mechanisms for answers
   - Benchmark statistics display

2. **static/js/script.js**: Client-side logic for:
   - Fetching random puzzles from the server
   - Handling different input types (clicks, text, selections, etc.)
   - Submitting answers and processing results
   - Updating the UI based on CAPTCHA type
   - Tracking benchmark statistics

3. **static/css/style.css**: Styling for:
   - CAPTCHA puzzle presentation
   - Input controls
   - Responsive design
   - Visual feedback elements

## Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the main application page |
| `/api/get_puzzle` | GET | Retrieves a random or specific CAPTCHA puzzle |
| `/api/check_answer` | POST | Validates the user's answer to a puzzle |
| `/api/benchmark_results` | POST | Records benchmark results |
| `/api/types` | GET | Lists available CAPTCHA types |
| `/api/get_ground_truth` | POST | Retrieves ground truth for debugging |
| `/captcha_data/<type>/<filename>` | GET | Serves CAPTCHA images |

## CAPTCHA Types and Input Mechanisms

The application supports multiple CAPTCHA types with specialized input mechanisms:

1. **Dice_Count**: Numerical input for the sum of dice values
2. **Geometry_Click**: Click on a specific geometric shape
3. **Rotation_Match**: Use arrows to rotate an object to match a reference direction
4. **Slide_Puzzle**: Drag a slider component to a target position
5. **Unusual_Detection**: Select unusual items in a grid of images
6. **Image_Recognition**: Select multiple images matching a description
7. **Bingo**: Swap two images to create a line of matching images
8. **Image_Matching**: Use arrows to match images on the left and right
9. **Patch_Select**: Select grid squares containing specific objects
10. **Dart_Count**: Select an image where darts add up to a target number
11. **Object_Match**: Adjust the number of objects to match a reference
12. **Select_Animal**: Click on a specific animal in a grid
13. **Coordinates**: Move an object to specified coordinates
14. **Path_Finder**: Navigate an object to a target position

Each CAPTCHA type has its own data structure in the `captcha_data/` directory, typically including:
- Puzzle images
- A `ground_truth.json` file containing answers and metadata

## Data Flow

1. **Puzzle Retrieval**:
   - Frontend requests a puzzle via `/api/get_puzzle`
   - Backend selects a random puzzle or a specific type
   - Puzzle data and type-specific instructions are returned

2. **User Interaction**:
   - Frontend displays the puzzle with appropriate input controls
   - User interacts with the puzzle based on type (clicks, drags, types, etc.)
   - JavaScript handles the specific interaction patterns

3. **Answer Validation**:
   - User submits their answer
   - Frontend sends the answer to `/api/check_answer`
   - Backend validates the answer based on the puzzle type
   - Result is returned to the frontend

4. **Benchmarking**:
   - Results are recorded to `benchmark_results.json`
   - Frontend updates statistics (total, correct, accuracy)
   - A new puzzle is automatically presented

## Extending the Benchmark

The application is designed to be extensible:

1. **Adding New Puzzles**: Use `manage_captchas.py` to add new puzzles to existing types
2. **Adding New CAPTCHA Types**: Create a new directory under `captcha_data/` with appropriate structure
3. **Custom Validation Logic**: Update the `check_answer` function in `app.py` to handle new puzzle types

## Benchmark Results

The `benchmark_results.json` file records all puzzle attempts with:
- Puzzle type
- Puzzle ID
- User's answer
- Correct answer
- Whether the answer was correct
- Timestamp of the attempt

This data can be analyzed to evaluate the performance of different agents on CAPTCHA tasks. 