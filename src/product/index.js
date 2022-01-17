import { DeleteItemCommand, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "./dbClient";

exports.handler = async function(event) {	    
    console.log("request:", JSON.stringify(event, undefined, 2));    
    let body;
    
    try {
      switch (event.httpMethod) {
        case "GET":
          if (event.queryStringParameters != null) {
            body = await getProductsByCategory(event);
          }
          else if (event.pathParameters != null) {
            body = await getProduct(event.pathParameters.id);
          }
          else {
            body = await getAllProducts();
          }
          break;
        case "POST":
          body = await createProduct(event);
          break;
        case "DELETE":
            body = await deleteProduct(event.pathParameters.id);
          break;
        case "PUT":
            body = await updateProduct(event);
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

    } catch (e) {
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

const getProduct = async (productId) => {
  console.log("getProduct");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: productId })
    };
 
    const { Item } = await dbClient.send(new GetItemCommand(params));

    console.log(Item);
    return (Item) ? unmarshall(Item) : {};

  } catch(e) {
    console.error(e);
    throw e;
  }
}

const getAllProducts = async () => {
  console.log("getAllProducts");
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

const getProductsByCategory = async (event) => {
  console.log("getProductsByCategory");
  try {
    const productId = event.pathParameters.id;
    const category = event.queryStringParameters.category;

    const params = {
      KeyConditionExpression: "id = :productId",
      FilterExpression: "contains (category, :category)",
      ExpressionAttributeValues: {
        ":productId": { S: productId },
        ":category": { S: category }
      },      
      TableName: process.env.DYNAMODB_TABLE_NAME
    };
 
    const { Items } = await dbClient.send(new QueryCommand(params));

    console.log(Items);
    return Items.map((item) => unmarshall(item));
  } catch(e) {
    console.error(e);
    throw e;
  }
}

const createProduct = async (event) => {
  try {
    console.log(`createProduct function. event : "${event}"`);

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

const deleteProduct = async (productId) => {
  try {
    console.log(`deleteProduct function. productId : "${productId}"`);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: productId }),
  };  

  const deleteResult = await dbClient.send(new DeleteItemCommand(params));
  console.log(deleteResult);
  return deleteResult;

  } catch(e) {
    console.error(e);
    throw e;
  }
}

const updateProduct = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const objKeys = Object.keys(requestBody);
    console.log(`updateProduct function. requestBody : "${requestBody}", objKeys: "${objKeys}"`);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ productId: event.pathParameters.id }),
      UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
      }), {}),
      ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
          ...acc,
          [`:value${index}`]: body[key],
      }), {})),
    };

    const updateResult = await dbClient.send(new UpdateItemCommand(params));
    console.log(updateResult);
    return updateResult;

  } catch(e) {
    console.error(e);
    throw e;
  }
}