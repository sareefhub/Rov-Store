# chmod +x scripts/run_flask.sh
# ./scripts/run_flask.sh

#!/bin/bash

export FLASK_APP=app.py
export FLASK_ENV=development
flask run
