---
tagline: "Get a full fake REST API with zero coding in less than 30 seconds."
description: "A fake REST API powered by a simple JSON file. Great for prototyping, mocking, and tutorials."
highlights:
  - label: "License"
    value: "MIT"
  - label: "Runtime"
    value: "Node"
install: |
  npm install -g json-server
features:
  - title: "Zero-config API"
    body: "Point json-server at a JSON file and get a full REST API with routes, pagination, and filtering instantly."
  - title: "Standard REST"
    body: "GET, POST, PUT, PATCH, and DELETE work out of the box, with sensible defaults for IDs and relationships."
  - title: "Custom routes"
    body: "Define custom routes and middleware to shape the API for your prototype or demo."
links:
  - label: "Website"
    href: "https://json-server.typicode.com"
---

`json-server` watches a JSON file and exposes it as a REST API. It is a popular
choice for quick prototyping, tutorials, and front-end work that needs a
realistic backend without writing one.

## How it works

Provide a `db.json` file describing your resources:

```json
{
  "posts": [{ "id": 1, "title": "Hello" }],
  "comments": [{ "id": 1, "body": "Nice", "postId": 1 }]
}
```

Then run `json-server db.json` and fetch from `http://localhost:3000/posts`.
