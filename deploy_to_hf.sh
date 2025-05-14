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

# Set the space name
SPACE_NAME="open-captchaworld"
SPACE_PATH="$HF_USERNAME/$SPACE_NAME"

# Initialize git-lfs
git lfs install

echo "Creating Hugging Face Space: $SPACE_PATH"
# Create the space using the Hugging Face API
python3 -c "
from huggingface_hub import create_repo, HfApi
try:
    create_repo('$SPACE_PATH', repo_type='space', space_sdk='docker')
    print('Space created successfully!')
except Exception as e:
    if 'already exists' in str(e):
        print('Space already exists, continuing with deployment.')
    else:
        print(f'Error creating space: {e}')
        exit(1)
"

# Clone the space repository
echo "Cloning the space repository..."
git clone https://huggingface.co/spaces/$SPACE_PATH space_repo

# Copy all files to the space repository
echo "Copying files to the space repository..."
cp -r ./* space_repo/
cp -r ./.gitattributes space_repo/

# Navigate to the space repository
cd space_repo

# Move README_HF.md to README.md
if [ -f README_HF.md ]; then
  mv README_HF.md README.md
fi

# Initialize git-lfs in the repository
git lfs install

# Add all files to git-lfs
git lfs track "*.png"
git lfs track "*.jpg"
git lfs track "*.jpeg"
git lfs track "*.gif"
git lfs track "captcha_data/**/*"

# Add, commit, and push the changes
git add .
git commit -m "Deploy Open CaptchaWorld to Hugging Face Spaces"
git push

echo "Deployment completed! Your application should be available at:"
echo "https://huggingface.co/spaces/$SPACE_PATH"
echo
echo "Note: It may take a few minutes for the space to build and deploy." 