# Running the bot:
Configure the .env file using the .env.example as a template, then run `node main.js`

To setup a bot on discord, follow the instructions here:
https://www.freecodecamp.org/news/create-a-discord-bot-with-python/

The token that is obtained from the instructions will need to be added into the .env file.

To obtain the discord channel ID that you wish for the bot to interact with, enable discord developer mode:
https://discord.com/developers/docs/game-sdk/store

Afterwards, you should be able to right-click on a discord channel and copy it's ID.

Lastly, ensure that your bot has the message content intent enabled and the appropriate permissions when it is hooked up to discord.

# Database Connection
The discord bot uses a MySQL connection and will require those details on the .env file.

A RDS on AWS can be setup for this purpose, or with the platform of your choosing.

# Bot Hosting:
1. Run the script below after SSHing into your AWS instance:

```
sudo yum install
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
sudo yum install git
git clone https://github.com/saucerswap-org/saucerswap-faucetbot.git
```

2. Configure .env file in development, or the secrets via secrets manager in production

3. Write your systemd file using `sudo nano /etc/systemd/system/faucetbot.service`

4. Inside the service, input the following:

```
[Unit]
Description=Faucetbot Service
After=multi-user.target

[Service]
ExecStart=/home/ec2-user/.nvm/versions/node/v17.5.0/bin/node /home/ec2-user/saucerswap-faucetbot/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ss-server
User=ec2-user
EnvironmentFile=/home/ec2-user/saucerswap-faucetbot/.env

[Install]
WantedBy=multi-user.target
```

5. Run the following commands:

```
sudo systemctl enable faucetbot.service
sudo systemctl start faucetbot.service
```
