# Use PHP 8.3 Apache version
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

# 2. Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# 3. Configure Apache DocumentRoot to point to Laravel's /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# 4. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Set working directory and copy code
WORKDIR /var/www/html
COPY . .

# 6. Install Laravel dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# 7. Set correct permissions for Laravel storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 8. Render uses an environment variable for PORT, but Apache defaults to 80. 
# We'll stick to 80 as Render handles the mapping.
EXPOSE 80

# 9. Optimized startup: Cache config and run migrations
CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    apache2-foreground