const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');

// Award points to participant after experiment completion
router.post('/points/award', async (req, res) => {
  try {
    const { experimentId, participantWallet } = req.body;
    
    if (!participantWallet) {
      return res.status(400).json({
        success: false,
        message: 'Participant wallet address required'
      });
    }

    if (!experimentId) {
      return res.status(400).json({
        success: false,
        message: 'Experiment ID required'
      });
    }

    const result = await blockchainService.awardPoints(experimentId, participantWallet);
    
    if (result.success) {
      res.json({
        success: true,
        message: '🎉 100 points earned!',
        points: result.points,
        transactionHash: result.transactionHash,
        explorerUrl: `https://amoy.polygonscan.com/tx/${result.transactionHash}`
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: error.message
    });
  }
});

// Get participant stats
router.get('/stats/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const stats = await blockchainService.getParticipantStats(walletAddress);
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check if participant completed specific experiment
router.get('/completed/:walletAddress/:experimentId', async (req, res) => {
  try {
    const { walletAddress, experimentId } = req.params;
    const completed = await blockchainService.hasCompletedExperiment(walletAddress, experimentId);
    res.json({ success: true, completed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if experiment is sponsored
router.get('/sponsored/:experimentId', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const sponsored = await blockchainService.isExperimentSponsored(experimentId);
    res.json({ success: true, sponsored });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sponsor an experiment (researcher pays on frontend via MetaMask)
router.post('/sponsor', async (req, res) => {
  try {
    const { experimentId } = req.body;
    
    if (!experimentId) {
      return res.status(400).json({
        success: false,
        message: 'Experiment ID required'
      });
    }

    const result = await blockchainService.sponsorExperiment(experimentId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Experiment sponsored successfully!',
        transactionHash: result.transactionHash,
        explorerUrl: `https://amoy.polygonscan.com/tx/${result.transactionHash}`
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get contract info
router.get('/contract/info', async (req, res) => {
  try {
    const pointsPerExperiment = await blockchainService.getPointsPerExperiment();
    
    res.json({
      success: true,
      contractAddress: blockchainService.CONTRACT_ADDRESS,
      network: 'Polygon Amoy Testnet',
      explorer: `https://amoy.polygonscan.com/address/${blockchainService.CONTRACT_ADDRESS}`,
      pointsPerExperiment: pointsPerExperiment,
      rpcUrl: blockchainService.RPC_URL
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;