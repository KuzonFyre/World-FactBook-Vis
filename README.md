# World-FactBook-Vis
A visualization of the World Factbook data


How to start a HTTP Server: 
    run the command: 
        python3 -m http.server
        
How to start the HTTPS Server:
    use this command to create a PEM file for HTTPS:
        openssl req -new -x509 -keyout server.pem -out server.pem -days 365

    Now, run the server using elevated prompt 
        sudo python3 server.py
    You'll then need to enter in your PEM phrase

