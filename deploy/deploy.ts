/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import hardhatConfig from '../hardhat.config';

import fs from 'fs';
import path from 'path';

async function func(hre: HardhatRuntimeEnvironment) {
    console.log('🚀 Starting contract deployment...');
    
    const { ethers, getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    
    console.log('📋 Deployment Configuration:');
    console.log(`  Deployer: ${deployer}`);
    console.log(`  Network: ${hre.network.name}`);
    
    // Get deployer signer for contract interactions
    const deployerSigner = await ethers.getSigner(deployer);
    console.log(`  Deployer balance: ${ethers.utils.formatEther(await deployerSigner.getBalance())} ETH`);
    
    try {
        // Deploy SimpleStorage
        console.log('\n📦 Deploying SimpleStorage contract...');
        const simpleStorageDeployment = await deploy('SimpleStorage', {
            from: deployer,
            args: [42], // Initial value
            log: true,
        });
        console.log(`✅ SimpleStorage deployed at: ${simpleStorageDeployment.address}`);
        
        // Deploy SimpleToken
        console.log('\n📦 Deploying SimpleToken contract...');
        const simpleTokenDeployment = await deploy('SimpleToken', {
            from: deployer,
            args: [
                'Demo Token',     // name
                'DEMO',          // symbol
                18,              // decimals
                1000000          // initial supply (1M tokens)
            ],
            log: true,
        });
        console.log(`✅ SimpleToken deployed at: ${simpleTokenDeployment.address}`);
        
        // Deploy Marketplace
        console.log('\n📦 Deploying Marketplace contract...');
        const marketplaceDeployment = await deploy('Marketplace', {
            from: deployer,
            args: [250], // 2.5% marketplace fee (250 basis points)
            log: true,
        });
        console.log(`✅ Marketplace deployed at: ${marketplaceDeployment.address}`);
        
        // Deploy Diamond with all facets
        console.log('\n💎 Deploying Diamond contract with facets...');
        
        // Deploy all facets first
        console.log('  📦 Deploying Diamond facets...');
        
        const diamondCutFacetDeployment = await deploy('DiamondCutFacet', {
            from: deployer,
            args: [],
            log: true,
        });
        console.log(`    ✅ DiamondCutFacet deployed at: ${diamondCutFacetDeployment.address}`);
        
        const diamondLoupeFacetDeployment = await deploy('DiamondLoupeFacet', {
            from: deployer,
            args: [],
            log: true,
        });
        console.log(`    ✅ DiamondLoupeFacet deployed at: ${diamondLoupeFacetDeployment.address}`);
        
        const counterFacetDeployment = await deploy('CounterFacet', {
            from: deployer,
            args: [],
            log: true,
        });
        console.log(`    ✅ CounterFacet deployed at: ${counterFacetDeployment.address}`);
        
        // Deploy DiamondInit
        const diamondInitDeployment = await deploy('DiamondInit', {
            from: deployer,
            args: [],
            log: true,
            contract: 'contracts/upgradeInitializers/DiamondInit.sol:DiamondInit',
        });
        console.log(`    ✅ DiamondInit deployed at: ${diamondInitDeployment.address}`);
        
        // Prepare facet cuts for diamond initialization
        const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };
        
        // Get function selectors for each facet
        const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondCutFacetDeployment.address);
        const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondLoupeFacetDeployment.address);
        const counterFacet = await ethers.getContractAt('CounterFacet', counterFacetDeployment.address);
        
        // Function to get function selectors from contract interface
        function getSelectors(contract: any) {
            const signatures = Object.keys(contract.interface.functions);
            const selectors = signatures.reduce((acc: string[], val: string) => {
                if (val !== 'init(bytes)') {
                    acc.push(contract.interface.getSighash(val));
                }
                return acc;
            }, []);
            return selectors;
        }
        
        const diamondCutSelectors = getSelectors(diamondCutFacet);
        const diamondLoupeSelectors = getSelectors(diamondLoupeFacet);
        const counterSelectors = getSelectors(counterFacet);
        
        console.log(`    📋 DiamondCutFacet selectors: ${diamondCutSelectors.length}`);
        console.log(`    📋 DiamondLoupeFacet selectors: ${diamondLoupeSelectors.length}`);
        console.log(`    📋 CounterFacet selectors: ${counterSelectors.length}`);
        
        const facetCuts = [
            {
                facetAddress: diamondCutFacetDeployment.address,
                action: FacetCutAction.Add,
                functionSelectors: diamondCutSelectors
            },
            {
                facetAddress: diamondLoupeFacetDeployment.address,
                action: FacetCutAction.Add,
                functionSelectors: diamondLoupeSelectors
            },
            {
                facetAddress: counterFacetDeployment.address,
                action: FacetCutAction.Add,
                functionSelectors: counterSelectors
            }
        ];
        
        // Prepare diamond settings
        const diamondSettings = {
            owner: deployer,
            factory: ethers.constants.AddressZero,
            svgManager: ethers.constants.AddressZero,
            symbol: 'DIAMOND',
            name: 'Sample Diamond'
        };
        
        // Prepare initialization data
        const diamondInit = await ethers.getContractAt('contracts/upgradeInitializers/DiamondInit.sol:DiamondInit', diamondInitDeployment.address);
        const initData = diamondInit.interface.encodeFunctionData('init', []);
        
        // Deploy the Diamond
        console.log('  💎 Deploying main Diamond contract...');
        const diamondDeployment = await deploy('Diamond', {
            from: deployer,
            args: [],
            log: true,
        });
        console.log(`    ✅ Diamond deployed at: ${diamondDeployment.address}`);
        
        // Initialize the Diamond
        console.log('  🔧 Initializing Diamond with facets...');
        const diamond = await ethers.getContractAt('Diamond', diamondDeployment.address);
        
        const initTx = await diamond.connect(deployerSigner).initialize(
            deployer,
            diamondSettings,
            facetCuts,
            diamondInitDeployment.address,
            initData
        );
        await initTx.wait();
        console.log('    ✅ Diamond initialized with all facets');
        
        // Test diamond functionality
        console.log('  🧪 Testing Diamond functionality...');
        
        // Test DiamondLoupe functions
        const diamondAsLoupe = await ethers.getContractAt('DiamondLoupeFacet', diamondDeployment.address);
        const facets = await diamondAsLoupe.facets();
        console.log(`    📊 Diamond has ${facets.length} facets`);
        
        // Test Ownership functions (built into Diamond)
        const diamondAsOwnership = await ethers.getContractAt('Diamond', diamondDeployment.address);
        const owner = await diamondAsOwnership.owner();
        console.log(`    👑 Diamond owner: ${owner}`);
        
        // Test Counter functions
        const diamondAsCounter = await ethers.getContractAt('CounterFacet', diamondDeployment.address);
        await diamondAsCounter.connect(deployerSigner).increment();
        await diamondAsCounter.connect(deployerSigner).increment();
        const counterValue = await diamondAsCounter.getCounter();
        console.log(`    🔢 Counter value: ${counterValue}`);
        
        // Test user counter
        await diamondAsCounter.connect(deployerSigner).incrementUserCounter();
        const userCounter = await diamondAsCounter.getUserCounter(deployer);
        console.log(`    👤 User counter for deployer: ${userCounter}`);
        
        console.log('    ✅ All Diamond functions working correctly');
        
        // Get contract instances for sample data population
        const simpleStorage = await ethers.getContractAt('SimpleStorage', simpleStorageDeployment.address);
        const simpleToken = await ethers.getContractAt('SimpleToken', simpleTokenDeployment.address);
        const marketplace = await ethers.getContractAt('Marketplace', marketplaceDeployment.address);
        
        console.log('\n🎲 Populating contracts with sample data...');
        
        // Populate SimpleStorage with sample data
        console.log('  📝 Adding SimpleStorage sample data...');
        await simpleStorage.connect(deployerSigner).setValue(100);
        console.log('    ✅ Set storage value to 100');
        
        await simpleStorage.connect(deployerSigner).increment();
        console.log('    ✅ Incremented storage value');
        
        const currentValue = await simpleStorage.getValue();
        console.log(`    📊 Current storage value: ${currentValue}`);
        
        // Populate SimpleToken with sample data
        console.log('  🪙 Adding SimpleToken sample data...');
        
        // Create some sample accounts
        const accounts = await ethers.getSigners();
        const sampleAccounts = accounts.slice(1, 4); // Use accounts 1, 2, 3 as sample users
        
        // Transfer tokens to sample accounts
        for (let i = 0; i < sampleAccounts.length; i++) {
            const transferAmount = ethers.utils.parseEther('1000'); // 1000 tokens
            await simpleToken.connect(deployerSigner).transfer(sampleAccounts[i].address, transferAmount);
            console.log(`    ✅ Transferred 1000 DEMO tokens to account ${i + 1}: ${sampleAccounts[i].address}`);
        }
        
        // Mint additional tokens to deployer
        const mintAmount = ethers.utils.parseEther('50000'); // 50K tokens
        await simpleToken.connect(deployerSigner).mint(deployer, mintAmount);
        console.log(`    ✅ Minted 50,000 DEMO tokens to deployer`);
        
        // Display token balances
        for (let i = 0; i < sampleAccounts.length; i++) {
            const balance = await simpleToken.balanceOf(sampleAccounts[i].address);
            console.log(`    📊 Account ${i + 1} balance: ${ethers.utils.formatEther(balance)} DEMO`);
        }
        
        // Populate Marketplace with sample data
        console.log('  🛒 Adding Marketplace sample data...');
        
        const sampleItems = [
            {
                name: 'Vintage Laptop',
                description: 'A rare vintage laptop from the 1990s in excellent condition',
                price: ethers.utils.parseEther('0.5') // 0.5 ETH
            },
            {
                name: 'Digital Art NFT',
                description: 'Unique digital artwork representing the future of creativity',
                price: ethers.utils.parseEther('0.1') // 0.1 ETH
            },
            {
                name: 'Smart Contract Tutorial',
                description: 'Complete guide to building smart contracts with Solidity',
                price: ethers.utils.parseEther('0.05') // 0.05 ETH
            }
        ];
        
        // List items from different accounts
        for (let i = 0; i < sampleItems.length && i < sampleAccounts.length; i++) {
            const item = sampleItems[i];
            const seller = sampleAccounts[i];
            
            const tx = await marketplace.connect(seller).listItem(
                item.name,
                item.description,
                item.price
            );
            const receipt = await tx.wait();
            
            // Get the item ID from the event
            const event = receipt.events?.find(e => e.event === 'ItemListed');
            const itemId = event?.args?.itemId;
            
            console.log(`    ✅ Listed "${item.name}" (ID: ${itemId}) for ${ethers.utils.formatEther(item.price)} ETH`);
        }
        
        // Simulate a purchase
        if (sampleAccounts.length >= 2) {
            const buyer = sampleAccounts[1];
            const itemPrice = sampleItems[0].price;
            
            console.log('  💰 Simulating a purchase...');
            await marketplace.connect(buyer).buyItem(1, { value: itemPrice });
            console.log(`    ✅ Account 2 purchased item 1 for ${ethers.utils.formatEther(itemPrice)} ETH`);
        }
        
        console.log('\n📊 Deployment Summary:');
        console.log(`  SimpleStorage: ${simpleStorageDeployment.address}`);
        console.log(`  SimpleToken: ${simpleTokenDeployment.address}`);
        console.log(`  Marketplace: ${marketplaceDeployment.address}`);
        console.log(`  Diamond: ${diamondDeployment.address}`);
        console.log(`  ├─ DiamondCutFacet: ${diamondCutFacetDeployment.address}`);
        console.log(`  ├─ DiamondLoupeFacet: ${diamondLoupeFacetDeployment.address}`);
        console.log(`  ├─ CounterFacet: ${counterFacetDeployment.address}`);
        console.log(`  └─ DiamondInit: ${diamondInitDeployment.address}`);
        
        // Save deployment info to file
        const deploymentInfo = {
            network: hre.network.name,
            timestamp: new Date().toISOString(),
            deployer: deployer,
            contracts: {
                SimpleStorage: {
                    address: simpleStorageDeployment.address,
                    constructorArgs: [42]
                },
                SimpleToken: {
                    address: simpleTokenDeployment.address,
                    constructorArgs: ['Demo Token', 'DEMO', 18, 1000000]
                },
                Marketplace: {
                    address: marketplaceDeployment.address,
                    constructorArgs: [250]
                },
                Diamond: {
                    address: diamondDeployment.address,
                    constructorArgs: [],
                    facets: {
                        DiamondCutFacet: {
                            address: diamondCutFacetDeployment.address,
                            selectors: diamondCutSelectors.length
                        },
                        DiamondLoupeFacet: {
                            address: diamondLoupeFacetDeployment.address,
                            selectors: diamondLoupeSelectors.length
                        },
                        CounterFacet: {
                            address: counterFacetDeployment.address,
                            selectors: counterSelectors.length
                        }
                    },
                    initialization: {
                        DiamondInit: diamondInitDeployment.address
                    }
                }
            }
        };
        
        const deploymentPath = path.join(__dirname, '..', 'deployments', 'deployment-info.json');
        fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
        
        console.log('\n🎉 All contracts deployed and populated successfully!');
        
    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        throw error;
    }
}

// Export for hardhat-deploy plugin
export default func;
func.tags = ['all', 'storage', 'token', 'marketplace', 'diamond'];
func.dependencies = [];