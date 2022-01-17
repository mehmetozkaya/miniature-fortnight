import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface SwnMicroservicesProps {
    productsTable: ITable;
    basketTable: ITable;
    orderTable: ITable;
}

export class SwnMicroservices extends Construct {

    public readonly productsMicroservice: NodejsFunction;
    public readonly basketMicroservice: NodejsFunction;
    public readonly orderingMicroservice: NodejsFunction;

    constructor(scope: Construct, id: string, props: SwnMicroservicesProps) {
        super(scope, id);

        // product microservices
        this.productsMicroservice = this.createProductFunction(props.productsTable);
        // basket microservices
        this.basketMicroservice = this.createBasketFunction(props.basketTable);
        // ordering Microservice
        this.orderingMicroservice = this.createOrderingFunction(props.orderTable);
    }

    private createProductFunction(productsTable: ITable) : NodejsFunction {
        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },      
            environment: {
                PRIMARY_KEY: 'id',
                DYNAMODB_TABLE_NAME: productsTable.tableName,
            },
            runtime: Runtime.NODEJS_14_X,
        }
    
        const productFunction = new NodejsFunction(this, 'productLambdaFunction', {
            entry: join(__dirname, `/../src/product/index.js`),
            ...nodeJsFunctionProps,
        });
            
        productsTable.grantReadWriteData(productFunction);
        return productFunction;
    }

    private createBasketFunction(basketTable: ITable) : NodejsFunction {
        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },      
            environment: {
                PRIMARY_KEY: 'PK',
                DYNAMODB_TABLE_NAME: basketTable.tableName,
                EVENT_SOURCE: "com.swn.basket.checkoutbasket",
                EVENT_DETAILTYPE: "CheckoutBasket",
                EVENT_BUSNAME: "SwnEventBus"
            },
            runtime: Runtime.NODEJS_14_X,
        }
    
        const basketFunction = new NodejsFunction(this, 'basketLambdaFunction', {
            entry: join(__dirname, `/../src/basket/index.js`),
            ...nodeJsFunctionProps,
        });

        basketTable.grantReadWriteData(basketFunction);
        return basketFunction;
    }

    private createOrderingFunction(orderTable: ITable) : NodejsFunction {
        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },      
            environment: {
                PRIMARY_KEY: 'PK',
                DYNAMODB_TABLE_NAME: orderTable.tableName,
            },
            runtime: Runtime.NODEJS_14_X,
        }
    
        const basketFunction = new NodejsFunction(this, 'orderingLambdaFunction', {
            entry: join(__dirname, `/../src/ordering/index.js`),
            ...nodeJsFunctionProps,
        });

        orderTable.grantReadWriteData(basketFunction);
        return basketFunction;
    }
}