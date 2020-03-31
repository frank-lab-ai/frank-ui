FROM nginx
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y build-essential
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash - 
RUN apt-get install -y nodejs
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/$
RUN apt-get update && apt-get install -y yarn
COPY entrypoint.sh /
RUN chmod 754 /entrypoint.sh
ENTRYPOINT ["sh", "./entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]