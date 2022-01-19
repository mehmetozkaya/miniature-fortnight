import { QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";

exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));  
  // GET /order	
	// GET /order/{userName}
  let body;

  try{
      switch (event.httpMethod) {
          case "GET":
              if (event.pathParameters != null) {
              body = await getOrder(event);
              } else {
              body = await getAllOrders();
              }
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

const getOrder = async (event) => {
  console.log("getOrder");
    
  try {
    // expected request : xxx/order/swn?orderDate=timestamp
    const userName = event.pathParameters.userName;  
    const orderDate = event.queryStringParameters.orderDate; 

    const params = {
      KeyConditionExpression: "PK = :userName and SK = :orderDate",
      ExpressionAttributeValues: {
        ":userName": { S: userName },
        ":orderDate": { S: orderDate }
      },
      TableName: process.env.DYNAMODB_TABLE_NAME
    };
 
    const { Items } = await ddbClient.send(new QueryCommand(params));

    console.log(Items);
    return Items.map((item) => unmarshall(item));
  } catch(e) {
    console.error(e);
    throw e;
  }
}

const getAllOrders = async () => {  
  console.log("getAllOrders");    
  try {
      const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME
      };
  
      const { Items } = await ddbClient.send(new ScanCommand(params));

      console.log(Items);
      return (Items) ? Items.map((item) => unmarshall(item)) : {};

  } catch(e) {
      console.error(e);
      throw e;
  }
}