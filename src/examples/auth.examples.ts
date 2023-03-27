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

API_ENDPOINT += "/auth";

function loginOrThrow(username: string, password: string) {
  return axios.post(API_ENDPOINT + "/login", {
    username: username,
    password: password
  })
    .then((response) => {
      return response;
    })
    .catch((reason) => {
      throw Error(reason);
    });
}

function refreshOrThrow(jwt: string) {
  return axios.get(API_ENDPOINT + "/refresh", {
    headers: { Authorization: "Bearer " + jwt }
  })
    .then((response) => {
      return response;
    })
    .catch((reason) => {
      throw Error(reason);
    });
}
