import axios from "axios";
import path from "path";
import { parseBoolean } from "../shared/util";

import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, `..${path.sep}..${path.sep}.env`)});

const HTTPS_DISABLED = parseBoolean(process.env.HTTPS_DISABLE);

let API_ENDPOINT = "http";
if (!HTTPS_DISABLED) API_ENDPOINT += "s"
API_ENDPOINT += `://${process.env.DOMAIN}:`;
API_ENDPOINT += HTTPS_DISABLED ? process.env.HTTP_PORT : process.env.HTTPS_PORT;

API_ENDPOINT += "/user";

function createUserOrThrow(
  username: string, password: string,
  verification_method: number, verification_value: string
) {
  return axios.post(API_ENDPOINT + "/", JSON.stringify({
    username: username,
    auth_key: password,
    verification_method: verification_method,
    verification_value: verification_value
  }))
    .then((response) => {
      return response;
    })
    .catch((reason) => {
      throw Error(reason);
    });
}

function deleteUserByIdOrThrow(userId: number) {
  return axios.delete(API_ENDPOINT + "/id/" + userId)
    .then((response) => {
      return response;
    })
    .catch((reason) => {
      throw Error(reason);
    });
}

function getUserByIdOrThrow(userId: number) {
  return axios.get(API_ENDPOINT + "/id/" + userId)
    .then((response) => {
      return response;
    })
    .catch((reason) => {
      throw Error(reason);
    });
}

function getUserByUsernameOrThrow(username: string) {
  return axios.get(API_ENDPOINT + "/username/" + username)
    .then((response) => {
      return response;
    })
    .catch((reason) => {
      throw Error(reason);
    })
}
