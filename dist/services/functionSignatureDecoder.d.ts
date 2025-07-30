import { ethers } from "ethers";
interface DecodedFunction {
    name: string;
    signature: string;
    selector: string;
    inputs?: {
        name: string;
        type: string;
        value: any;
    }[];
}
interface DecodedEvent {
    name: string;
    signature: string;
    topics: string[];
    inputs?: {
        name: string;
        type: string;
        value: any;
        indexed: boolean;
    }[];
}
export declare class FunctionSignatureDecoder {
    private provider;
    private cache;
    private eventCache;
    constructor(provider: ethers.providers.Provider);
    /**
     * Decode a function call using ABI or known signatures
     */
    decodeFunction(data: string, contractAbi?: ethers.utils.Interface): Promise<DecodedFunction | null>;
    /**
     * Decode event logs using ABI or known signatures
     */
    decodeEvent(log: ethers.providers.Log, contractAbi?: ethers.utils.Interface): Promise<DecodedEvent | null>;
    /**
     * Decode function inputs from signature
     */
    private decodeInputsFromSignature;
    /**
     * Decode event inputs from signature
     */
    private decodeEventInputsFromSignature;
    /**
     * Format values for display
     */
    private formatValue;
    /**
     * Add custom function signature to the decoder
     */
    addFunctionSignature(selector: string, signature: string): void;
    /**
     * Add custom event signature to the decoder
     */
    addEventSignature(topic: string, signature: string): void;
    /**
     * Clear caches
     */
    clearCache(): void;
}
export { DecodedFunction, DecodedEvent };
