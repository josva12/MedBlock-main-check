// --- Ethereum Blockchain Service for MedBlock ---
const Web3 = require('web3');
const logger = require('../utils/logger');
require('dotenv').config();

// --- Configuration ---
const ETH_NODE_URL = process.env.ETH_NODE_URL; // e.g., Infura/Alchemy endpoint
const PRIVATE_KEY = process.env.ETH_PRIVATE_KEY; // Private key of the sender (NEVER commit this!)
const CONTRACT_ADDRESS = process.env.ETH_CONTRACT_ADDRESS; // Deployed contract address
const CONTRACT_ABI = [
  // Minimal ABI for event logging (expand as needed)
  {
    "constant": false,
    "inputs": [
      { "name": "eventType", "type": "string" },
      { "name": "entityId", "type": "string" },
      { "name": "dataHash", "type": "string" }
    ],
    "name": "logHealthEvent",
    "outputs": [],
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "eventType", "type": "string" },
      { "indexed": true, "name": "entityId", "type": "string" },
      { "indexed": false, "name": "dataHash", "type": "string" },
      { "indexed": false, "name": "timestamp", "type": "uint256" }
    ],
    "name": "HealthEventLogged",
    "type": "event"
  }
];

// --- Web3 Setup ---
const web3 = new Web3(ETH_NODE_URL);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// --- Blockchain Service ---
class BlockchainService {
  /**
   * Record a health event on the blockchain
   * @param {Object} params
   * @param {string} params.eventType - e.g., 'MedicalRecord', 'Claim', 'InsuranceEnrollment', 'PharmacyDispense'
   * @param {string} params.entityId - The unique ID of the entity (record, claim, etc.)
   * @param {string} params.dataHash - Hash of the data being recorded
   * @returns {Promise<Object>} Transaction details
   */
  async recordEvent({ eventType, entityId, dataHash }) {
    try {
      logger.info('Recording event on Ethereum', { eventType, entityId, dataHash });
      const tx = contract.methods.logHealthEvent(eventType, entityId, dataHash);
      const gas = await tx.estimateGas({ from: account.address });
      const txData = tx.encodeABI();
      const txObj = {
        from: account.address,
        to: CONTRACT_ADDRESS,
        data: txData,
        gas
      };
      const receipt = await web3.eth.sendTransaction(txObj);
      logger.audit('blockchain_event_recorded', account.address, `${eventType}:${entityId}`, {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        eventType,
        entityId,
        dataHash
      });
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        success: true
      };
    } catch (error) {
      logger.error('Failed to record event on Ethereum', { error: error.message });
      throw new Error('Blockchain recording failed: ' + error.message);
    }
  }

  /**
   * Verify a transaction on the blockchain
   * @param {string} transactionHash
   * @returns {Promise<Object>} Verification result
   */
  async verifyEvent(transactionHash) {
    try {
      const receipt = await web3.eth.getTransactionReceipt(transactionHash);
      const isVerified = receipt && receipt.status;
      return {
        isVerified,
        blockNumber: receipt ? receipt.blockNumber : null,
        success: !!isVerified
      };
    } catch (error) {
      logger.error('Failed to verify transaction on Ethereum', { error: error.message });
      throw new Error('Blockchain verification failed: ' + error.message);
    }
  }

  /**
   * Get transaction details from the blockchain
   * @param {string} transactionHash
   * @returns {Promise<Object>} Transaction details
   */
  async getTransactionDetails(transactionHash) {
    try {
      const tx = await web3.eth.getTransaction(transactionHash);
      const receipt = await web3.eth.getTransactionReceipt(transactionHash);
      return {
        transaction: tx,
        receipt
      };
    } catch (error) {
      logger.error('Failed to get transaction details from Ethereum', { error: error.message });
      throw new Error('Get transaction details failed: ' + error.message);
    }
  }
}

/**
 * Record a claim event on the blockchain
 * @param {Object} params
 * @param {string} params.policyId
 * @param {string} params.patientId
 * @param {string} params.facilityId
 * @param {number} params.claimAmount
 * @returns {Promise<string>} Transaction hash
 */
async function recordClaim({ policyId, patientId, facilityId, claimAmount }) {
  const blockchainService = new BlockchainService();
  // For claims, hash the claim data for privacy
  const dataHash = web3.utils.sha3(`${policyId}:${patientId}:${facilityId}:${claimAmount}`);
  const result = await blockchainService.recordEvent({
    eventType: 'Claim',
    entityId: policyId,
    dataHash
  });
  return result.transactionHash;
}

module.exports = {
  BlockchainService,
  recordClaim
};

// --- TODOs ---
// 1. Deploy a simple HealthEventLogger contract to Ethereum and set CONTRACT_ADDRESS/ABI.
// 2. Store ETH_NODE_URL and ETH_PRIVATE_KEY in your .env file.
// 3. Expand ABI and service as needed for more event types and data. 