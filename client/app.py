import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def hello():
    # Print the current working directory for debugging purposes
    print("Current working directory:", os.getcwd())
    
    # Render the index.html template
    return render_template('index.html')

if __name__ == '__main__':
    # Run the Flask app in debug mode
    app.run(port=5000, debug=True)  # Listen on all interfaces
