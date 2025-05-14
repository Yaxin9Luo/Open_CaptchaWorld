#!/bin/bash
# Script to deploy Open CaptchaWorld to Hugging Face Spaces

# Check if huggingface_hub is installed
if ! pip show huggingface_hub > /dev/null; then
  echo "Installing huggingface_hub..."
  pip install huggingface_hub
fi

# Check if git-lfs is installed
if ! command -v git-lfs &> /dev/null; then
  echo "git-lfs is required but not installed."
  echo "Please install git-lfs: https://git-lfs.github.com/"
  exit 1
fi

# Get the Hugging Face username
read -p "Enter your Hugging Face username: " HF_USERNAME

# Request Hugging Face token (needed for API access)
read -s -p "Enter your Hugging Face token (https://huggingface.co/settings/tokens): " HF_TOKEN
echo

# Set the space name
SPACE_NAME="open-captchaworld"
SPACE_PATH="$HF_USERNAME/$SPACE_NAME"

# Initialize git-lfs
git lfs install

# Export token for huggingface_hub
export HUGGING_FACE_HUB_TOKEN=$HF_TOKEN

echo "Creating Hugging Face Space: $SPACE_PATH"
# Create the space using the Hugging Face API
python -c "
from huggingface_hub import create_repo, HfApi
import os
try:
    token = os.environ.get('HUGGING_FACE_HUB_TOKEN')
    if not token:
        raise ValueError('Hugging Face token not found')
    create_repo('$SPACE_PATH', repo_type='space', space_sdk='docker', token=token)
    print('Space created successfully!')
except Exception as e:
    if 'already exists' in str(e):
        print('Space already exists, continuing with deployment.')
    else:
        print(f'Error creating space: {e}')
        exit(1)
"

# Check if the space was created successfully
if [ $? -ne 0 ]; then
    echo "Failed to create or verify space. Exiting."
    exit 1
fi

# Clone the space repository with authentication
echo "Cloning the space repository..."
git clone https://oauth2:${HF_TOKEN}@huggingface.co/spaces/${SPACE_PATH} space_repo

# Check if the clone was successful
if [ ! -d "space_repo" ]; then
    echo "Failed to clone space repository. Exiting."
    exit 1
fi

# Copy all necessary files to the space repository
echo "Copying files to the space repository..."
cp -r static space_repo/
cp -r templates space_repo/
cp -r captcha_data space_repo/
cp app.py space_repo/
cp requirements.txt space_repo/
cp README_HF.md space_repo/
cp Dockerfile space_repo/
cp .gitattributes space_repo/
cp -r assets space_repo/ 2>/dev/null || true

# Navigate to the space repository
cd space_repo || { echo "Failed to change directory to space_repo"; exit 1; }

# Move README_HF.md to README.md
if [ -f README_HF.md ]; then
  mv README_HF.md README.md
fi

# Initialize git-lfs in the repository
git lfs install

# Initialize git repo if necessary
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://oauth2:${HF_TOKEN}@huggingface.co/spaces/${SPACE_PATH}
fi

# Add all files to git-lfs
git lfs track "*.png"
git lfs track "*.jpg"
git lfs track "*.jpeg"
git lfs track "*.gif"
git lfs track "captcha_data/**/*"

# Configure git user if needed
git config user.name "${HF_USERNAME}"
git config user.email "${HF_USERNAME}@example.com"

# Add, commit, and push the changes
git add -A
git commit -m "Deploy Open CaptchaWorld to Hugging Face Spaces"
git push -u origin main || git push -u origin master

echo "Deployment completed! Your application should be available at:"
echo "https://huggingface.co/spaces/$SPACE_PATH"
echo
echo "Note: It may take a few minutes for the space to build and deploy." 