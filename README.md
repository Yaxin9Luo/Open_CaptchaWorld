# 🧩 Open CaptchaWorld

<div align="center">
  
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![Flask](https://img.shields.io/badge/flask-2.0.1-green)
![License](https://img.shields.io/badge/license-MIT-orange)

</div>

A comprehensive web-based platform for testing and benchmarking Multimodal LLM Web Agents on CAPTCHA-style puzzles. This project provides an environment to evaluate how artificial intelligence systems perform on a variety of visual puzzles resembling CAPTCHAs (Completely Automated Public Turing tests to tell Computers and Humans Apart). 

Based on our research paper: **"Open CaptchaWorld: A Comprehensive Test Suite for LLM Web Agents"**

<div align="center">
  <img src="https://github.com/username/CAPTCHAs/raw/main/static/captcha_demo.gif" alt="CAPTCHA Demo" width="600px">
</div>

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🎬 Demo](#-demo)
- [🎯 Motivation & Contributions](#-motivation--contributions)
- [✨ Features](#-features)
- [🏗 Project Structure](#-project-structure)
- [🧩 CAPTCHA Types](#-captcha-types)
- [📊 Benchmark Results](#-benchmark-results)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [📝 Usage](#-usage)
  - [Web Interface](#web-interface)
  - [API Endpoints](#api-endpoints)
  - [Managing CAPTCHAs](#managing-captchas)
- [🔧 Extending the System](#-extending-the-system)
  - [Adding New CAPTCHA Types](#adding-new-captcha-types)
  - [Adding New Puzzles](#adding-new-puzzles)
- [🗺️ Roadmap](#-roadmap)
- [👥 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Overview

Open CaptchaWorld enables systematic evaluation of multimodal AI capabilities through CAPTCHA-style puzzles. It provides a controlled environment for testing how well LLM Web Agents can:

- Perceive and understand visual elements
- Extract relevant information from images
- Generate appropriate responses to visual puzzles
- Interact with web interfaces to solve tasks

The system includes a variety of CAPTCHA types ranging from basic (count dice) to complex (rotate objects to match reference direction), providing a comprehensive assessment of AI visual reasoning capabilities.

## 🎬 Demo

Watch these demonstration videos to see Open CaptchaWorld in action:

### Demo 1: Human Solving Demo



https://github.com/user-attachments/assets/c3b8ccca-a817-45f7-967a-64566cb32f26



This video demonstrates a human solving various CAPTCHA types including all 20 types of our captchas. It shows how users can interact with these puzzles and how the system validates their responses.

### Demo 2: Browser Use Agent Solving Demo (LLM is gpt-4.1-2025-04-14)


https://github.com/user-attachments/assets/3f8f9a9c-8071-47cb-a864-dd0bd5b3b95c


This video showcases LLM Web Agents to solve all our 20 types of captchas. 

## 🎯 Motivation & Contributions

### Why We Built Open CaptchaWorld

Modern web interfaces increasingly rely on CAPTCHA systems to differentiate between human users and automated systems. This presents a significant challenge for LLM Web Agents attempting to navigate and interact with the real world:

1. **Real-World Deployment Barrier:** Web Agents frequently get stuck on websites that include CAPTCHA tests, significantly slowing down their deployment for everyday real-world usage. Without the ability to solve these challenges, LLM Web Agents cannot fully realize their potential as digital assistants.

2. **Outdated Evaluation Methods:** Many traditional CAPTCHAs can now be easily solved by specialized detection and classification models, making them poor benchmarks for evaluating the complete reasoning, visual understanding, and interaction capabilities of modern Web Agents.

### Our Contributions

Open CaptchaWorld addresses these challenges through several key contributions:

1. **Comprehensive CAPTCHA Collection:** We have collected and implemented an extensive set of modern CAPTCHA types specifically designed to test the multi-modal reasoning capabilities required by Web Agents.

2. **First Open-Source Benchmark:** To our knowledge, this is the first open-sourced CAPTCHA benchmark and dataset specifically tailored for Web Agents, providing a standardized environment for researchers and developers.

3. **Training Data Generation:** Beyond evaluation, Open CaptchaWorld serves as a platform for generating high-quality training data that can improve Web Agents' ability to handle CAPTCHA challenges.

4. **Real-World Simulation:** Our platform closely emulates actual web interfaces, enabling more realistic testing of Web Agents' capabilities to navigate websites protected by CAPTCHA mechanisms.

By making Open CaptchaWorld available to the research community, we aim to accelerate progress in developing more capable, adaptable, and useful Web Agents that can seamlessly interact with today's web interfaces.


## ✨ Features

- **20 CAPTCHA Types**: Diverse set of visual puzzles to test different capabilities
- **Web Interface**: Clean, intuitive interface for human or AI interaction
- **API Endpoints**: Programmatic access to puzzles and verification
- **Benchmark Tracking**: Automatic recording of performance metrics
- **CLI Management**: Tools for managing CAPTCHA puzzles and types
- **Extensible Architecture**: Easy addition of new puzzle types

## 🏗 Project Structure


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


## 🧩 CAPTCHA Types

Open CaptchaWorld includes 20 distinct CAPTCHA types, each testing different visual reasoning capabilities:

1. **Dice_Count**: Count and sum numbers on dice
2. **Geometry_Click**: Click on a specific geometric shape
3. **Rotation_Match**: Rotate an object to match a reference orientation
4. **Slide_Puzzle**: Drag a component to a target position
5. **Unusual_Detection**: Identify unusual items in a grid
6. **Image_Recognition**: Select images matching a description
7. **Bingo**: Swap positions to create a line of matching images
8. **Image_Matching**: Match similar images
9. **Patch_Select**: Select grid squares containing specific objects
10. **Dart_Count**: Select an image where darts sum to a target number
11. **Object_Match**: Match the number of objects to a reference
12. **Select_Animal**: Identify a specific animal in a grid
13. **Coordinates**: Move an object to specified coordinates
14. **Path_Finder**: Navigate to a target position
15. **Place_Dot**: Place a dot at a specific location
16. **Connect_icon**: Connect matching icons
17. **Click_Order**: Click items in a specific sequence
18. **Hold_Button**: Hold a button for a specified duration
19. **Misleading_Click**: Click in the correct area avoiding distractions
20. **Pick_Area**: Select a specific area in an image

Each type has its own directory in `captcha_data/` containing puzzle images and a `ground_truth.json` file with solutions.

## 📊 Benchmark Results

The system records benchmark results in `benchmark_results.json` with each entry containing:
- Puzzle type
- Puzzle ID
- User's answer
- Correct answer
- Boolean indicating correctness
- Timestamp

This data can be used to analyze performance across different puzzle types and track improvement over time.


## 🚀 Getting Started

### Prerequisites

- Python 3.6 or higher
- pip (Python package installer)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/Open-CaptchaWorld.git
   cd Open-CaptchaWorld
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

Start the Flask application:
```bash
python app.py
```

The application will be available at: `http://localhost:5001`

## 📝 Usage

### Web Interface

The web interface allows interaction with the CAPTCHA puzzles:

1. Navigate to `http://localhost:5001`
2. A random CAPTCHA puzzle will be displayed
3. Read the instructions and solve the puzzle
4. Submit your answer
5. The system will verify your answer and display the result
6. A new puzzle will be automatically loaded

### API Endpoints

The platform provides the following API endpoints:

- **GET /** - Serves the main web interface
- **GET /captcha_data/<captcha_type>/<filename>** - Serves CAPTCHA images
- **GET /api/get_puzzle** - Returns a random CAPTCHA puzzle
  - Optional query params: `type`, `random`, `debug_type`
- **POST /api/check_answer** - Validates user answers
  ```json
  {
    "puzzle_type": "Dice_Count",
    "puzzle_id": "dice10.png",
    "answer": 73
  }
  ```
- **POST /api/get_ground_truth** - Returns ground truth data for debugging
- **POST /api/benchmark_results** - Records benchmark results
- **GET /api/types** - Lists available CAPTCHA types

### Managing CAPTCHAs

The `manage_captchas.py` script provides a CLI for managing CAPTCHA data:

List all CAPTCHA types:
```bash
python manage_captchas.py list-types
```

Add a new CAPTCHA type:
```bash
python manage_captchas.py add-type Emoji_Match
```

Add a new puzzle:
```bash
python manage_captchas.py add-puzzle Dice_Count path/to/image.png 42
```

List puzzles for a specific type:
```bash
python manage_captchas.py list-puzzles Dice_Count
```

## 🔧 Extending the System

### Adding New CAPTCHA Types

1. Create a new directory under `captcha_data/`
   ```bash
   mkdir captcha_data/New_Type
   ```

2. Add puzzle images to the directory

3. Create a `ground_truth.json` file with solutions:
   ```json
   {
     "puzzle1.png": {
       "answer": "solution",
       "description": "Puzzle description"
     }
   }
   ```

4. Add handling logic in `app.py`:
   - Add prompt generation in `get_puzzle()`
   - Add input type determination
   - Add answer validation in `check_answer()`

5. Add frontend rendering logic in `script.js`

### Adding New Puzzles

Use the CLI tool:
```bash
python manage_captchas.py add-puzzle <type_name> <image_path> <answer> --description "Optional description"
```

Or use the `rotate_images.py` utility for rotation puzzles:
```bash
python rotate_images.py set reference.png object.png 90 --output-dir captcha_data/Rotation_Match
```
## 🗺️ Future Plan

We're continuously working to improve Open CaptchaWorld. Here's what's on our roadmap:
- [x] Add 20 types of Modern Captcha puzzles for Web Agents
- [x] TestBed for evaluating and data collecting
- [x] Web Interface for Open CaptchaWorld
- [x] Make Open CaptchaWorld More easy to use, can just deploy locally and add address to prompt
- [ ] Add more CAPTCHA puzzle types to cover a wider range of visual reasoning challenges
- [ ] Increase the number of puzzles in each CAPTCHA type to ensure comprehensive testing
- [ ] Explore parametric approaches for CAPTCHA-solving agents
- [ ] Investigate non-parametric methods for solving complex visual puzzles


As we complete each item, we'll mark the corresponding checkbox to track our progress. We welcome collaboration on any of these initiatives. If you're interested in contributing to a specific roadmap item, please check our issues page or contact the project maintainers.

## 👥 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Built with ❤️ for advancing Web LLM Agents research</p>
</div> 
