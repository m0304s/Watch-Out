FROM nginx:1.25-alpine

ARG ENV

RUN rm -f /etc/nginx/conf.d/*.conf
COPY docker/edge/nginx/${ENV}.conf /etc/nginx/nginx.conf

HEALTHCHECK --interval=10s --timeout=3s --retries=12 CMD \
  wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

EXPOSE 80 443
CMD ["nginx","-g","daemon off;"]
