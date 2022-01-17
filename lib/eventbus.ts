import { Construct } from "constructs";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

interface SwnEventBusProps {
    publisherFuntion: IFunction;
    targetFuntion: IFunction;
}

export class SwnEventBus extends Construct {
        
    constructor(scope: Construct, id: string, props: SwnEventBusProps) {
        super(scope, id);

      //eventbus
      const bus = new EventBus(this, 'SwnEventBus', {
        eventBusName: 'SwnEventBus'
      });
      
      const checkoutBasketRule = new Rule(this, 'CheckoutBasketRule', {
        eventBus: bus,
        enabled: true,
        description: 'When Basket microservice checkout the basket',
        eventPattern: {
          source: ['com.swn.basket.checkoutbasket'],
          detailType: ['CheckoutBasket']
        },
        ruleName: 'CheckoutBasketRule'
      });
  
      checkoutBasketRule.addTarget(new LambdaFunction(props.targetFuntion)); // need to pass target to Ordering Lambda service

      bus.grantPutEventsTo(props.publisherFuntion);
    }
}