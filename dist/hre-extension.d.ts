import "hardhat/types/runtime";
import { ethers } from "ethers";
import { Deployment } from "hardhat-deploy/types";
export interface AdminUIDeployment extends Deployment {
    contractName: string;
}
declare module "hardhat/types/runtime" {
    interface HardhatRuntimeEnvironment {
        adminUI: {
            getProjectInfo: () => {
                name: string;
                hardhatVersion: string;
                networks: string[];
            };
            getDeployment: (contractName: string) => Promise<AdminUIDeployment | null>;
            listDeployments: () => Promise<AdminUIDeployment[]>;
            getContract: (contractName: string, signer?: ethers.Signer) => Promise<ethers.Contract | null>;
            getStorageAt: (address: string, slot: string) => Promise<string>;
            verifyContract: (contractName: string) => Promise<void>;
            simulateTransaction: (from: string, to: string, data: string, value?: string) => Promise<any>;
            getRecentTransactions: (contractAddress: string, limit?: number) => Promise<any[]>;
            getTransactionDetails: (txHash: string) => Promise<any>;
        };
    }
}
