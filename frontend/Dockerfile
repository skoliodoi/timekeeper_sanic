#Base image
FROM node:10


# Set the working directory
WORKDIR /app/frontend

# Copy the package.json and package-lock.json
COPY package*.json ./

RUN npm install -g @vue/cli
# install project dependencies
RUN npm install

# Copy the project files
COPY . .


# Expose a port
EXPOSE 5000
