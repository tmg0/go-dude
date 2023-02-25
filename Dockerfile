FROM nginx
COPY dist /var/www/html/
COPY nginx.conf /etc/nginx.conf