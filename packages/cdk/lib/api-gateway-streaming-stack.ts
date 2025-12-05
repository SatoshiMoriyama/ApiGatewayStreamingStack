import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as agentcore from "@aws-cdk/aws-bedrock-agentcore-alpha";
import { aws_bedrockagentcore as bedrockagentcore } from "aws-cdk-lib";
import * as path from "path";

export class ApiGatewayStreamingStack extends cdk.Stack {
  public readonly strandsFunction: lambda.Function;
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda Function for Strands Agent
    this.strandsFunction = new lambda.Function(this, "StrandsAgentFunction", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../strands-agent/dist")
      ),
      timeout: cdk.Duration.seconds(300),
      memorySize: 1024,
    });

    this.strandsFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: ["*"],
      })
    );

    // API Gateway with Streaming Support
    this.api = new apigateway.RestApi(this, "StrandsApi", {
      restApiName: "Strands Agent API",
      description: "API for Strands Agent with streaming support",
      deployOptions: {
        stageName: "prod",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    // /chat endpoint with streaming
    const chat = this.api.root.addResource("chat");
    const integration = new apigateway.LambdaIntegration(this.strandsFunction, {
      proxy: true,
      responseTransferMode: apigateway.ResponseTransferMode.STREAM,
    });
    chat.addMethod("POST", integration, {
      methodResponses: [{ statusCode: "200" }],
    });

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", {
      value: this.api.url,
      description: "API Gateway URL",
    });

    new cdk.CfnOutput(this, "ChatEndpoint", {
      value: `${this.api.url}chat`,
      description: "Chat endpoint URL (with streaming)",
    });

    new cdk.CfnOutput(this, "ApiGatewayRestApiId", {
      value: this.api.restApiId,
      description: "API Gateway REST API ID (for manual Target setup)",
    });

    new cdk.CfnOutput(this, "ApiGatewayStageName", {
      value: "prod",
      description: "API Gateway Stage Name (for manual Target setup)",
    });
  }
}
