FROM mcr.microsoft.com/playwright:v1.55.0-jammy

WORKDIR /app

# Copy only the files needed to run tests (no source code, no coins.csv)
COPY package.json package-lock.json ./
COPY playwright.config.js ./
COPY tests/ ./tests/
COPY utils/ ./utils/
COPY proxies.json ./
# COPY dist/ ./dist/  # commented out, dist folder not present
# Do NOT copy coins.csv

RUN npm install -D @playwright/test
RUN npm install
RUN npx playwright install
# Install Xvfb for virtual display and extra browser dependencies
RUN apt-get update && apt-get install -y xvfb fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libxcomposite1 libxdamage1 libxrandr2 xdg-utils

# Start Xvfb and run Playwright tests in headed mode with custom options
CMD ["sh", "-c", "xvfb-run --auto-servernum --server-args='-screen 0 1280x800x24' npx playwright test --headed --project=chromium --browser=chromium --timeout=60000 --reporter=html"]