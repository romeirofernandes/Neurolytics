/**
 * Script to fix the duplicate experimentId index issue
 * Run this with: node fix-experiment-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const experimentsCollection = db.collection('experiments');

    // Get current indexes
    const indexes = await experimentsCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    // Check if experimentId_1 index exists
    const hasExperimentIdIndex = indexes.some(idx => idx.name === 'experimentId_1');

    if (hasExperimentIdIndex) {
      console.log('\n🔧 Dropping experimentId_1 index...');
      await experimentsCollection.dropIndex('experimentId_1');
      console.log('✅ Index dropped successfully');
    } else {
      console.log('\n✅ No experimentId_1 index found - nothing to fix');
    }

    // Show updated indexes
    const updatedIndexes = await experimentsCollection.indexes();
    console.log('\n📋 Updated indexes:');
    updatedIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    console.log('\n🎉 Index fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing index:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixIndex();
