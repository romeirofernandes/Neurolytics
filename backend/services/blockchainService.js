const { ethers } = require('ethers');

// Contract Configuration
const CONTRACT_ADDRESS = '0xa606b7092Fe091cDAC6F1be0668B689999d75ed7';
const RPC_URL = 'https://rpc-amoy.polygon.technology/';

// Contract ABI
const CONTRACT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "participant",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "experimentId",
                "type": "string"
            }
        ],
        "name": "awardPoints",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "experimentId",
                "type": "string"
            }
        ],
        "name": "ExperimentSponsored",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "participant",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "experimentId",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "points",
                "type": "uint256"
            }
        ],
        "name": "PointsAwarded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "experimentId",
                "type": "string"
            }
        ],
        "name": "sponsorExperiment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newRate",
                "type": "uint256"
            }
        ],
        "name": "updatePointsRate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "participant",
                "type": "address"
            }
        ],
        "name": "getCompletedExperiments",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPointsPerExperiment",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "participant",
                "type": "address"
            }
        ],
        "name": "getStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "points",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "completed",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "hasCompleted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "participant",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "experimentId",
                "type": "string"
            }
        ],
        "name": "hasCompletedExperiment",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "experimentId",
                "type": "string"
            }
        ],
        "name": "isSponsored",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "participantStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalPoints",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "experimentsCompleted",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pointsPerExperiment",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "name": "sponsoredExperiments",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Connect to Polygon Amoy
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Wallet (from environment variable)
let wallet;
let contract;

try {
  const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
  if (PRIVATE_KEY) {
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  } else {
    console.warn('⚠️ BLOCKCHAIN_PRIVATE_KEY not set in .env');
    // Read-only contract for queries
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }
} catch (error) {
  console.error('Blockchain initialization error:', error);
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Award points to participant after experiment completion
 */
async function awardPoints(experimentId, participantWalletAddress) {
  try {
    if (!wallet) {
      throw new Error('Blockchain private key not configured');
    }

    console.log(`🎯 Awarding points to ${participantWalletAddress} for experiment ${experimentId}...`);
    
    // Check if already completed
    const alreadyCompleted = await contract.hasCompletedExperiment(
      participantWalletAddress,
      experimentId
    );

    if (alreadyCompleted) {
      console.log('⚠️ Participant already completed this experiment');
      return {
        success: false,
        error: 'Already completed this experiment'
      };
    }

    // Award points
    const tx = await contract.awardPoints(participantWalletAddress, experimentId);
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Points awarded! Block: ${receipt.blockNumber}`);
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      points: 100
    };
  } catch (error) {
    console.error('❌ Award points error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get participant stats (points, experiments completed)
 */
async function getParticipantStats(walletAddress) {
  try {
    const stats = await contract.getStats(walletAddress);
    const completedExperiments = await contract.getCompletedExperiments(walletAddress);
    
    return {
      success: true,
      totalPoints: stats[0].toString(),
      experimentsCompleted: stats[1].toString(),
      completedExperiments: completedExperiments
    };
  } catch (error) {
    console.error('❌ Get stats error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if experiment is sponsored
 */
async function isExperimentSponsored(experimentId) {
  try {
    const sponsored = await contract.isSponsored(experimentId);
    return sponsored;
  } catch (error) {
    console.error('❌ Check sponsorship error:', error);
    return false;
  }
}

/**
 * Sponsor an experiment (researcher action)
 */
async function sponsorExperiment(experimentId) {
  try {
    if (!wallet) {
      throw new Error('Blockchain private key not configured');
    }

    console.log(`💎 Sponsoring experiment ${experimentId}...`);
    
    const tx = await contract.sponsorExperiment(experimentId);
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Experiment sponsored! Block: ${receipt.blockNumber}`);
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('❌ Sponsor experiment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get points per experiment
 */
async function getPointsPerExperiment() {
  try {
    const points = await contract.getPointsPerExperiment();
    return points.toString();
  } catch (error) {
    console.error('❌ Get points rate error:', error);
    return '100';
  }
}

/**
 * Check if participant completed specific experiment
 */
async function hasCompletedExperiment(participantWallet, experimentId) {
  try {
    const completed = await contract.hasCompletedExperiment(participantWallet, experimentId);
    return completed;
  } catch (error) {
    console.error('❌ Check completion error:', error);
    return false;
  }
}

module.exports = {
  awardPoints,
  getParticipantStats,
  isExperimentSponsored,
  sponsorExperiment,
  getPointsPerExperiment,
  hasCompletedExperiment,
  CONTRACT_ADDRESS,
  RPC_URL
};