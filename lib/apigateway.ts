import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
    productMicroservices: IFunction,
    basketMicroservices: IFunction,
    orderingMicroservices: IFunction
}

export class SwnApiGateway extends Construct {

    constructor(scope: Construct, id: string, props: SwnApiGatewayProps){
        super(scope, id);

        // Product Microservices
        this.createProductApi(props.productMicroservices);
        // Basket Microservices
        this.createBasketApi(props.basketMicroservices);
        // Ordering Microservices
        this.createOrderApi(props.orderingMicroservices);
    }

    private createProductApi(productMicroservices: IFunction) {
        
        const apigw = new LambdaRestApi(this, 'productApi', {
            restApiName: 'Product Service',
            handler: productMicroservices,
            proxy: false
        });
    
        const product = apigw.root.addResource('product');
        product.addMethod('GET');  // GET /product
        product.addMethod('POST');  // POST /product
    
        const singleProduct = product.addResource('{id}');
        singleProduct.addMethod('GET');  // GET /product/{id}
        singleProduct.addMethod('PUT'); // PUT /product/{id}
        singleProduct.addMethod('DELETE'); // DELETE /product/{id}

        return singleProduct;
    }

    private createBasketApi(basketMicroservices: IFunction) {
        
        const apigw = new LambdaRestApi(this, 'basketApi', {
            restApiName: 'Basket Service',
            handler: basketMicroservices,
            proxy: false
        });

        const basket = apigw.root.addResource('basket');
        basket.addMethod('GET');  // GET /basket
        basket.addMethod('POST');  // POST /basket

        const singleBasket = basket.addResource('{userName}');
        singleBasket.addMethod('GET');  // GET /basket/{userName}
        singleBasket.addMethod('DELETE'); // DELETE /basket/{userName}

        const basketCheckout = basket.addResource('checkout');
        basketCheckout.addMethod('POST'); // POST /basket/checkout
            // expected request payload : { userName : swn }
    }

    private createOrderApi(orderingMicroservices: IFunction) {
        
        const apigw = new LambdaRestApi(this, 'orderApi', {
            restApiName: 'Order Service',
            handler: orderingMicroservices,
            proxy: false
        });
    
        const order = apigw.root.addResource('order');
        order.addMethod('GET');  // GET /order        
    
        const singleOrder = order.addResource('{userName}');
        singleOrder.addMethod('GET');  // GET /order/{userName}
            // expected request : xxx/order/swn?orderDate=timestamp
            // ordering ms grap input and query parameters and filter to dynamo db

        return singleOrder;
    }
}
