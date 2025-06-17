#!/usr/bin/env node

// Test script for ECB Service to validate performance and timeout fixes
import { ECBService } from '../lib/services/ecbService.js';

console.log('🧪 Testing ECB Service Performance...\n');

async function testECBService() {
  try {
    // Test 1: Connection Test
    console.log('1️⃣ Testing ECB API Connection...');
    const startConnection = Date.now();
    const connectionResult = await ECBService.testECBConnection();
    const connectionDuration = Date.now() - startConnection;
    
    console.log(`   Result: ${connectionResult.success ? '✅' : '❌'} ${connectionResult.message}`);
    console.log(`   Duration: ${connectionDuration}ms\n`);

    if (!connectionResult.success) {
      console.log('❌ Connection test failed, skipping update test');
      return;
    }

    // Test 2: Rate Update Performance
    console.log('2️⃣ Testing Exchange Rate Update Performance...');
    const startUpdate = Date.now();
    const updateResult = await ECBService.updateRatesFromECB();
    const updateDuration = Date.now() - startUpdate;
    
    console.log(`   Result: ${updateResult.success ? '✅' : '❌'} ${updateResult.message}`);
    console.log(`   Updated Count: ${updateResult.updatedCount}`);
    console.log(`   Duration: ${updateDuration}ms`);
    console.log(`   Performance: ${updateDuration < 10000 ? '✅ Within 10s timeout' : '❌ Exceeds 10s timeout'}\n`);

    // Test 3: Status Check
    console.log('3️⃣ Testing Status Retrieval...');
    const startStatus = Date.now();
    const statusResult = await ECBService.getECBUpdateStatus();
    const statusDuration = Date.now() - startStatus;
    
    console.log(`   Last Update: ${statusResult.lastUpdate || 'Never'}`);
    console.log(`   Total ECB Rates: ${statusResult.totalECBRates}`);
    console.log(`   Supported Currencies: ${statusResult.supportedCurrencies.length}`);
    console.log(`   Duration: ${statusDuration}ms\n`);

    // Summary
    const totalDuration = connectionDuration + updateDuration + statusDuration;
    console.log('📊 Test Summary:');
    console.log(`   Total Test Duration: ${totalDuration}ms`);
    console.log(`   Function Timeout Compliance: ${totalDuration < 10000 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Update Performance: ${updateDuration < 8000 ? '✅ EXCELLENT' : updateDuration < 10000 ? '⚠️ ACCEPTABLE' : '❌ TOO SLOW'}`);
    
    if (totalDuration < 10000) {
      console.log('\n🎉 ECB Service is optimized and should work within Netlify function timeouts!');
    } else {
      console.log('\n⚠️ ECB Service may still timeout on Netlify. Consider further optimization.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      console.log('\n🔍 Timeout detected - this confirms the timeout protection is working');
    }
  }
}

// Run the test
testECBService().catch(console.error); 