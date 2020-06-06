FROM node:12

# set ownership on them to our node user
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# switch the user to node before running npm install
USER node

#RUN npm install
# If you are building your code for production
RUN npm install --only=production --no-optional && npm cache clean --force

# Bundle app source and ensure that the application files are owned by the non-root node user
COPY --chown=node:node . .

EXPOSE 8080

CMD [ "npm", "start" ]