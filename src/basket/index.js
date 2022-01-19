import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "./dbClient";

import { ebClient } from "./eventBridgeClient";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";

exports.handler = async function(event) {
	    
    console.log("request:", JSON.stringify(event, undefined, 2));

    // GET /basket
	// POST /basket
	// GET /basket/{userName}
	// DELETE /basket/{userName}
    // POST /basket/checkout

    let body;

    try{
        switch (event.httpMethod) {
            case "GET":
                if (event.pathParameters != null) {
                body = await getBasket(event.pathParameters.userName);
                } else {
                body = await getAllBaskets();
                }
                break;
            case "POST":
                if (event.path == "/basket/checkout") {
                    body = await checkoutBasket(event);
                } else {
                    body = await createBasket(event);
                }
                break;
            case "DELETE":
                  body = await deleteBasket(event.pathParameters.userName);
                break;
            case "POST /basket/checkout":
                  body = await checkoutBasket(event);
                break;
            default:
                throw new Error(`Unsupported route: "${event.httpMethod}"`);
        }

        console.log(body);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully finished operation: "${event.httpMethod}"`,
                body: body
            })
        };
    }
    catch(e) {
        console.error(e);
        return {
        statusCode: 500,        
        body: JSON.stringify({
            message: "Failed to perform operation.",
            errorMsg: e.message,
            errorStack: e.stack,
          })
        };
    }    
};

const getBasket = async (userName) => {
    console.log("getBasket");
    try {
        const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ userName: userName })
        };
     
        const { Item } = await dbClient.send(new GetItemCommand(params));
    
        console.log(Item);
        return (Item) ? unmarshall(Item) : {};
    
      } catch(e) {
        console.error(e);
        throw e;
    }
}

const getAllBaskets = async () => {
    console.log("getAllBaskets");    
   try {
        const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME
        };
    
        const { Items } = await dbClient.send(new ScanCommand(params));

        console.log(Items);
        return (Items) ? Items.map((item) => unmarshall(item)) : {};

    } catch(e) {
        console.error(e);
        throw e;
    }
}

const createBasket = async (event) => {    
    try {
        console.log(`createBasket function. event : "${event}"`);
    
        const requestBody = JSON.parse(event.body);
        const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: marshall(requestBody || {})
        };
    
        const createResult = await dbClient.send(new PutItemCommand(params));
        console.log(createResult);
        return createResult;
    
      } catch(e) {
        console.error(e);
        throw e;
    }
}

const deleteBasket = async (userName) => {    
    try {
        console.log(`deleteBasket function. userName : "${userName}"`);
    
      const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ userName: userName }),
      };  
    
      const deleteResult = await dbClient.send(new DeleteItemCommand(params));
      console.log(deleteResult);
      return deleteResult;
    
      } catch(e) {
        console.error(e);
        throw e;
      }
}

const checkoutBasket = async (event) => {
    console.log("checkoutBasket");
    
    // 1- Get existing basket with items
    // 2- create an event json object with basket items, calculate totalprice, prepare order create json data to send ordering ms 
    // 3- publish an event to eventbridge - this will subscribe by order microservice and start ordering process.
    // 4- remove existing basket

    const requestBody = JSON.parse(event.body); // expected request payload : { userName : swn }
    if (requestBody == null || requestBody.userName == null) {
        throw new Error(`userName should exist in requestBody: "${event.body}"`);
    }
    
    const basket = await getBasket(requestBody.userName);

    // TODO -- prepare order payload -- calculate totalprice and combine body and basket items

    const publishedEvent = await publishCheckoutBasketEvent(basket);        
    await deleteBasket(requestBody.userName);

    console.log(publishedEvent);
}

const publishCheckoutBasketEvent = async (basketData) => {
    console.log("publishCheckoutBasketEvent");

    try {
        // eventbridge parameters for setting event to target system
        const params = {
            Entries: [
                {
                    Source: process.env.EVENT_SOURCE,
                    Detail: JSON.stringify(basketData),
                    DetailType: process.env.EVENT_DETAILTYPE,
                    Resources: [ ],
                    EventBusName: process.env.EVENT_BUSNAME
                },
            ],
        };
     
        const data = await ebClient.send(new PutEventsCommand(params));
    
        console.log("Success, event sent; requestID:", data);
        return data;
    
      } catch(e) {
        console.error(e);
        throw e;
    }
}