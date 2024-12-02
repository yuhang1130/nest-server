import local from "./local";
import prod from "./prod";
import test from "./test";
export const deployEnv = process.env.DEPLOY_ENV || "local";
export const isLocal = deployEnv === "local";
export const isProd = deployEnv === "isProd";
export const logLevel = process.env.LOG_LEVEL || "";

let envConfig: any;
switch (deployEnv) {
case "test":
  envConfig = test;
  break;
case "prod":
  envConfig = prod;
  break;
case "local":
default:
  envConfig = local;
  break;
}

export const config = envConfig;
