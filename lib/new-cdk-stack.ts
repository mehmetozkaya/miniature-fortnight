import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SwnDatabase } from './database';
import { SwnMicroservices } from './microservice';
import { SwnApiGateway } from './apigateway';
import { SwnEventBus } from './eventbus';

export class NewCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new SwnDatabase(this, 'Database');

    const microservices = new SwnMicroservices(this, 'Microservices', {
      productsTable: database.productsTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable
    });
    
    const apigateway = new SwnApiGateway(this, 'ApiGateway', {
      productsMicroservices: microservices.productsMicroservice,
      basketMicroservices: microservices.basketMicroservice
    });

    const eventbus = new SwnEventBus(this, 'EventBus', {
      publisherFuntion: microservices.basketMicroservice,
      targetFuntion: microservices.orderingMicroservice
    });
  }
}
