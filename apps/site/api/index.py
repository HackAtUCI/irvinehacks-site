"""
This is an empty source file necessary for Vercel to recognize the existence of
the Serverless Function for the backend API as defined in `vercel.json`.
The contents will be replaced by that of `apps/api/index.py` during Turbo build.
"""
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write('Hello, world!'.encode('utf-8'))
        return
