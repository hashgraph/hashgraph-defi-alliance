import aws from "aws-sdk";
aws.config.update({ region: "us-east-1" });

const secrets = new aws.SecretsManager();

export const getBotConfig = async () => {
  try {
    const data = await secrets
      .getSecretValue({ SecretId: "BOT_CONFIG" })
      .promise();
    return JSON.parse(data.SecretString);
  } catch (e) {
    if (e.code == "CREDENTIALSERROR") return null;
  }
};
