"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionSignatureDecoder = void 0;
const ethers_1 = require("ethers");
/**
 * Common function signatures for popular smart contract functions
 * These are commonly used functions across DeFi and other protocols
 */
const COMMON_FUNCTION_SIGNATURES = {
    '0xa9059cbb': 'transfer(address,uint256)',
    '0x23b872dd': 'transferFrom(address,address,uint256)',
    '0x095ea7b3': 'approve(address,uint256)',
    '0x70a08231': 'balanceOf(address)',
    '0xdd62ed3e': 'allowance(address,address)',
    '0x18160ddd': 'totalSupply()',
    '0x06fdde03': 'name()',
    '0x95d89b41': 'symbol()',
    '0x313ce567': 'decimals()',
    '0x40c10f19': 'mint(address,uint256)',
    '0x42966c68': 'burn(uint256)',
    '0x79cc6790': 'burnFrom(address,uint256)',
    '0x8da5cb5b': 'owner()',
    '0x715018a6': 'renounceOwnership()',
    '0xf2fde38b': 'transferOwnership(address)',
    '0x5c975abb': 'paused()',
    '0x8456cb59': 'pause()',
    '0x3f4ba83a': 'unpause()',
    '0xd547741f': 'revokeRole(bytes32,address)',
    '0x2f2ff15d': 'grantRole(bytes32,address)',
    '0x91d14854': 'hasRole(bytes32,address)',
    '0x248a9ca3': 'getRoleAdmin(bytes32)',
    '0x02fe5305': 'setApprovalForAll(address,bool)',
    '0xe985e9c5': 'isApprovedForAll(address,address)',
    '0x6352211e': 'ownerOf(uint256)',
    '0x081812fc': 'getApproved(uint256)',
    '0xb88d4fde': 'tokenURI(uint256)',
    '0x2d1a12f2': 'uri(uint256)',
    '0x4e1273f4': 'balanceOfBatch(address[],uint256[])',
    '0xf242432a': 'safeTransferFrom(address,address,uint256,uint256,bytes)',
    '0x2eb2c2d6': 'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
};
/**
 * Common event signatures
 */
const COMMON_EVENT_SIGNATURES = {
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': 'Transfer(address,address,uint256)',
    '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925': 'Approval(address,address,uint256)',
    '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31': 'ApprovalForAll(address,address,bool)',
    '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0': 'OwnershipTransferred(address,address)',
    '0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d': 'RoleAdminChanged(bytes32,bytes32,bytes32)',
    '0x2f8ba45dc4ee0a77c5a46c269a4c32b04b3a8bcfc32ee9abee60edbfe0c9476f': 'RoleGranted(bytes32,address,address)',
    '0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b': 'RoleRevoked(bytes32,address,address)',
    '0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258': 'Paused(address)',
    '0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa': 'Unpaused(address)',
};
class FunctionSignatureDecoder {
    constructor(provider) {
        this.cache = new Map();
        this.eventCache = new Map();
        this.provider = provider;
    }
    /**
     * Decode a function call using ABI or known signatures
     */
    async decodeFunction(data, contractAbi) {
        if (!data || data.length < 10)
            return null;
        const selector = data.slice(0, 10);
        // Check cache first
        const cacheKey = `${selector}:${data}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        let decoded = null;
        // Try to decode using provided ABI first
        if (contractAbi) {
            try {
                const result = contractAbi.parseTransaction({ data });
                decoded = {
                    name: result.name,
                    signature: result.signature,
                    selector,
                    inputs: result.args.map((arg, index) => ({
                        name: result.functionFragment.inputs[index].name || `param${index}`,
                        type: result.functionFragment.inputs[index].type,
                        value: this.formatValue(arg, result.functionFragment.inputs[index].type)
                    }))
                };
            }
            catch (error) {
                console.log('Failed to decode with ABI:', error);
            }
        }
        // Fall back to known signatures
        if (!decoded && COMMON_FUNCTION_SIGNATURES[selector]) {
            const signature = COMMON_FUNCTION_SIGNATURES[selector];
            const name = signature.split('(')[0];
            decoded = {
                name,
                signature,
                selector,
                inputs: await this.decodeInputsFromSignature(data, signature)
            };
        }
        // If still no result, provide basic info
        if (!decoded) {
            decoded = {
                name: 'Unknown Function',
                signature: `unknown(${selector})`,
                selector,
                inputs: [{
                        name: 'data',
                        type: 'bytes',
                        value: data.slice(10) || '0x'
                    }]
            };
        }
        // Cache the result
        this.cache.set(cacheKey, decoded);
        return decoded;
    }
    /**
     * Decode event logs using ABI or known signatures
     */
    async decodeEvent(log, contractAbi) {
        if (!log.topics || log.topics.length === 0)
            return null;
        const eventTopic = log.topics[0];
        const cacheKey = `${eventTopic}:${log.data}:${log.topics.join(',')}`;
        // Check cache first
        if (this.eventCache.has(cacheKey)) {
            return this.eventCache.get(cacheKey);
        }
        let decoded = null;
        // Try to decode using provided ABI first
        if (contractAbi) {
            try {
                const result = contractAbi.parseLog(log);
                decoded = {
                    name: result.name,
                    signature: result.signature,
                    topics: log.topics,
                    inputs: result.args.map((arg, index) => ({
                        name: result.eventFragment.inputs[index].name || `param${index}`,
                        type: result.eventFragment.inputs[index].type,
                        value: this.formatValue(arg, result.eventFragment.inputs[index].type),
                        indexed: result.eventFragment.inputs[index].indexed
                    }))
                };
            }
            catch (error) {
                console.log('Failed to decode event with ABI:', error);
            }
        }
        // Fall back to known event signatures
        if (!decoded && COMMON_EVENT_SIGNATURES[eventTopic]) {
            const signature = COMMON_EVENT_SIGNATURES[eventTopic];
            const name = signature.split('(')[0];
            decoded = {
                name,
                signature,
                topics: log.topics,
                inputs: await this.decodeEventInputsFromSignature(log, signature)
            };
        }
        // If still no result, provide basic info
        if (!decoded) {
            decoded = {
                name: 'Unknown Event',
                signature: `UnknownEvent(${eventTopic})`,
                topics: log.topics,
                inputs: [{
                        name: 'data',
                        type: 'bytes',
                        value: log.data || '0x',
                        indexed: false
                    }]
            };
        }
        // Cache the result
        this.eventCache.set(cacheKey, decoded);
        return decoded;
    }
    /**
     * Decode function inputs from signature
     */
    async decodeInputsFromSignature(data, signature) {
        try {
            const iface = new ethers_1.ethers.utils.Interface([`function ${signature}`]);
            const result = iface.parseTransaction({ data });
            return result.args.map((arg, index) => ({
                name: result.functionFragment.inputs[index].name || `param${index}`,
                type: result.functionFragment.inputs[index].type,
                value: this.formatValue(arg, result.functionFragment.inputs[index].type)
            }));
        }
        catch (error) {
            return [{
                    name: 'rawData',
                    type: 'bytes',
                    value: data.slice(10) || '0x'
                }];
        }
    }
    /**
     * Decode event inputs from signature
     */
    async decodeEventInputsFromSignature(log, signature) {
        try {
            const iface = new ethers_1.ethers.utils.Interface([`event ${signature}`]);
            const result = iface.parseLog(log);
            return result.args.map((arg, index) => ({
                name: result.eventFragment.inputs[index].name || `param${index}`,
                type: result.eventFragment.inputs[index].type,
                value: this.formatValue(arg, result.eventFragment.inputs[index].type),
                indexed: result.eventFragment.inputs[index].indexed
            }));
        }
        catch (error) {
            return [{
                    name: 'rawData',
                    type: 'bytes',
                    value: log.data || '0x',
                    indexed: false
                }];
        }
    }
    /**
     * Format values for display
     */
    formatValue(value, type) {
        if (ethers_1.ethers.BigNumber.isBigNumber(value)) {
            // For display purposes, convert to string
            if (type.includes('uint') || type.includes('int')) {
                return value.toString();
            }
        }
        if (Array.isArray(value)) {
            return value.map(v => this.formatValue(v, type.replace('[]', '')));
        }
        return value;
    }
    /**
     * Add custom function signature to the decoder
     */
    addFunctionSignature(selector, signature) {
        COMMON_FUNCTION_SIGNATURES[selector] = signature;
    }
    /**
     * Add custom event signature to the decoder
     */
    addEventSignature(topic, signature) {
        COMMON_EVENT_SIGNATURES[topic] = signature;
    }
    /**
     * Clear caches
     */
    clearCache() {
        this.cache.clear();
        this.eventCache.clear();
    }
}
exports.FunctionSignatureDecoder = FunctionSignatureDecoder;
