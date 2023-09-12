1. Build image: docker build -t book-api .
2. Run container: docker run -p80:3000 book-api (port 80 on your device maps to port 3000 on the docker container)
3. Zap API Scan: docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://localhost:3000
