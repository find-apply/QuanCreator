#!/bin/bash
cd "$(dirname "$0")"

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Install dependencies if not present (simple check)
if ! pip show google-generativeai > /dev/null; then
    echo "Installing dependencies..."
    pip install google-generativeai python-dotenv
fi

# Run the script
# Pass all arguments to the python script
python3 ai_rebrand.py "$@"
