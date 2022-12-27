#!/bin/bash

Green='\033[0;32m'
Color_Off='\033[0m' 

for directory in ./src/functions/* ; do (cd "$directory" && yarn install && echo "insalled packages for $directory"); done
echo "${Green}All function packages have been installed"

for directory in ./src/layers/* ; do (cd "$directory" && yarn install && echo "insalled packages for $directory"); done
echo "${Green}All layer packages have been installed"