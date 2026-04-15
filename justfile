dev:
  @echo "Starting the app..."
  just dev-app

dev-app: type-gen
   watchexec -w ./app.ts -w ./@girs -w ./src -r 'ags run app.ts'

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
