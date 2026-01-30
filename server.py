#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

PORT = 8000

class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Check if it's a file request (has extension)
        if '.' in os.path.basename(path):
            # Serve the file normally
            super().do_GET()
        else:
            # Check if the path exists as a file or directory
            file_path = self.translate_path(path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                super().do_GET()
            else:
                # Serve index.html for SPA routing
                self.path = '/index.html'
                super().do_GET()

os.chdir(os.path.dirname(os.path.abspath(__file__)))
with socketserver.TCPServer(("", PORT), SPAHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    httpd.serve_forever()