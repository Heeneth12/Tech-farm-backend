const express = require("express");
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

// Configure nodemailer with your email service provider
const config = {
  service: "gmail",
  auth: {
    user: "heeneth123@gmail.com",
    pass: "qwlv qeab pria mrul",
  },
};

// MongoDB Data API endpoint and API key
const endpoint =
  "https://ap-south-1.aws.data.mongodb-api.com/app/data-usbhg/endpoint/data/v1/action/insertOne";
const apiKey =
  "wY8suEIO2kRGPd5eOYPl8J7Pwy7lTf7bxlsyFryXqqUp7fabf5Ns8k75oLf4ew87";

// POST endpoint to save data
app.post("/api/contact", async (req, res) => {
  const formData = req.body;

  const data = {
    collection: "espdata",
    database: "esp32",
    dataSource: "Heeneth",
    document: {
      temperature: formData.temperature,
      humidity: formData.humidity,
      dht: formData.dht,
      ph: formData.ph,
      rainfall: formData.rainfall,
    },
  };

  try {
    // Make a POST request to the MongoDB Data API endpoint
    const response = await axios.post(endpoint, data, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        "api-key": apiKey,
      },
    });

    console.log(response.data); // Log the response from the API

    // Check if rainfall is less than 10 and send email if true
    const transporter = nodemailer.createTransport(config);

    if (formData.rainfall < 10) {
      const messages = {
        from: "heeneth123@gmail.com",
        to: "ah8963@srmist.edu.in",
        subject: "Low Rainfall Alert",
        text: "The rainfall value is less than 10.",
      };

      transporter.sendMail(messages, function (error, info) {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

    res.status(201).json({ message: "True" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Error saving message" });
  }
});

// GET endpoint to retrieve all data from the database
app.get("/api/data", async (req, res) => {
  try {
    // Assuming you have an API key for fetching data
    const fetchDataApiKey =
      "wY8suEIO2kRGPd5eOYPl8J7Pwy7lTf7bxlsyFryXqqUp7fabf5Ns8k75oLf4ew87";

    const config = {
      method: "post",
      url: "https://ap-south-1.aws.data.mongodb-api.com/app/data-usbhg/endpoint/data/v1/action/find",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        "api-key": fetchDataApiKey, // Use the API key for fetching data
      },
      data: JSON.stringify({
        collection: "espdata",
        database: "esp32",
        dataSource: "Heeneth",
        projection: {},
      }),
    };

    // Make a POST request to fetch all documents from the MongoDB collection
    const response = await axios(config);

    // Return the data retrieved from the database
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
