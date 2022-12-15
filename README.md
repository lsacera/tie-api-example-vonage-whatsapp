# tie-api-example-vonage-whatsapp
This node.js example connector allows you to make your Teneo bot available on WhatsApp using the [Vonage API for WhatsApp](https://developer.vonage.com/messages/overview). This guide will take you through the steps of setting up a Vonage WhatsApp sandbox phone number and deploying the connector so it can respond to messages sent using WhatsApp.

## Prerequisites
### Https
Making the connector available via https is preferred. Ngrok is recommended for this.

### Teneo Engine
Your bot needs to be published and you need to know the engine url.

## Setup instructions
### Download, install and start connector
1. Download or clone the connector source code:
    ```
    git clone https://github.com/lsacera/tie-api-example-vonage-whatsapp.git
    ```
2. Install dependencies by running the following command in the folder where you stored the source:
    ```
    npm install
    ``` 
3. Create a .env file to store the neccesary environment variables. See below for details on creating a new Vonage application. Please find an .env example file in this repository.

4. Generate and publish your private key with the rest of the solution, and update the .env file accordingly. See below for details on getting this file, the app id and the API key and secret from your Vonage account.
    
5. Start the connector with the following command (replacing the environment variable with the appropriate value):
    ```
    node server.js
    ```

### Make the connector available via https
You can make your locally running connector available via https using ngrok as follows:

1. The connector runs on port 4338 by default, so execute the following command:
    ```
    ngrok http 4338
    ```
2. Running the command above will display a public https URL, copy it, we will use it in the following steps.

### Setup a Vonage whatsapp sandbox
1. Setup a free [Vonage](https://ui.idp.vonage.com/ui/auth/registration?icid=tryitfree_api-developer-adp_nexmodashbdfreetrialsignup_nav) account, which comes with free credit money you can spend on buying a number.

2. Go to the left panel menu and expand the **Developer Tools** menu, then select **Messages Sandbox**. You can access it [here](https://dashboard.nexmo.com/messages/sandbox).

3. In the Whatsapp box, select **Add to sandbox** link. Follow the instructions to set up the sandbox to be able to do testing.

4. Scroll down, and in the **Webhooks** section, include the https URL you copied earlier in the **Inbound** box.

That's it! Now you can use the WhatsApp sandbox to interact with your bot!

## Create a Vonage application and generate the public and private keys.
1. Go to the Vonage console [Vonage Console](https://dashboard.nexmo.com/) and select **API Settings** option on the menu on the left. You will find your API key and your API Secret. In the case you do not have any API Secret, use the **Request more API keys** button. Take note of the API key and API secret value to edit the environment file.

2. Go to **Applications** menu on the left panel and click on **Create a new application** button. Give it name and then click on the **Generate public and private key** button. This action will download a "private.key" file to your desktop. Store this file in a safe place, as you will need to publish it along with the rest of the solution and update the enviroment file accondingly. Scroll down and click **Save**

3. Take note of the app id of the new created app in Vonage, and update the environment file with this value.

## Vonage API for WhatsApp
For more details, visit the Vonage developer website: [Vonage Messages API](https://developer.vonage.com/messages/overview).
