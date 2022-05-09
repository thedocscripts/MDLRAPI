const {XummSdk} = require('xumm-sdk')
const Sdk = new XummSdk()
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    res.send('Welcome to MDLR API')
})


app.get('/getqr', async (req, res) => {
    console.log('code code code')
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    const request = {
        "TransactionType": "SignIn",
        "Memos": [
          {
            "Memo": {
              "MemoData": "F09F988E20596F7520726F636B21"
            }
          }
        ]
    }
    

      const subscription = await Sdk.payload.createAndSubscribe(request, event => {
        console.log('New payload event:', event.data)
    
        if (event.data.signed === true) {
          // No need to console.log here, we'll do that below
          return event.data
        }
    
        if (event.data.signed === false) {
          // No need to console.log here, we'll do that below
          return false
        }
      })
    
      res.write(subscription.created.refs.qr_png)
    
      /**
       * Now let's wait until the subscription resolved (by returning something)
       * in the callback function.
       */
      const resolveData = await subscription.resolved
    
      if (resolveData.signed === false) {
        console.log('The sign request was rejected :(')
      }
    
      if (resolveData.signed === true) {
        console.log('Woohoo! The sign request was signed :)')
    
        /**
         * Let's fetch the full payload end result, and get the issued
         * user token, we can use to send our next payload per Push notification
         */
        const result = await Sdk.payload.get(resolveData.payload_uuidv4)
        res.write(result.application.issued_user_token).then(res.end())
      }  
 
})



app.listen(3000, function () {
    console.log('App listening on port 3000')
})