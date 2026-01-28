# Use PHP 8.3 Apache
FROM php:8.3-apache

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    libzip-dev \
    unzip \
    git \
    libicu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd zip bcmath intl

# 2. Enable Apache mod_rewrite
RUN a2enmod rewrite

# 3. Configure Apache DocumentRoot
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# 4. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Set working directory
WORKDIR /var/www/html

# 6. Copy ONLY composer files first (for better caching)
COPY composer.json composer.lock* ./

# 7. Install dependencies WITHOUT running any scripts/plugins
# This is the "Safe Mode" install
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts --no-plugins

# 8. Now copy the rest of the application
COPY . .

# 9. Set correct permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 10. Set dummy Environment Variables just for the build phase
# This prevents Laravel from crashing if it tries to load config
ENV APP_KEY=base64:Uww8vRnbEOrfl7DrYIoXky1/M7wSQCWuHpNHYXaAK+M=
ENV APP_ENV=production
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=:memory:

EXPOSE 80

# 11. Final Startup Command
# We run package:discover and migrations HERE (at runtime), not during build.
CMD php artisan package:discover --ansi && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    apache2-foreground