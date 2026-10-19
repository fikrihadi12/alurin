FROM nginx:alpine

# Hapus halaman default nginx
RUN rm -rf /usr/share/nginx/html/*

# Pasang konfigurasi kustom nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin aset frontend ke web root nginx
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
