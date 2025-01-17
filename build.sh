#!/bin/bash

# Frontend
cd frontend
#./build.sh --no-docker clean init build
./build.sh localDep installDeps build
cd ..

# Create directory structure and copy frontend dist
cd backend
cp -R ../frontend/dist/* ./src/main/resources/

# Move old ui to src/main/resources
#cp -R ../frontend/old/* ./src/main/resources/public/
#cp -R ../frontend/old/*.html ./src/main/resources/

# Create view directory and copy HTML files
mkdir -p ./src/main/resources/view
mkdir -p ./src/main/resources/public/img
mv ./src/main/resources/*.html ./src/main/resources/view
cp -R ./src/main/resources/notify ./src/main/resources/view/notify

cp -R ../frontend/public/img/* ./src/main/resources/public/img
echo 'Images copied !'

# Copy angular dist @TODO MUST DELETE THIS INSTRUCTION WHEN IN PRODUCTION
cp -R ./src/main/resources/angular-dist/* ./src/main/resources/public
mv ./src/main/resources/public/view/magneto.html ./src/main/resources/view

# Build .
#./build.sh --no-docker clean build
./build.sh clean build install publish

# Clean up - remove frontend/dist and backend/src/main/resources
rm -rf ../frontend/dist