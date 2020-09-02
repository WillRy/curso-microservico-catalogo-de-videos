#!/bin/bash

chown -R www-data:www-data .

### FRONT-END ###
cd /var/www/frontend && npm install && cd ..

### BACK-END ###
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
fi
if [ ! -f ".env.testing" ]; then
  cp .env.testing.example .env.testing
fi

composer install
php artisan key:generate
php artisan migrate

php-fpm
