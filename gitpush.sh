#!/bin/bash

git init
git add .

echo 'Enter the commit message:'
read commitMessage

git commit -m "$commitMessage"

git push

echo "Successfully Uploaded!"

read