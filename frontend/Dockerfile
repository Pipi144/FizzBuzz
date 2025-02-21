ARG NODE_VERSION=22.11.0
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

################################################################################
# Install dependencies
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

################################################################################
# Build the application
FROM deps AS build

COPY . .

# Set environment variable for build-time API URL
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV BUILD_STANDALONE true


RUN npm run build

################################################################################
# Run the production build
FROM base AS final

ENV NODE_ENV production

# Run as a non-root user
USER node

COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/next.config.ts ./next.config.ts

# 🔑 Expose port 3000 instead of 5000
EXPOSE 3000

# Start the Next.js application (defaults to port 3000)
CMD ["npm", "start"]