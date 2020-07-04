const https = require("https");
const AWS = require("aws-sdk");
const configFile = require("./config.json");
const infoTest = require("../reports/report.json");
const yourWebHookURL = configFile["slackWebHook"];
const slackWebHookHost = configFile["slackWebHookHost"];
const messageBody = require("./messageBody.json"); //(with path)

/**
 * Handles the actual sending request.
 * We're turning the https.request into a promise here for convenience
 * @param webhookURL
 * @param messageBody
 * @return {Promise}
 */
function sendSlackMessage(webhookURL, messageBody) {
  const params = {
    Bucket: configFile["bucketName"],
    Key: "mochareports/report.html",
    Expires: 604800,
  };

  // initialize S3 client
  const s3 = new AWS.S3({
    accessKeyId: configFile["accessKey"],
    secretAccessKey: configFile["secretAccessKey"],
  });

  s3.getSignedUrl("getObject", params, function (err, url) {
    // make sure the incoming message body can be parsed into valid JSON
    try {
      // setting url
      messageBody.attachments[0].actions[0].url = url;
      // ammounts of tests
      messageBody.attachments[0].fields[0].value = infoTest.stats.tests;
      // seting passed
      messageBody.attachments[0].fields[1].value = infoTest.stats.passes;
      // sseting failed
      messageBody.attachments[0].fields[2].value = infoTest.stats.failures;

      messageBody = JSON.stringify(messageBody);
    } catch (e) {
      throw new Error("Failed to stringify messageBody", e);
    }

    // Promisify the https.request
    return new Promise((resolve, reject) => {
      // general request options, we defined that it's a POST request and content is JSON
      const requestOptions = {
        hostname: slackWebHookHost,
        port: 443,
        path: process.env.SLACK_WEBHOOK_PATH,
        method: "POST",
        header: {
          "Content-Type": "application/json",
        },
      };

      // actual request
      const req = https.request(requestOptions, (res) => {
        let response = "";

        res.on("data", (d) => {
          response += d;
        });

        // response finished, resolve the promise with data
        res.on("end", () => {
          resolve(response);
        });
      });

      // there was an error, reject the promise
      req.on("error", (e) => {
        reject(e);
      });

      // send our message body (was parsed to JSON beforehand)
      req.write(messageBody);
      req.end();
    });
  });
}

// main
(async function () {
  if (!yourWebHookURL) {
    console.error("Please fill in your Webhook URL");
  }

  try {
    await sendSlackMessage(yourWebHookURL, messageBody);
    console.log("Slack notification sent!");
  } catch (e) {
    console.error("There was a error sending the slack notification.", e);
  }
})();
