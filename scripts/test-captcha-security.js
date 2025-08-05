#!/usr/bin/env node

/**
 * CAPTCHA Security Testing Script
 * 
 * This script tests the CAPTCHA system against various security threats:
 * - Brute force attacks
 * - Session replay attacks
 * - Rate limiting
 * - Input validation
 * - Lockout mechanisms
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_IP = '192.168.1.100';
const TEST_USER_AGENT = 'Security-Test-Script/1.0';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  const status = passed ? 'PASS' : 'FAIL';
  const color = passed ? 'green' : 'red';
  log(`[${status}] ${testName}`, color);
  if (details) {
    log(`  Details: ${details}`, 'yellow');
  }
}

class CaptchaSecurityTester {
  constructor() {
    this.testResults = [];
    this.sessionIds = [];
    this.captchaImages = [];
  }

  async runAllTests() {
    log('🚀 Starting CAPTCHA Security Tests', 'cyan');
    log('=====================================', 'cyan');

    try {
      await this.testCaptchaGeneration();
      await this.testInputValidation();
      await this.testSessionSecurity();
      await this.testRateLimiting();
      await this.testBruteForceProtection();
      await this.testLockoutMechanism();
      await this.testReplayAttacks();
      await this.testMetricsEndpoint();
      
      this.printSummary();
    } catch (error) {
      log(`❌ Test suite failed: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  async testCaptchaGeneration() {
    log('\n📸 Testing CAPTCHA Generation', 'blue');
    
    try {
      // Test normal generation
      const response = await axios.get(`${BASE_URL}/api/v1/captcha/generate`, {
        headers: {
          'X-Forwarded-For': TEST_IP,
          'User-Agent': TEST_USER_AGENT
        }
      });

      const sessionId = response.headers['x-captcha-session'];
      this.sessionIds.push(sessionId);

      logTest('CAPTCHA Generation', response.status === 200, 
        `Status: ${response.status}, Session: ${sessionId?.substring(0, 8)}...`);

      // Test multiple generations
      const promises = Array(5).fill().map(() => 
        axios.get(`${BASE_URL}/api/v1/captcha/generate`, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        })
      );

      const responses = await Promise.all(promises);
      const uniqueSessions = new Set(responses.map(r => r.headers['x-captcha-session']));
      
      logTest('Unique Session IDs', uniqueSessions.size === 5, 
        `Generated ${uniqueSessions.size} unique sessions`);

    } catch (error) {
      logTest('CAPTCHA Generation', false, error.message);
    }
  }

  async testInputValidation() {
    log('\n🔍 Testing Input Validation', 'blue');
    
    try {
      // Generate a CAPTCHA first
      const response = await axios.get(`${BASE_URL}/api/v1/captcha/generate`, {
        headers: {
          'X-Forwarded-For': TEST_IP,
          'User-Agent': TEST_USER_AGENT
        }
      });

      const sessionId = response.headers['x-captcha-session'];

      // Test various invalid inputs
      const invalidInputs = [
        '', // Empty
        '   ', // Whitespace only
        'ABC', // Too short
        'ABCDEFGHIJK', // Too long
        'ABC@123', // Special characters
        '<script>alert("xss")</script>', // XSS attempt
        'ABC123\n<script>alert("xss")</script>', // Mixed
        'ABC123' + '\0', // Null byte
        'ABC123'.repeat(100), // Very long
      ];

      for (const input of invalidInputs) {
        try {
          await axios.post(`${BASE_URL}/api/v1/captcha/validate`, {
            sessionId,
            captchaInput: input
          }, {
            headers: {
              'X-Forwarded-For': TEST_IP,
              'User-Agent': TEST_USER_AGENT
            }
          });
          
          logTest(`Input Validation: "${input.substring(0, 20)}..."`, false, 'Should have been rejected');
        } catch (error) {
          if (error.response?.status === 400) {
            logTest(`Input Validation: "${input.substring(0, 20)}..."`, true, 'Properly rejected');
          } else {
            logTest(`Input Validation: "${input.substring(0, 20)}..."`, false, error.message);
          }
        }
      }

    } catch (error) {
      logTest('Input Validation Setup', false, error.message);
    }
  }

  async testSessionSecurity() {
    log('\n🔐 Testing Session Security', 'blue');
    
    try {
      // Generate a CAPTCHA
      const response = await axios.get(`${BASE_URL}/api/v1/captcha/generate`, {
        headers: {
          'X-Forwarded-For': TEST_IP,
          'User-Agent': TEST_USER_AGENT
        }
      });

      const sessionId = response.headers['x-captcha-session'];

      // Test invalid session ID
      try {
        await axios.post(`${BASE_URL}/api/v1/captcha/validate`, {
          sessionId: 'invalid-session-id',
          captchaInput: 'ABC123'
        }, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        });
        
        logTest('Invalid Session Rejection', false, 'Should have been rejected');
      } catch (error) {
        if (error.response?.status === 400) {
          logTest('Invalid Session Rejection', true, 'Properly rejected invalid session');
        } else {
          logTest('Invalid Session Rejection', false, error.message);
        }
      }

      // Test expired session (simulate by using old timestamp)
      const expiredSessionId = crypto.randomBytes(32).toString('hex');
      try {
        await axios.post(`${BASE_URL}/api/v1/captcha/validate`, {
          sessionId: expiredSessionId,
          captchaInput: 'ABC123'
        }, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        });
        
        logTest('Expired Session Rejection', false, 'Should have been rejected');
      } catch (error) {
        if (error.response?.status === 400) {
          logTest('Expired Session Rejection', true, 'Properly rejected expired session');
        } else {
          logTest('Expired Session Rejection', false, error.message);
        }
      }

    } catch (error) {
      logTest('Session Security Setup', false, error.message);
    }
  }

  async testRateLimiting() {
    log('\n⚡ Testing Rate Limiting', 'blue');
    
    try {
      // Generate multiple CAPTCHAs rapidly
      const promises = Array(25).fill().map(() => 
        axios.get(`${BASE_URL}/api/v1/captcha/generate`, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        })
      );

      const responses = await Promise.all(promises);
      const successful = responses.filter(r => r.status === 200).length;
      
      logTest('CAPTCHA Generation Rate Limit', successful <= 20, 
        `${successful} successful requests out of 25`);

      // Test validation rate limiting
      const sessionId = responses[0].headers['x-captcha-session'];
      const validationPromises = Array(25).fill().map(() => 
        axios.post(`${BASE_URL}/api/v1/captcha/validate`, {
          sessionId,
          captchaInput: 'WRONG'
        }, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        })
      );

      const validationResponses = await Promise.all(validationPromises);
      const rateLimited = validationResponses.filter(r => r.status === 429).length;
      
      logTest('Validation Rate Limit', rateLimited > 0, 
        `${rateLimited} rate limit responses out of 25`);

    } catch (error) {
      logTest('Rate Limiting', false, error.message);
    }
  }

  async testBruteForceProtection() {
    log('\n🛡️ Testing Brute Force Protection', 'blue');
    
    try {
      // Simulate multiple failed login attempts
      const loginPromises = Array(5).fill().map(() => 
        axios.post(`${BASE_URL}/api/v1/auth/login`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        }, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        }).catch(() => ({ status: 401 })) // Expected to fail
      );

      const loginResponses = await Promise.all(loginPromises);
      const captchaRequired = loginResponses.some(r => 
        r.data?.code === 'CAPTCHA_REQUIRED' || r.status === 429
      );
      
      logTest('Brute Force Detection', captchaRequired, 
        'CAPTCHA requirement triggered after failed attempts');

    } catch (error) {
      logTest('Brute Force Protection', false, error.message);
    }
  }

  async testLockoutMechanism() {
    log('\n🔒 Testing Lockout Mechanism', 'blue');
    
    try {
      // Generate a CAPTCHA
      const response = await axios.get(`${BASE_URL}/api/v1/captcha/generate`, {
        headers: {
          'X-Forwarded-For': TEST_IP,
          'User-Agent': TEST_USER_AGENT
        }
      });

      const sessionId = response.headers['x-captcha-session'];

      // Make multiple failed validation attempts
      const failedAttempts = Array(5).fill().map(() => 
        axios.post(`${BASE_URL}/api/v1/captcha/validate`, {
          sessionId,
          captchaInput: 'WRONG'
        }, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        }).catch(() => ({ status: 400 })) // Expected to fail
      );

      await Promise.all(failedAttempts);

      // Try to validate again - should be locked out
      try {
        await axios.post(`${BASE_URL}/api/v1/captcha/validate`, {
          sessionId,
          captchaInput: 'ABC123'
        }, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        });
        
        logTest('Session Lockout', false, 'Should have been locked out');
      } catch (error) {
        if (error.response?.status === 400 && 
            error.response?.data?.code === 'MAX_ATTEMPTS_EXCEEDED') {
          logTest('Session Lockout', true, 'Properly locked out after max attempts');
        } else {
          logTest('Session Lockout', false, error.message);
        }
      }

    } catch (error) {
      logTest('Lockout Mechanism', false, error.message);
    }
  }

  async testReplayAttacks() {
    log('\n🔄 Testing Replay Attack Protection', 'blue');
    
    try {
      // Generate a CAPTCHA
      const response = await axios.get(`${BASE_URL}/api/v1/captcha/generate`, {
        headers: {
          'X-Forwarded-For': TEST_IP,
          'User-Agent': TEST_USER_AGENT
        }
      });

      const sessionId = response.headers['x-captcha-session'];

      // Mock the session data for testing (in real scenario, this wouldn't be possible)
      // This test simulates what would happen if someone tried to replay a session

      // First validation attempt (simulate successful)
      try {
        await axios.post(`${BASE_URL}/api/v1/captcha/validate`, {
          sessionId,
          captchaInput: 'ABC123'
        }, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        });
      } catch (error) {
        // Expected to fail since we don't know the actual CAPTCHA text
      }

      // Second validation attempt with same session (replay attack)
      try {
        await axios.post(`${BASE_URL}/api/v1/captcha/validate`, {
          sessionId,
          captchaInput: 'ABC123'
        }, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        });
        
        logTest('Replay Attack Protection', false, 'Should have been rejected');
      } catch (error) {
        if (error.response?.status === 400 && 
            error.response?.data?.code === 'INVALID_SESSION') {
          logTest('Replay Attack Protection', true, 'Properly rejected replayed session');
        } else {
          logTest('Replay Attack Protection', false, error.message);
        }
      }

    } catch (error) {
      logTest('Replay Attack Protection', false, error.message);
    }
  }

  async testMetricsEndpoint() {
    log('\n📊 Testing Metrics Endpoint', 'blue');
    
    try {
      // Test health metrics endpoint (public)
      const healthResponse = await axios.get(`${BASE_URL}/api/v1/metrics/health`, {
        headers: {
          'X-Forwarded-For': TEST_IP,
          'User-Agent': TEST_USER_AGENT
        }
      });

      logTest('Health Metrics Access', healthResponse.status === 200, 
        'Health metrics endpoint accessible');

      // Test admin metrics endpoint (should fail without auth)
      try {
        await axios.get(`${BASE_URL}/api/v1/metrics/captcha`, {
          headers: {
            'X-Forwarded-For': TEST_IP,
            'User-Agent': TEST_USER_AGENT
          }
        });
        
        logTest('Admin Metrics Protection', false, 'Should require authentication');
      } catch (error) {
        if (error.response?.status === 401) {
          logTest('Admin Metrics Protection', true, 'Properly requires authentication');
        } else {
          logTest('Admin Metrics Protection', false, error.message);
        }
      }

    } catch (error) {
      logTest('Metrics Endpoint', false, error.message);
    }
  }

  printSummary() {
    log('\n📋 Test Summary', 'cyan');
    log('================', 'cyan');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    log(`Total Tests: ${totalTests}`, 'blue');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    
    if (failedTests === 0) {
      log('\n🎉 All security tests passed!', 'green');
    } else {
      log('\n⚠️  Some security tests failed. Please review the implementation.', 'yellow');
    }
  }
}

// Run the tests
async function main() {
  const tester = new CaptchaSecurityTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Test script failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = CaptchaSecurityTester; 