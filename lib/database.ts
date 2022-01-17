import { Construct } from "constructs";
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from "aws-cdk-lib";

export class SwnDatabase extends Construct {

    public readonly productsTable: ITable;
    public readonly basketTable: ITable;
    public readonly orderTable: ITable;

    constructor(scope: Construct, id: string){
        super(scope, id);

         //product table
         this.productsTable = this.createProductTable();
         
         //basket table
        this.basketTable = this.createBasketTable(); 

         //order table
         this.orderTable = this.createOrderTable(); 
    }

    private createProductTable() : ITable {
        const dynamoTable  = new Table(this, 'products', {
           partitionKey: {
           name: 'id',
           type: AttributeType.STRING
           },
           tableName: 'products',
           removalPolicy: RemovalPolicy.DESTROY,
           billingMode: BillingMode.PAY_PER_REQUEST
       });

       return dynamoTable;
   }

    private createBasketTable() : ITable {
    const basketTable = new Table(this, 'BasketTable', {
        partitionKey: {
          name: 'PK',
          type: AttributeType.STRING,
        },
        // sortKey: {
        //   name: 'SK',
        //   type: AttributeType.STRING,
        // },
        tableName: 'basket',
        removalPolicy: RemovalPolicy.DESTROY,
        billingMode: BillingMode.PAY_PER_REQUEST
    });

    return basketTable;
    // basketTable.addGlobalSecondaryIndex({
    //     indexName: 'GSI1',
    //     partitionKey: {
    //       name: 'SK',
    //       type: AttributeType.STRING,
    //     },
    //     sortKey: {
    //       name: 'PK',
    //       type: AttributeType.STRING,
    //     },
    //     //projectionType: ProjectionType.INCLUDE,
    //     nonKeyAttributes: ['DateUploaded', 'Processed', 'Thumbnail', 'Uploader', 'FileSize', 'Name', 'Owner']
    // });
    }

    private createOrderTable() : ITable {
        const orderTable = new Table(this, 'OrderTable', {
            partitionKey: {
              name: 'PK',
              type: AttributeType.STRING,
            },
            sortKey: {
              name: 'SK',
              type: AttributeType.STRING,
            },
            tableName: 'order',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST
        });
    
        return orderTable;
    }
}