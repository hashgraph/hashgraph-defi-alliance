import * as config from "./utils/config.js";
import fetch from "node-fetch";
import db from "./configs/db.js";
import cron from "node-cron";
import { Client as DiscordClient, Intents } from "discord.js";
import {
  AccountBalanceQuery,
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  TransferTransaction,
} from "@hashgraph/sdk";

const faucetBot = new DiscordClient({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

const operatorId = AccountId.fromString(config.TREASURY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(config.TREASURY_PRIVATE_KEY);
const treasuryId = AccountId.fromString(config.TREASURY_ACCOUNT_ID);
const treasuryKey = PrivateKey.fromString(config.TREASURY_PRIVATE_KEY);
const client = Client.forName(config.HEDERA_NETWORK).setOperator(
  operatorId,
  operatorKey
);
const tokenId = config.TOKEN_ID;
const tokenName = config.TOKEN_NAME;
const accountIdsBeingProcessed = new Set();
const amount = 0.11;
const decimals = 6;

faucetBot.on("ready", async () => {
  console.log(`Logged in as ${faucetBot.user.tag}!`);
  cron.schedule(
    "0 */8 * * *",
    async () => {
      db.execute(`TRUNCATE TABLE faucet_tracker`);
      faucetBot.channels.cache
        .get(config.DISCORD_CHANNEL)
        .send("Faucet is being reset...!");
    },
    {
      scheduled: true,
      timezone: "Atlantic/St_Helena",
    }
  );
});

faucetBot.on("messageCreate", async (msg) => {
  // If the author is the bot, return
  if (!msg) return;
  if (msg.author.bot) return;

  // split message into words, distinguish between command & parameters
  const words = msg.content.split(" ").filter((str) => str.length);
  let cmd;
  try {
    cmd = words[0].toLowerCase();
  } catch (e) {
    console.debug("Failed to retrieve command!");
    return;
  }
  const params = words.slice(1);
  const channel = faucetBot.channels.cache.get(config.DISCORD_CHANNEL);
  let userMsg = "";
  try {
    userMsg = await channel.messages.fetch(msg.id);
  } catch (e) {
    console.debug("Failed to retrieve user message!");
    return;
  }
  const time = getTimeTilReset();

  // switch-case on commands
  switch (cmd) {
    case "!manual":
      const response = `Faucet Bot is here to dispense *$${tokenName}!*

      Currently ${tokenName} is dispensed in 8 hour intervals at the fixed rate of 0.33
      
      To get $${tokenName}, first associate your account with token ID: ${tokenId}
      Then proceed to run the command: **!sauceme <INSERT_ACCOUNT_ID>**

      Please note that amounts and the schedule may change!

      For further assistance, contact a SaucerSwap Team Member
            
      **Remember: Faucet Bot and the SaucerSwap team will never message you directly without your express permission**
      Keep your guard up! You never know what dangers lurk in the vastness of the cosmos...`.replace(
        /  +/g,
        ""
      );
      channel.send(response);
      break;
    case "!sparechange": {

      if (params.length > 1) {
        replyThenDelete(
          `Please follow the format: **!sparechange <INSERT_ACCOUNT_ID>**`,
          userMsg
        );
        break;
      }

      const accountId = params[0];

      // Check against discord's 2000 char limit
      if (!accountId || accountId.length > 32) {
        replyThenDelete(
          `That accountId doesn't look right... try again?`,
          userMsg
        );
        break;
      }

      // regex check for accountId
      if (!/^\d{1}\.\d{1}\.\d{2,16}$/.test(accountId)) {
        replyThenDelete(
          `I don't think you gave me a valid account ID`,
          userMsg
        );
        break;
      }

      // regex check for accountId
      if (treasuryId.toString() == accountId) {
        replyThenDelete(`I don't need no dang spare change!`, userMsg);
        break;
      }

      // Query faucet_tracker table to see if accountId already pulled from the faucet
      const result = await db.query(
        `SELECT * FROM charity_tracker WHERE accountId=?`,
        [accountId]
      );

      if (result[0].length) {
        replyThenDelete(
          `Your account already received its allotment of HBARs - try swapping for more.`,
          userMsg
        );
        break;
      }

      // check if accountId is currently being processed
      if (accountIdsBeingProcessed.has(accountId)) {
        replyThenDelete(`Quit your damn spamming! D:<`, userMsg);
        break;
      }

      // add account to set of accountIds being processed
      // remove accountId before every break statement
      accountIdsBeingProcessed.add(accountId);

      const data = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd`
      ).then((res) => res.json());
      const { usd: hbarPrice } = data["hedera-hashgraph"];
      const hbarPayout = (0.12 / hbarPrice).toFixed(4);
      if (!hbarPrice || !hbarPayout) {
        replyThenDelete(`Something funny's going on with the HBAR price...! Try again?`, userMsg);
        accountIdsBeingProcessed.delete(accountId);
      }

      try {
        const tx = new TransferTransaction()
          .addHbarTransfer(operatorId, new Hbar(-hbarPayout))
          .addHbarTransfer(accountId, new Hbar(hbarPayout));
        const txResponse = await tx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        // if tx success, insert values into table...
        if (receipt.status._code == 22) {
          await db.query(`INSERT INTO charity_tracker (accountId) VALUE (?);`, [accountId]);
          console.debug(
            `${hbarPayout} HBARs sent to ${accountId}`
          );
          replyThenDelete("**Success!** Use your new HBARs:\n"
          +"\n1. Associate WHBAR (TokenID 0.0.1062664)"
          +"\n2. Navigate to <https://saucerswap.finance> and swap your existing tokens for HBAR (this will use the WHBAR associated in Step 1)"
          +"\n3. Use the HBAR you got from Step 2 to fuel your journey on SaucerSwap!\n"
          +"\nThe HBAR you received will pay for the association fee, network fee, and gas fee incurred by the process outlined above.\n"
          +"\nWelcome to SaucerSwap! <:SAUCE:946907336742682624>", userMsg);
          accountIdsBeingProcessed.delete(accountId);
        } else {
          throw new Error(`Tx receipt status is not a success!`);
        }
      } catch (e) {
        replyThenDelete(
          `HBARs couldn't be dispensed!`,
          userMsg
        );
        console.debug(`Failed to dispense ${hbarPayout} HBARs for: ${accountId}`);
        console.debug(e);
        accountIdsBeingProcessed.delete(accountId);
      }
      break;
    }
    case "!saucewen":
      channel.send(
        `The next reset is in ${time.hrs} hours and ${time.mins} minutes!`
      );
      break;
    case "!sauceme":
      if (
        (time.hrs == 0 && time.mins <= 1) ||
        (time.hrs == 8 && time.mins == 0)
      ) {
        const response =
          `Resetting... It's like... pressing a spring cleaning button.
        You press it and I gotta come SAUCE everyone here. See?
        
        Also you gotta check your Hashpack after you get SAUCE'd.
        If you don't check, it's the same as not SAUCE-ing up.

        Well, OK... That last part? I just added that.
        Anyway, gimme a minute or two. Almost done...`.replace(/  +/g, "");
        replyThenDelete(response, userMsg);
        break;
      }

      if (params.length > 1) {
        replyThenDelete(
          `Please follow the format: **!sauceme <INSERT_ACCOUNT_ID>**`,
          userMsg
        );
        break;
      }

      const accountId = params[0];

      // Check against discord's 2000 char limit
      if (!accountId || accountId.length > 32) {
        replyThenDelete(
          `That accountId doesn't look right... try again?`,
          userMsg
        );
        break;
      }

      // regex check for accountId
      if (!/^\d{1}\.\d{1}\.\d{2,16}$/.test(accountId)) {
        replyThenDelete(
          `I don't think you gave me a valid account ID`,
          userMsg
        );
        break;
      }

      // regex check for accountId
      if (treasuryId.toString() == accountId) {
        replyThenDelete(`SAUCE me?! Well SAUCE you!`, userMsg);
        break;
      }

      // check if accountId is currently being processed
      if (accountIdsBeingProcessed.has(accountId)) {
        replyThenDelete(`Quit your damn spamming! D:<`, userMsg);
        break;
      }

      // add account to set of accountIds being processed
      // remove accountId before every break statement
      accountIdsBeingProcessed.add(accountId);

      // check if accountId has token associated
      const balanceCheckTx = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client)
        .catch((e) => {
          const errorCode = e.status?._code;
          let response;
          if (errorCode == 15) {
            response = `That account doesn't exist!`;
            replyThenDelete(response, userMsg);
          } else {
            response = `Balance query on the account failed - try again?`;
            replyThenDelete(response, userMsg);
          }
        });

      // if there is an error, balanceCheckTx would be undefined - break in this case
      if (!balanceCheckTx) {
        accountIdsBeingProcessed.delete(accountId);
        break;
      }

      if (!balanceCheckTx.tokens._map.get(tokenId)) {
        replyThenDelete(
          `In order to receive SAUCE, please have your account associated with its token ID: **${tokenId}**.
          After doing so, please run the command again!`.replace(
            /  +/g,
            ""
          ),
          userMsg
        );
        accountIdsBeingProcessed.delete(accountId);
        break;
      }

      // Query faucet_tracker table to see if accountId already pulled from the faucet
      const result = await db.query(
        `SELECT * FROM faucet_tracker WHERE accountId=?`,
        [accountId]
      );

      if (result[0].length) {
        replyThenDelete(
          `Your account has pulled from the faucet already!\nThe next reset is in ${time.hrs} hours and ${time.mins} minutes!`,
          userMsg
        );
        accountIdsBeingProcessed.delete(accountId);
        break;
      }

      const payout = amount * Math.pow(10, decimals);
      try {
        const tx = await new TransferTransaction()
          .addTokenTransfer(tokenId, treasuryId, -payout)
          .addTokenTransfer(tokenId, accountId, payout)
          .freezeWith(client)
          .sign(treasuryKey);
        const txResponse = await tx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        // if tx success, insert values into table...
        if (receipt.status._code == 22) {
          await db.query( `INSERT INTO faucet_tracker (accountId) VALUE (?);`, [accountId] );
          console.debug( `${payout / Math.pow(10, 6)} ${tokenName} sent to ${accountId}` );
          replyThenDelete(`Success!`, userMsg);
        } else {
          throw new Error(`Tx receipt status is not a success!`);
        }
      } catch (e) {
        replyThenDelete(`Something went wrong!`, userMsg);
        console.debug(`Failed to dispense ${ payout / Math.pow(10, 6) } ${tokenName} for: ${accountId}`);
        console.debug(e);
      }
      accountIdsBeingProcessed.delete(accountId);
      break;
    default:
    // do nothing
  }
});

const getTimeTilReset = () => {
  const timeTilReset =
    480 - Math.floor((new Date().getTime() / (1000 * 60)) % 480);
  const hrs = Math.floor(timeTilReset / 60);
  const mins = Math.floor(timeTilReset % 60);
  return { hrs, mins };
  // return `${hours} hours and ${minutes} mins`;
};

const replyThenDelete = (response, userMsg) => {
  if (!userMsg) {
    console.debug("User message does not exist");
    return;
  }
  userMsg.reply(response).then(
    setTimeout(() => {
      try {
        userMsg.delete();
      } catch (e) {
        console.debug(e);
      }
    }, 15000)
  );
};

faucetBot.login(config.DISCORD_TOKEN);
