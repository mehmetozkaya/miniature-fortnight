import { Construct } from "constructs";
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from "aws-cdk-lib";

export class SwnDatabase extends Construct {

    public readonly productTable: ITable;
    public readonly basketTable: ITable;
    public readonly orderTable: ITable;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        //product table
        this.productTable = this.createProductTable();
        //basket table
        this.basketTable = this.createBasketTable(); 
        //order table
        this.orderTable = this.createOrderTable(); 
    }

    // product : PK: id -- name - description - imageFile - price - category
    private createProductTable() : ITable {
      const dynamoTable  = new Table(this, 'product', {
          partitionKey: {
          name: 'id',
          type: AttributeType.STRING
          },
          tableName: 'product',
          removalPolicy: RemovalPolicy.DESTROY,
          billingMode: BillingMode.PAY_PER_REQUEST
      });
      return dynamoTable;
    }

   // basket : PK: userName -- items (SET-MAP object) { quantity - color - price - productId - productName }
    private createBasketTable() : ITable {
      const basketTable = new Table(this, 'basket', {
          partitionKey: {
            name: 'userName',
            type: AttributeType.STRING,
          },
          tableName: 'basket',
          removalPolicy: RemovalPolicy.DESTROY,
          billingMode: BillingMode.PAY_PER_REQUEST
      });
      return basketTable;
    }

    // order : PK: userName - SK: orderDate -- totalPrice - firstName - lastName - email - address - paymentMethod - cardInfo
    private createOrderTable() : ITable {
      const orderTable = new Table(this, 'order', {
          partitionKey: {
            name: 'userName',
            type: AttributeType.STRING,
          },
          sortKey: {
            name: 'orderDate',
            type: AttributeType.STRING,
          },
          tableName: 'order',
          removalPolicy: RemovalPolicy.DESTROY,
          billingMode: BillingMode.PAY_PER_REQUEST
      });
      return orderTable;
    }
}