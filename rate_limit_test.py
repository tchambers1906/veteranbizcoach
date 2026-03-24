#!/usr/bin/env python3
"""
Rate Limiting Test for AI Chatbot API
"""

import requests
import json
import time
import sys

BASE_URL = "https://admin-portal-453.preview.emergentagent.com"

def test_rate_limiting():
    """Test rate limiting specifically"""
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (compatible; RateLimitTester/1.0)',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    })
    
    print("⏱️ Testing AI Chatbot API Rate Limiting")
    print("=" * 50)
    print("Sending 11 requests rapidly to test 10/minute limit...")
    
    url = f"{BASE_URL}/api/chatbot"
    payload = {"message": "test rate limiting"}
    
    responses = []
    for i in range(11):
        try:
            response = session.post(url, json=payload, timeout=10)
            status = response.status_code
            data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            responses.append((i+1, status, data))
            print(f"Request {i+1}: Status {status}")
            time.sleep(0.2)  # Small delay
        except Exception as e:
            responses.append((i+1, "ERROR", str(e)))
            print(f"Request {i+1}: ERROR - {e}")
    
    print("\n" + "=" * 50)
    print("📊 RATE LIMITING TEST RESULTS")
    print("=" * 50)
    
    success_count = 0
    rate_limited_count = 0
    
    for req_num, status, data in responses:
        if status == 200:
            success_count += 1
            print(f"✅ Request {req_num}: SUCCESS (200)")
        elif status == 429:
            rate_limited_count += 1
            error_msg = data.get('error', '') if isinstance(data, dict) else str(data)
            print(f"🚫 Request {req_num}: RATE LIMITED (429) - {error_msg}")
        else:
            print(f"❓ Request {req_num}: UNEXPECTED ({status}) - {data}")
    
    print(f"\nSummary:")
    print(f"- Successful requests: {success_count}")
    print(f"- Rate limited requests: {rate_limited_count}")
    print(f"- Total requests: {len(responses)}")
    
    # Rate limiting should kick in after 10 requests
    if rate_limited_count > 0 and success_count <= 10:
        print("\n✅ RATE LIMITING WORKING CORRECTLY")
        print(f"Rate limiting activated after {success_count} requests")
        return True
    else:
        print("\n❌ RATE LIMITING NOT WORKING AS EXPECTED")
        return False

if __name__ == "__main__":
    success = test_rate_limiting()
    sys.exit(0 if success else 1)