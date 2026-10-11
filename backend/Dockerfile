FROM php:8.3-cli-alpine

RUN apk add --no-cache postgresql-dev git unzip \
    && docker-php-ext-install pdo pdo_pgsql

WORKDIR /app

COPY . /app

RUN chmod -R 777 /app/storage /app/bootstrap/cache \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-dev --optimize-autoloader --no-interaction

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
