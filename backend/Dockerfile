FROM oven/bun:latest AS base

ENV NODE_ENV=production
ENV BUN_INSTALL_CACHE=/bun-cache

RUN mkdir -p /app && chown -R bun:bun /app
WORKDIR /app

COPY --chown=bun:bun package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY --chown=bun:bun . .

# Runtime stage
FROM base AS runtime

USER bun

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s \
    CMD curl -f http://localhost:8080/ || exit 1

COPY --chown=bun:bun docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["bun", "run", "start"]