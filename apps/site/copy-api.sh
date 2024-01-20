# Copy API files from apps/api
cp -R ../api/configuration .
cp -R ../api/src/ src/api/
cp ../api/index.py api/index.py

# Copy Python libraries installed by during turbo build in apps/api
# instead of having Vercel install using requirements.txt
cp -R ../api/lib/* .
