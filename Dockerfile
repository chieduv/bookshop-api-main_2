# Base image. The alpine versions are much smaller
FROM node:16 AS development

# Create app directory
WORKDIR /usr/app

# A wildcard is used to ensure both package.json and package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Set environment variables
ENV JWT_SECRET="dfsoidfnsodvnsdfisoidfjosifjosid"
ENV SALT_ROUNDS=10
ENV DB_URI=mongodb://mongodb:27017/bookshop
ENV PAGINATION_LIMIT=8
ENV PORT=3000

# Run lint
RUN npm run lint

# Run test
RUN npm run test


# Creates a "dist" folder with the production build
RUN npm run build

EXPOSE 3000