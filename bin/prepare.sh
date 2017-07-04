#! /bin/bash

main() {
    rm -rf node_modules
    npm install
}

main "$@"
