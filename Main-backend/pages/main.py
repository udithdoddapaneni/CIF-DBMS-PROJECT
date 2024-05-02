import http.server
import socketserver

# Set the directory containing your HTML file
directory = "."  # Change this to the directory containing your HTML file

# Set the port number you want to use
port = 8000  # You can change this to any available port number

# Define the Handler class
class CustomHandler(http.server.SimpleHTTPRequestHandler):
    # Disable logging messages to the console
    def log_message(self, format, *args):
        return

# Create a TCP server
with socketserver.TCPServer(("", port), CustomHandler) as httpd:
    print("Serving at port", port)
    # Serve indefinitely
    httpd.serve_forever()
