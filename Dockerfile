FROM mcr.microsoft.com/playwright:v1.63.0-noble
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY bin ./bin
COPY src ./src
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
EXPOSE 3000
USER pwuser
ENTRYPOINT ["node", "bin/ca11y.js"]
CMD ["serve"]
