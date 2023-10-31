import http.server
import ssl

class SecureHTTPServer(http.server.HTTPServer):
    def __init__(self, server_address, handler, certfile, keyfile):
        super().__init__(server_address, handler)
        self.socket = ssl.wrap_socket(self.socket, certfile=certfile, keyfile=keyfile, server_side=True)

if __name__ == '__main__':
    host = 'localhost'  # Replace with your desired host
    port = 443          # Standard HTTPS port

    server_address = (host, port)
    httpd = SecureHTTPServer(server_address, http.server.SimpleHTTPRequestHandler, certfile="server.pem", keyfile="server.pem")

    print(f"Serving at https://{host}:{port}")
    httpd.serve_forever()
