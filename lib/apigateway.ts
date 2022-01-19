import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
    productMicroservices: IFunction,
    basketMicroservices: IFunction
}

export class SwnApiGateway extends Construct {

    constructor(scope: Construct, id: string, props: SwnApiGatewayProps){
        super(scope, id);

        // Product Microservices
        this.createProductApi(props.productMicroservices);
        // Basket Microservices
        this.createBasketApi(props.basketMicroservices);
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

        // basket table : username - Items { productId, name, price, addedTime } - totalPrice => PK : username, SK:totalPrice, Attributes : JSON Items object
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
}
