# Open CaptchaWorld - Project Documentation

## 1. Project Overview

Open CaptchaWorld is a comprehensive web-based platform for testing and benchmarking Multimodal LLM Web Agents on CAPTCHA-style puzzles. It provides an environment to evaluate how artificial intelligence systems perform on various visual puzzles resembling CAPTCHAs (Completely Automated Public Turing tests to tell Computers and Humans Apart).

The project aims to:
- Provide a standardized test suite for evaluating AI visual reasoning capabilities
- Test multimodal AI systems on a variety of CAPTCHA types
- Record benchmark results for performance tracking
- Offer an extensible platform for adding new CAPTCHA types

## 2. Project Structure

```
Open CaptchaWorld/
├── app.py                    # Main Flask application
├── manage_captchas.py        # CLI tool for managing CAPTCHA data
├── rotate_images.py          # Utility for generating rotated images
├── benchmark_results.json    # Record of benchmark results
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
├── captcha_data/             # Directory containing CAPTCHA types and puzzles
│   ├── Dice_Count/           # Example: Dice counting puzzles
│   │   ├── ground_truth.json # Answers and metadata for puzzles
│   │   ├── dice1.png         # Puzzle image
│   │   └── ...               # More puzzle images
│   ├── Geometry_Click/       # Example: Geometry shape selection
│   └── ...                   # More CAPTCHA types
├── static/                   # Static assets
│   ├── css/
│   │   └── style.css         # CSS styling
│   └── js/
│       └── script.js         # Frontend JavaScript code
└── templates/                # HTML templates
    └── index.html            # Main application page
```

## 3. Dependencies

### Backend (Python)
- **Flask (2.0.1)**: Web framework for the application
- **Werkzeug (2.0.2)**: WSGI web application library
- **Flask-CORS (3.0.10)**: Extension for handling Cross-Origin Resource Sharing
- **Pillow (9.4.0)**: Python Imaging Library for image processing
- **Python 3.10+**: Required for running the application

### Frontend
- **Vanilla JavaScript**: For client-side interactions
- **HTML/CSS**: For rendering the interface

## 4. Core Components

### 4.1 Flask Application (`app.py`)

The main application server providing:

- **Web Interface**: Main route for displaying the frontend
- **API Endpoints**:
  - `/api/get_puzzle`: Returns a random CAPTCHA puzzle
  - `/api/check_answer`: Validates user answers
  - `/api/get_ground_truth`: Returns solution data (for debugging)
  - `/api/benchmark_results`: Records benchmark results
  - `/api/types`: Lists available CAPTCHA types

#### Key Functions:
- `get_captcha_types()`: Retrieves available CAPTCHA types
- `load_ground_truth()`: Loads solution data for a specific CAPTCHA type
- `get_puzzle()`: Selects and returns a random puzzle
- `check_answer()`: Validates user answers against ground truth

### 4.2 CAPTCHA Management (`manage_captchas.py`)

CLI tool for managing CAPTCHA data:

#### Key Classes:
- `CaptchaManager`: Handles operations on CAPTCHA types and puzzles

#### Key Methods:
- `list_captcha_types()`: Lists all available CAPTCHA types
- `add_captcha_type()`: Creates a new CAPTCHA type directory
- `add_puzzle()`: Adds a new puzzle to a CAPTCHA type
- `list_puzzles()`: Lists all puzzles for a specific type

### 4.3 Frontend (`templates/index.html` and `static/js/script.js`)

The client-side application for interacting with CAPTCHA puzzles:

#### Key Components:
- **Puzzle Container**: Displays the current CAPTCHA puzzle
- **Input Interface**: Changes based on puzzle type (text, clicks, rotation, etc.)
- **Result Display**: Shows feedback after submission
- **Benchmark Stats**: Tracks user performance

#### Key Functions in JavaScript:
- `loadNewPuzzle()`: Fetches and displays a new CAPTCHA puzzle
- `submitAnswer()`: Sends user's answer to the server for validation
- `updateStats()`: Updates the benchmark statistics display
- Specialized handlers for each puzzle type (rotation, slider, grids, etc.)

## 5. CAPTCHA Types

The platform includes 20 different CAPTCHA types, each with unique interaction patterns:

| Type | Description | Input Method |
|------|-------------|-------------|
| Dice_Count | Sum numbers on dice | Number input |
| Geometry_Click | Click on a specific geometric shape | Click |
| Rotation_Match | Rotate object to match reference | Rotation controls |
| Slide_Puzzle | Drag component to target position | Drag and drop |
| Unusual_Detection | Identify unusual items | Multi-select grid |
| Image_Recognition | Select images matching description | Image grid selection |
| Bingo | Swap images to create matching line | Cell swapping |
| Image_Matching | Match similar images | Arrow navigation |
| Patch_Select | Select grid squares with objects | Grid selection |
| Dart_Count | Choose image with correct dart sum | Arrow navigation |
| Object_Match | Match number of objects | Arrow navigation |
| Select_Animal | Identify a specific animal | Grid selection |
| Coordinates | Move object to coordinates | Arrow navigation |
| Path_Finder | Navigate to target position | Arrow navigation |
| Place_Dot | Place dot at specific location | Click |
| Connect_icon | Connect matching icons | Arrow navigation |
| Click_Order | Click items in sequence | Ordered clicks |
| Hold_Button | Hold button for duration | Button hold |
| Misleading_Click | Click correct area avoiding distractions | Click |
| Pick_Area | Select a specific area | Click |

## 6. Data Structure

### 6.1 CAPTCHA Type Directory

Each CAPTCHA type has its own directory containing:
- Puzzle images
- `ground_truth.json` file with solution data

### 6.2 Ground Truth Format

The ground truth files follow this general structure:

```json
{
  "puzzle_file.png": {
    "answer": "solution data",
    "prompt": "Instructions for the user",
    "description": "Description of the puzzle"
  }
}
```

For specialized types, additional fields are included:

**Example for Rotation_Match**:
```json
{
  "puzzle_cat_direction_1.json": {
    "reference_image": "direction_1.png",
    "object_base_image": "cat.png",
    "correct_angle": 90,
    "prompt": "Use the arrows to rotate the object...",
    "description": "Rotation puzzle requiring alignment...",
    "answer": 90
  }
}
```

## 7. Function Call Logic

### 7.1 Puzzle Loading Flow

1. User visits the application or requests a new puzzle
2. Frontend JavaScript calls `getPuzzle()` which makes an AJAX request to `/api/get_puzzle`
3. Server selects a random puzzle based on type (or randomly from all types)
4. Server returns puzzle metadata including type, image path, prompt, and input type
5. Frontend renders the appropriate interface based on puzzle type
6. For complex puzzles, specialized setup functions are called (e.g., `setupRotationControls()` for rotation puzzles)

### 7.2 Answer Submission Flow

1. User interacts with the puzzle and submits an answer
2. Frontend JavaScript calls `submitAnswer()` which makes an AJAX request to `/api/check_answer`
3. Server validates the answer against the ground truth data
4. Server returns validation result
5. Frontend displays feedback and updates benchmark statistics
6. Frontend automatically loads a new puzzle

## 8. Important File Localization

### 8.1 Core Application Files

- **Main Application**: `app.py`
- **CAPTCHA Management**: `manage_captchas.py`
- **Image Rotation Utility**: `rotate_images.py`
- **Benchmark Results**: `benchmark_results.json`

### 8.2 Frontend Files

- **Main HTML Template**: `templates/index.html`
- **CSS Styles**: `static/css/style.css`
- **JavaScript Logic**: `static/js/script.js`

### 8.3 CAPTCHA Data

- **CAPTCHA Type Directories**: `captcha_data/<type_name>/`
- **Ground Truth Files**: `captcha_data/<type_name>/ground_truth.json`
- **Puzzle Images**: `captcha_data/<type_name>/<puzzle_file>.png`

## 9. Extension Points

The system is designed to be extensible:

### 9.1 Adding New CAPTCHA Types

1. Create a new directory in `captcha_data/`
2. Add puzzle images to the directory
3. Create a `ground_truth.json` file with solution data
4. Add handling logic in `app.py`:
   - Add prompt generation in `get_puzzle()`
   - Add input type determination
   - Add answer validation in `check_answer()`
5. Add frontend rendering logic in `script.js`

### 9.2 Adding New Puzzles

Use the CLI tool:
```bash
python manage_captchas.py add-puzzle <type_name> <image_path> <answer> --description "Description"
```

## 10. API Endpoints Index

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/` | GET | Main web interface | None |
| `/captcha_data/<type>/<file>` | GET | Serves CAPTCHA images | `type`, `file` |
| `/api/get_puzzle` | GET | Returns a puzzle | `type`, `random`, `debug_type` |
| `/api/check_answer` | POST | Validates answers | `puzzle_type`, `puzzle_id`, `answer` |
| `/api/get_ground_truth` | POST | Returns ground truth | `puzzle_type`, `puzzle_id` |
| `/api/benchmark_results` | POST | Records results | `puzzle_type`, `puzzle_id`, `answer`, `correct` |
| `/api/types` | GET | Lists CAPTCHA types | None | 