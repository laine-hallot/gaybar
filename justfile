dev:
    @echo "Starting the app..."
    just dev-app

dev-app: type-gen
    watchexec -w ./style.scss -w ./app.ts -w ./@girs -w ./src -r 'ags run app.ts'

build: type-gen
    mkdir -p result/bin
    ags bundle app.ts result/bin/gaybar -d "SRC='result/share'"

type-gen:
    #!/usr/bin/env bash
    if [ -d "./@girs/" ]; then
    echo "Types Directory exists, skipping type gen..."
    else
    echo "Generating types..."
    ags types --directory .
    fi

clean-type-gen:
    rm -rf ./@girs
