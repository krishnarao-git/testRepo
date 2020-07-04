const fs = require("fs");
const AWS = require("aws-sdk");
const configFile = require("./config.json");

// initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: configFile["accessKey"],
  secretAccessKey: configFile["secretAccessKey"]
});

const uploadFile = fileName => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);
  // Setting up S3 upload parameters
  const params = {
    Bucket: configFile["bucketName"],
    Key: "TE2.0/" + year + "/" + fdate + "/" + "report.json", // File name you want to save as in S3
    Body: fileContent,
    ContentType: "application/json"
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
    if (err) {
      throw err;
    }
    console.log(`JSON File uploaded successfully`);
  });
};

const uploadReport = fileName => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);
  // Setting up S3 upload parameters
  const params = {
    Bucket: configFile["bucketName"],
    Key: "mochareports/" + "report.html", // File name you want to save as in S3
    Body: fileContent,
    ContentType: "text/html",
    ACL: "public-read"
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
    if (err) {
      throw err;
    }
    console.log(`Report uploaded successfully`);
  });
};

var date = new Date();
const year = date.getFullYear();
const res = date.toISOString();
const fdate = res.substring(0, res.indexOf("T"));
const path = "./cypress/reports/report.json";
const reportPath = "./cypress/reports/mochareports/report.html";
uploadReport(reportPath);
uploadFile(path);
