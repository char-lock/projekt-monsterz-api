import { Request, Response } from "express";

export default class ApiResponse {
  statusCode: number;
  details: string;
  data: Array<object>;

  static UserError(details?: string) {
    const response = new ApiResponse(400);
    response.details = (details && details !== "") ? details : "Malformed request";
    return response;
  }

  static ServerError(details?: string) {
    const response = new ApiResponse(500);
    response.details = (details && details !== "") ? details : "Unknown server error occurred";
    return response;
  }

  static Created(details: string, data: Array<object>) {
    const response = new ApiResponse(201);
    response.details = (details !== "") ? details : "Successfully created";
    response.data = data;
    return response;
  }

  static Deleted(details?: string) {
    const response = new ApiResponse(200);
    response.details = (details && details !== "") ? details : "Successfully deleted";
    return response;
  }

  static Ok(details?: string, data?: Array<object>) {
    const response = new ApiResponse(200);
    response.details = (details && details !== "") ? details : "Ok";
    response.data = data ? data : [];
    return response;
  }

  constructor(status: number, details?: string, data?: Array<object>) {
    this.statusCode = status;
    this.details = details ? details : "";
    this.data = data ? data : [];
  }

  Send(res: Response) {
    return res.status(this.statusCode).send(JSON.stringify(this));
  }
}
