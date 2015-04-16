#/bin/env sh
for entry in "plugins"/*
do
    cd $entry
    npm i
    cd ../../
done
