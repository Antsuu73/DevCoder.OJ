FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend ./backend
COPY index.html problems.html problem-detail.html login.html register.html profile.html tasks.html ./
COPY css ./css
COPY js ./js

WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
