FROM mcr.microsoft.com/playwright:v1.43.0-jammy

WORKDIR /app

# Copy only the files needed to run tests (no source code, no coins.csv)
COPY package.json package-lock.json ./
COPY playwright.config.js ./
# COPY dist/ ./dist/  # commented out, dist folder not present
# Do NOT copy coins.csv

RUN npm install --production

CMD ["npx", "playwright", "test"]