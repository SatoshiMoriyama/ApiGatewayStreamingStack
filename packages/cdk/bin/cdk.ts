#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { ApiGatewayStreamingStack } from "../lib/api-gateway-streaming-stack";

const app = new cdk.App();
new ApiGatewayStreamingStack(app, "ApiGatewayStreamingStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
