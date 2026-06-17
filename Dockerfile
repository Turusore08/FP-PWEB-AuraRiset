# --- AuraRiset Docker Containerization Configuration ---
FROM php:8.2-apache

# 1. Install System Dependencies & PHP Extensions for MySQL/PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Enable Apache rewrite module (for clean routing)
RUN a2enmod rewrite

# 3. Configure Document Root & AllowOverride
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Configure PHP upload limits (supports up to 10MB per file with safe overheads)
RUN echo "upload_max_filesize = 12M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 25M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

# 4. Set working directory
WORKDIR /var/www/html

# 5. Copy application source code
COPY . /var/www/html/

# 6. Initialize uploads folder and set correct ownership/permissions
RUN mkdir -p /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 /var/www/html/uploads

# 7. Expose default Apache Port
EXPOSE 80

# 8. Start Apache in foreground
CMD ["apache2-foreground"]
