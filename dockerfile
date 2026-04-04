FROM nginx:alpine

# Rimuove config default
RUN rm /etc/nginx/conf.d/default.conf

# Copia config sicura
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia sito
COPY ./ /usr/share/nginx/html

# Permessi minimi
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]