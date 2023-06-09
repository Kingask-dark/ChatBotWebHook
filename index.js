const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const Subscribers = require('./model/Subscribers');
require('dotenv').config();

// Connect to MongoDB
const mongoString = process.env.DATABASE_URL
mongoose.connect(mongoString);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/api/subscribe', async (req, res) => {
    try {
        const url = req.body.subscriberUrl;
        const data = new Object({
            subscriberUrl: url
        });
        const find_data = await Subscribers.find(data)
        if (find_data.length == 0) {
            const urlData = new Subscribers({
                subscriberUrl: url
            })
            await urlData.save()
            res.status(201).send("You are Successfully Subscribed...");
        }
        else {
            res.status(200).send("You are Already Subscribed...");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/api/unsubscribe', async (req, res) => {
    try {
        const data = new Object({
            subscriberUrl: req.body.subscriberUrl
        });
        const find_data = await Subscribers.find(data)
        if (find_data != 0) {
            const fetchid = await Subscribers.find(data);
            const id = fetchid[0]._id.valueOf();
            await Subscribers.findByIdAndDelete({ _id: id });
            res.status(200).send("You are UnSubscribed Successfully...");
        }
        else {
            res.status(200).send("You are not Subscribed yet...");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/api/testHook', async (req, res) => {
    try {
        await sendToAll(req.body);
        res.status(200).send("Send data to Web Hook");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

const sendToAll = async (publishData) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
  
      // Retrieve all subscribers
      const subscribers = await Subscribers.find({});
  
      if (subscribers.length > 0) {
        // Extract the subscriberUrl value from each subscriber document
        const subscriberUrls = subscribers.map((subscriber) => subscriber.subscriberUrl);
  
        try {
          // Send data to all subscribers
         subscriberUrls.forEach(async subscriberUrl => {
            try {
                await axios.post(subscriberUrl, JSON.stringify(publishData), { headers });
            } catch (error) {
                console.error(error);
            }
         })
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error('No subscribers found');
      }
    } catch (error) {
      console.error(error);
    }
  };

const port = 3000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });