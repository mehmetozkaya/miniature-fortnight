import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
    productsMicroservices: IFunction,
    basketMicroservices: IFunction
}

export class SwnApiGateway extends Construct {

    constructor(scope: Construct, id: string, props: SwnApiGatewayProps){
        super(scope, id);

        // Product Microservices
        this.createProductApi(props.productsMicroservices);

        // Basket Microservices
        this.createBasketApi(props.basketMicroservices);
    }

    private createProductApi(productsMicroservices: IFunction) {
        
        const apigw = new LambdaRestApi(this, 'productsApi', {
            restApiName: 'Products Service',
            handler: productsMicroservices,
            proxy: false
        });
    
        const products = apigw.root.addResource('products');
        products.addMethod('GET');  // GET /products
        products.addMethod('POST');  // POST /products
    
        const singleProduct = products.addResource('{id}');
        singleProduct.addMethod('GET');  // GET /products/{id}
        singleProduct.addMethod('PUT'); // PUT /products/{id}
        singleProduct.addMethod('DELETE'); // DELETE /products/{id}

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
