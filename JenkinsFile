#!/usr/bin/env groovy

pipeline {
  agent any

  stages {
    stage('Frontend') {
      steps {
        dir('frontend') {
          sh './build.sh clean init build'
        }
      }
    }
    
    stage('Backend') {
      steps {
        dir('backend') {
          sh 'cp -R ../frontend/old/* ./src/main/resources/public/'
          sh 'cp -R ../frontend/old/*.html ./src/main/resources/'
          sh 'cp -R ../frontend/dist/* ./src/main/resources/'
          sh 'mkdir -p ./src/main/resources/view'
          sh 'mv ./src/main/resources/*.html ./src/main/resources/view'
          sh 'cp -R ./src/main/resources/notify ./src/main/resources/view/notify'
          sh './build.sh clean build publish'
          sh 'rm -rf ../frontend/dist'
        }
      }
    }
  }
}