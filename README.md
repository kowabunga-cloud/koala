<p align="center">
  <a href="https://www.kowabunga.cloud/?utm_source=github&utm_medium=logo" target="_blank">
    <picture>
      <source srcset="https://raw.githubusercontent.com/kowabunga-cloud/infographics/master/art/kowabunga-title-white.png" media="(prefers-color-scheme: dark)" />
      <source srcset="https://raw.githubusercontent.com/kowabunga-cloud/infographics/master/art/kowabunga-title-black.png" media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)" />
      <img src="https://raw.githubusercontent.com/kowabunga-cloud/infographics/master/art/kowabunga-title-black.png" alt="Kowabunga" width="800">
    </picture>
  </a>
</p>

# Official web Client for Kowabunga

This is **Koala**, the official web client for Kowabunga, based on AngularJS.

[![License: Apache License, Version 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://spdx.org/licenses/Apache-2.0.html)
[![Build Status](https://github.com/kowabunga-cloud/koala/actions/workflows/release.yml/badge.svg)](https://github.com/kowabunga-cloud/koala/actions/workflows/release.yml)

## Current Releases

| Project            | Release Badge                                                                                       |
|--------------------|-----------------------------------------------------------------------------------------------------|
| **Kowabunga**           | [![Kowabunga Release](https://img.shields.io/github/v/release/kowabunga-cloud/kowabunga)](https://github.com/kowabunga-cloud/kowabunga/releases) |
| **Kowabunga Koala**     | [![Kowabunga Koala Release](https://img.shields.io/github/v/release/kowabunga-cloud/koala)](https://github.com/kowabunga-cloud/koala/releases) |

## Installation

`koala` application must be served by a proper Web server. It can be installed by either:

- extracting release content in a directory of your choice (e.g. **/var/www/kowabunga**)
- using **dpkg** or **apt** command on Debian/Ubuntu, e.g.:

```console
$ apt-get install kowabunga-koala
```

Check out the [list of released versions](https://github.com/kowabunga-cloud/koala/releases).

## Configuration

Koala can be exposed through any Web server.

Here's a few to do so through Nginx, provided **Kowabunga Kahuna engine** is running on 127.0.0.1:8080 and **Koala** content being hosted in **/var/www/kowabunga** directory.

```html
server {
  server_name kowabunga.acme.com;
  server_tokens off;
  listen 443 ssl http2;

  ssl_certificate /etc/nginx/ssl/kowabunga.acme.com/cert.pem;
  ssl_certificate_key /etc/nginx/ssl/kowabunga.acme.com/key.pem;

  ssl_session_cache shared:le_nginx_SSL:10m;
  ssl_session_timeout 1d;
  ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions
  ssl_session_tickets off;

  ssl_protocols TLSv1.3;
  ssl_prefer_server_ciphers off;

  # HSTS
  add_header Strict-Transport-Security "max-age=63072000" always;

  # OCSP stapling
  ssl_stapling on;
  ssl_stapling_verify on;

  # Timeouts
  keepalive_timeout 1h;
  send_timeout 1h;
  client_body_timeout 1h;
  client_header_timeout 1h;

  etag on;

  # Error Pages
  error_page 404 /404.html;
  location = /404.html {
    root /var/www/html;
    internal;
  }

  # Koala
  root /var/www/kowabunga;
  location ~ (/index.html|/pages|/auth) {
    root /var/www/kowabunga;
    try_files $uri /index.html;
  }

  # Kowabunga Orchestrator
  location ~ (/api|/confirm|/confirmForgotPassword|/latest) {
    proxy_pass http://127.0.0.1:8080$request_uri;
    proxy_set_header Host $host;
    proxy_connect_timeout 1h;
    proxy_read_timeout 1h;
    proxy_send_timeout 1h;
  }

  location ~ (/ws) {
    proxy_pass http://127.0.0.1:8080$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }
}
```

## License

Licensed under [Apache License, Version 2.0](https://opensource.org/license/apache-2-0), see [`LICENSE`](LICENSE).

This project is based on [Akveo ngx-admin](https://github.com/akveo/ngx-admin), licensed under MIT.
