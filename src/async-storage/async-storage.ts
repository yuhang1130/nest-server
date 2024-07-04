import { AsyncLocalStorage } from "async_hooks";
import * as _ from "lodash";
import { CustomRequest } from "../middleware/session-store/session-dto";
import { UserNamespace } from "../constants/user-constant";
import { SessionDto } from "../modules/user/user.dto";

export interface ALSConfig {
  request: CustomRequest;
  requestId: string;
}

export const ASLStore = new AsyncLocalStorage<ALSConfig>();

export const AlsGetRequest = (): CustomRequest => {
  return ASLStore.getStore().request;
};

export const AlsSetRequest = (data: CustomRequest): ALSConfig => {
  const config = ASLStore.getStore();
  return _.set(config, "request", data);
};

export const AlsSetRequestId = (requestId: string): ALSConfig => {
  const config = ASLStore.getStore();
  return _.set(config, "requestId", requestId);
};

export const AlsGetRequestId = (): string => {
  const config = ASLStore.getStore();
  return _.get(config, "requestId");
};

export const AlsGetUserSession = (): SessionDto => {
  const config = ASLStore.getStore();
  return config.request.session[UserNamespace];
};

export const AlsSetRequestIp = (ip: string): ALSConfig => {
  const config = ASLStore.getStore();
  return _.set(config, "requestIp", ip);
};

export const AlsGetRequestIp = (): string => {
  const config = ASLStore.getStore();
  return _.get(config, "requestIp");
};
