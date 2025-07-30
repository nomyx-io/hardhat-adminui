import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Request, Response } from "express";
export interface AppRequest extends Request {
    hre?: HardhatRuntimeEnvironment;
}
export interface RouteHandler {
    (req: AppRequest, res: Response): Promise<void> | void;
}
export interface ContractCallRequest {
    method: string;
    args?: any[];
    value?: string;
}
export interface ContractCallResponse {
    type: 'transaction' | 'view';
    hash?: string;
    gasUsed?: string;
    blockNumber?: number;
    status?: number;
    logs?: any[];
    result?: any;
}
