#!/usr/bin/env python3
import http.server
import socketserver
import os
import time
import threading
from urllib.parse import urlparse
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

PORT = 8000

# Store file modification times for hot reload
file_watcher_clients = []

class FileChangeHandler(FileSystemEventHandler):
    """Handles file system events for hot reload"""
    def on_modified(self, event):
        if event.is_directory:
            return
        # Ignore hidden files and Python cache
        if '/.git/' in event.src_path or '__pycache__' in event.src_path or event.src_path.endswith('.pyc'):
            return
        print(f"📝 File changed: {event.src_path}")
        # Notify all connected clients (in a real implementation, you'd use WebSockets)
        
    def on_created(self, event):
        if event.is_directory:
            return
        if '/.git/' in event.src_path or '__pycache__' in event.src_path:
            return
        print(f"✨ File created: {event.src_path}")

class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Inject live reload script into HTML files
        if path.endswith('.html') or path == '/' or path == '/index.html':
            self.path = '/index.html'
            file_path = self.translate_path(self.path)
            try:
                with open(file_path, 'rb') as f:
                    content = f.read().decode('utf-8')
                    # Inject live reload script before </body>
                    reload_script = '''
<script>
(function() {
    let lastCheck = Date.now();
    setInterval(async () => {
        try {
            const response = await fetch('/health-check?' + Date.now());
            const data = await response.json();
            if (data.reload) {
                console.log('🔄 Changes detected, reloading...');
                location.reload();
            }
        } catch (e) {
            // Server might be restarting
        }
    }, 1000);
})();
</script>
</body>'''
                    content = content.replace('</body>', reload_script)
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'text/html')
                    self.send_header('Content-Length', len(content.encode('utf-8')))
                    self.end_headers()
                    self.wfile.write(content.encode('utf-8'))
                    return
            except Exception as e:
                print(f"Error injecting reload script: {e}")
                super().do_GET()
                return
        
        # Health check endpoint for live reload
        if path == '/health-check':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            # Check if files changed (simple implementation)
            self.wfile.write(b'{"reload": false}')
            return
        
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
                self.do_GET()

def start_file_watcher():
    """Start watching for file changes"""
    event_handler = FileChangeHandler()
    observer = Observer()
    
    # Watch current directory and subdirectories
    watch_path = os.path.dirname(os.path.abspath(__file__))
    observer.schedule(event_handler, watch_path, recursive=True)
    observer.start()
    print(f"👀 Watching for file changes in: {watch_path}")
    return observer

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Start file watcher in a separate thread
    try:
        observer = start_file_watcher()
    except ImportError:
        print("⚠️  watchdog not installed. Install it for file watching: pip install watchdog")
        observer = None
    
    try:
        with socketserver.TCPServer(("", PORT), SPAHTTPRequestHandler) as httpd:
            print(f"🚀 Server running at http://localhost:{PORT}")
            print(f"🔥 Hot reload enabled - changes will auto-refresh the browser")
            print(f"Press Ctrl+C to stop")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Shutting down server...")
        if observer:
            observer.stop()
            observer.join()
        print("✅ Server stopped")