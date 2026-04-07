#!/bin/bash

# If DEBUG env var is set to "true" then set -x to enable debug mode
if [ "$DEBUG" == "true" ]; then
	set -x
	EDIFICE_CLI_DEBUG_OPTION="--debug"
else
	EDIFICE_CLI_DEBUG_OPTION=""
fi

init() {
  me=`id -u`:`id -g`
  echo "DEFAULT_DOCKER_USER=$me" > .env

  # If CLI_VERSION is empty set to latest
  if [ -z "$CLI_VERSION" ]; then
    CLI_VERSION="latest"
  fi
  # Create a build.compose.yaml file from following template
  cat <<EOF > build.compose.yaml
services:
  edifice-cli:
    image: opendigitaleducation/edifice-cli:$CLI_VERSION
    user: "$DEFAULT_DOCKER_USER"
EOF
  # Copy /root/edifice from edifice-cli container to host machine
  docker compose -f build.compose.yaml create edifice-cli
  docker compose -f build.compose.yaml cp edifice-cli:/root/edifice ./edifice
  docker compose -f build.compose.yaml rm -fsv edifice-cli
  rm -f build.compose.yaml
  chmod +x edifice
  ./edifice version $EDIFICE_CLI_DEBUG_OPTION
}

# Function to clean backend files
clean_backend() {
    echo -e '\n------------------'
    echo 'Clean before build'
    echo '------------------'
    cd backend || exit 1
    rm -rf ./.gradle
    rm -rf ./build
    rm -rf ./gradle
    rm -rf ./src/main/resources/public
    rm -rf ./src/main/resources/view
    echo 'Repo clean for build !'
    cd .. || exit 1
}

# Function to build frontend
build_frontend() {
    echo -e '\n--------------'
    echo 'Build Frontend'
    echo '--------------'
    cd frontend || exit 1
    ./build.sh installDeps build
    cd .. || exit 1
}

test_frontend() {
    echo -e '\n--------------'
    echo 'Test Frontend'
    echo '--------------'
    cd frontend || exit 1
    ./build.sh runTest
    cd .. || exit 1
}

# Function to copy frontend files to backend
copy_frontend_files() {
    echo -e '\n--------------------'
    echo 'Copy front files built'
    echo '----------------------'
    cd backend || exit 1
    cp -R ../frontend/dist/* ./src/main/resources

    # Create view directory and copy HTML files into Backend
    mkdir -p ./src/main/resources/view
    mkdir -p ./src/main/resources/public/template
    mkdir -p ./src/main/resources/public/img
    mkdir -p ./src/main/resources/public/js
    mv ./src/main/resources/*.html ./src/main/resources/view

    # Copy all public files from frontend into Backend
    cp -R ../frontend/public/* ./src/main/resources/public
    echo 'Files all copied !'
    cd .. || exit 1
}

# Function to build backend
build_backend() {
    cd backend || exit 1
    echo -e '\n-------------'
    echo 'Build Backend'
    echo '-------------'
    # cd backend || exit 1
    ./build.sh clean build
    cd .. || exit 1
}

# Function to test backend
test_backend() {
    cd backend || exit 1
    echo -e '\n-------------'
    echo 'Test Backend'
    echo '-------------'
    ./build.sh test
    cd .. || exit 1
}

# Function to clean frontend folders
clean_frontend_folders() {
    echo -e '\n-------------'
    echo 'Clean front folders'
    echo '-------------'
    rm -rf ../frontend/dist
    echo 'Folders cleaned !'
}

# Function to handle the install command
install() {
    clean_backend
    build_frontend
    copy_frontend_files
    build_backend
    clean_frontend_folders
}

# Main function to handle multiple arguments
main() {
    for arg in "$@"; do
        case "$arg" in
            install)
                install
                ;;
            init)
                init
                ;;
            buildBack)
                build_backend
                ;;
            buildFront)
                build_frontend
                ;;
            clean)
                clean_backend
                ;;
            testBack)
                test_backend
                ;;
            testFront)
                test_frontend
                ;;
            test)
                test_frontend
                test_backend
                ;;
            *)
                echo "Invalid argument: $arg"
                echo "Usage: ./build.sh [install|buildBack|buildFront|clean|testBack|testFront|test]"
                exit 1
                ;;
        esac
    done
}

# Call the main function with all arguments
main "$@"