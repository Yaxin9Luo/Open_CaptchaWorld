# Open CaptchaWorld - Project Summary

## Project Overview

Open CaptchaWorld is a comprehensive web-based platform for testing and benchmarking Multimodal LLM Web Agents on CAPTCHA-style puzzles. The project provides a controlled environment to evaluate how artificial intelligence systems perform on diverse visual puzzles resembling CAPTCHAs (Completely Automated Public Turing tests to tell Computers and Humans Apart).

The application includes 20 different types of CAPTCHA puzzles with varying complexity levels, from simple dice counting to complex interactions like rotation matching and path finding. It offers a web interface for interaction and API endpoints for programmatic access, making it suitable for both human and AI testing.

## Project Structure

```
Open CaptchaWorld/
├── app.py                    # Main Flask application
├── manage_captchas.py        # CLI tool for managing CAPTCHA data
├── rotate_images.py          # Utility for generating rotated images
├── benchmark_results.json    # Record of benchmark results
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
├── captcha_data/             # Directory containing CAPTCHA types and puzzles
│   ├── Dice_Count/          
│   ├── Geometry_Click/       
│   ├── Rotation_Match/       
│   └── ... (17 more types)   
├── static/                   # Static assets
│   ├── css/
│   │   └── style.css         # CSS styling
│   └── js/
│       └── script.js         # Frontend JavaScript code
└── templates/                # HTML templates
    └── index.html            # Main application page
```

## Dependencies

The project has the following key dependencies:
- Flask 2.0.1 - Web framework
- Werkzeug 2.0.2 - WSGI utilities
- Flask-CORS 3.0.10 - Cross-Origin Resource Sharing
- Pillow 9.4.0 - Image processing

## Core Components and Their Relationships

### 1. Main Application (`app.py`)

The `app.py` file is the central component of the application, containing:
- Flask server setup
- API endpoints for serving puzzles and validating answers
- Logic for handling different CAPTCHA types
- Benchmark result recording

Key functions:
- `load_ground_truth(captcha_type)`: Loads solutions for a specific CAPTCHA type
- `get_captcha_types()`: Retrieves available CAPTCHA types from the filesystem
- `get_puzzle()`: Selects and serves a random or specific CAPTCHA puzzle
- `check_answer()`: Validates user answers against ground truth
- `record_benchmark()`: Records benchmark results for analysis

### 2. CAPTCHA Management (`manage_captchas.py`)

The `manage_captchas.py` script provides a command-line interface for managing CAPTCHA data:
- Creating new CAPTCHA types
- Adding puzzles to existing types
- Listing available CAPTCHA types and puzzles

Key classes and functions:
- `CaptchaManager`: Class handling CAPTCHA data operations
  - `list_captcha_types()`: Lists all available CAPTCHA types
  - `add_captcha_type(type_name)`: Creates a new CAPTCHA type directory
  - `add_puzzle(type_name, image_path, answer, description)`: Adds a new puzzle
  - `list_puzzles(type_name)`: Lists all puzzles for a specific type

### 3. Rotation Utility (`rotate_images.py`)

The `rotate_images.py` script is a specialized utility for creating rotation puzzles:
- Generating rotated versions of images
- Creating rotation puzzles with reference and target images
- Managing related ground truth data

Key classes and functions:
- `RotationCaptchaCreator`: Class for creating rotation CAPTCHAs
  - `create_rotated_versions(image_path, name_prefix, angles)`: Creates rotated image versions
  - `create_puzzle(reference_image, object_image, correct_angle, prompt, description)`: Creates a rotation puzzle
  - `create_complete_set(reference_image, object_image, correct_angle, angles)`: Creates a complete puzzle set

### 4. Frontend Components

#### HTML Template (`templates/index.html`)
The main HTML template provides the structure for the web interface, including:
- Puzzle display area
- Answer input field
- Submit button
- Result messaging
- Benchmark statistics

#### JavaScript (`static/js/script.js`)
The client-side JavaScript handles:
- Fetching puzzles from the server
- Rendering different puzzle types with appropriate UI elements
- Handling user interactions based on puzzle type
- Submitting answers and processing results
- Tracking and displaying benchmark statistics

#### CSS Styling (`static/css/style.css`)
The CSS file provides styling for all UI components, ensuring a consistent and user-friendly interface.

### 5. CAPTCHA Data Structure (`captcha_data/`)

Each CAPTCHA type has its own directory containing:
- Puzzle images
- A `ground_truth.json` file with solutions and metadata

Example ground truth structure (Dice_Count):
```json
{
  "dice1.png": {
    "sum": 85,
    "prompt": "Sum up the numbers on all the dice",
    "description": "Contains multiple dice with numbers that sum to 85"
  }
}
```

Different CAPTCHA types have type-specific ground truth formats, but all follow a similar pattern of storing puzzle metadata and correct answers.

## Function Calling Logic

### API Request Flow

1. **Puzzle Retrieval**:
   - Client requests a puzzle via `GET /api/get_puzzle`
   - Server selects a puzzle (random or specified type)
   - Server returns puzzle data (image path, prompt, input type)
   - Client renders the puzzle based on its type

2. **Answer Validation**:
   - User solves puzzle and submits answer
   - Client sends answer via `POST /api/check_answer`
   - Server validates the answer against ground truth
   - Server returns validation result (correct/incorrect)
   - Client displays result and updates statistics

3. **Benchmark Recording**:
   - Client records result via `POST /api/benchmark_results`
   - Server appends result to `benchmark_results.json`

### Type-Specific Logic

The application handles 20 different CAPTCHA types, each with unique rendering, interaction, and validation:

1. **Dice_Count**: Sum numbers on dice (numeric input)
2. **Geometry_Click**: Click on specific shapes (click coordinates)
3. **Rotation_Match**: Rotate objects to match reference (angle selection)
4. **Slide_Puzzle**: Position sliders correctly (position coordinates)
5. **Unusual_Detection**: Identify unusual items (multiple selection)
6. **Image_Recognition**: Select images matching description (multiple selection)
7. **Bingo**: Swap positions to create a line (position swapping)
8. **Image_Matching**: Match similar images (option selection)
9. **Patch_Select**: Select grid squares with specific objects (multiple selection)
10. **Dart_Count**: Select image with correct dart sum (option selection)
11. **Object_Match**: Match object counts (option selection)
12. **Select_Animal**: Identify specific animals (grid selection)
13. **Coordinates**: Move object to coordinates (option selection)
14. **Path_Finder**: Navigate to target position (option selection)
15. **Place_Dot**: Place dot at specific location (click coordinates)
16. **Connect_icon**: Connect matching icons (option selection)
17. **Click_Order**: Click items in sequence (ordered clicks)
18. **Hold_Button**: Hold button for duration (timed interaction)
19. **Misleading_Click**: Click in correct area (click coordinates)
20. **Pick_Area**: Select specific area (click coordinates)

## Important File Locations

### Core Application Files
- **Main Application**: `app.py`
- **CAPTCHA Management**: `manage_captchas.py`
- **Rotation Utility**: `rotate_images.py`

### Data Files
- **CAPTCHA Puzzles**: `captcha_data/<type_name>/`
- **Ground Truth**: `captcha_data/<type_name>/ground_truth.json`
- **Benchmark Results**: `benchmark_results.json`

### Frontend Files
- **HTML Template**: `templates/index.html`
- **JavaScript**: `static/js/script.js`
- **CSS**: `static/css/style.css`

## Extension Points

The system is designed to be easily extended:

1. **Adding New CAPTCHA Types**:
   - Create a new directory under `captcha_data/`
   - Add puzzle images and `ground_truth.json` file
   - Update `app.py` to handle the new type (prompt generation, input type, validation)
   - Add frontend rendering logic in `script.js`

2. **Adding New Puzzles**:
   - Use `manage_captchas.py add-puzzle` to add to existing types
   - For rotation puzzles, use `rotate_images.py` utility

## Conclusion

Open CaptchaWorld provides a comprehensive platform for testing multimodal AI capabilities through CAPTCHA-style puzzles. Its modular architecture allows for easy extension with new puzzle types and evaluation scenarios. The combination of web interface and API endpoints makes it suitable for both interactive human testing and automated AI benchmarking.

The project addresses a significant challenge for LLM Web Agents: navigating websites with CAPTCHA tests. By providing this benchmarking environment, researchers can develop and evaluate more capable AI systems that can better interact with real-world web interfaces. 