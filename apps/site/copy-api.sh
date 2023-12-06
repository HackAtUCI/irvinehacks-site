# Copy API files from apps/api
cp -R ../api/{requirements.txt,configuration} .
cp -R ../api/src/ src/api/
cp ../api/index.py api/index.py
