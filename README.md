# Minimal Personal Landing Page

A simple responsive portfolio landing page built with HTML, CSS, and JavaScript.

## Run normally

Open `index.html` in your browser.

## Run with Docker

Build the image:

```bash
docker build -t personal-landing .
```

Run the container:

```bash
docker run -d -p 8080:80 --name personal-landing personal-landing
```

Then open:

http://localhost:8080

## Stop the container

```bash
docker stop personal-landing
```

## Remove the container

```bash
docker rm personal-landing
```
