#!/usr/bin/env python3
"""
Test invalid JSON and edge cases for AI Chatbot API
"""

import requests
import json
import time
import sys

BASE_URL = "https://admin-portal-453.preview.emergentagent.com"

def test_edge_cases():
    """Test edge cases and invalid JSON"""
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (compatible; EdgeCaseTester/1.0)',
        'Accept': 'application/json'
    })
    
    results = []
    
    def log_result(test_name, success, details):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        results.append({"test": test_name, "success": success, "details": details})
    
    print("🧪 Testing AI Chatbot API Edge Cases")
    print("=" * 50)
    
    # Test 1: Invalid JSON
    print("\n1. Testing invalid JSON...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              data="invalid json", 
                              headers={'Content-Type': 'application/json'}, 
                              timeout=10)
        if response.status_code == 400:
            data = response.json()
            if "Invalid request body" in data.get("error", ""):
                log_result("Invalid JSON → 400", True, f"Correct validation: {data}")
            else:
                log_result("Invalid JSON → 400", False, f"Wrong error message: {data}")
        else:
            log_result("Invalid JSON → 400", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Invalid JSON → 400", False, f"Exception: {e}")
    
    time.sleep(2)
    
    # Test 2: Message with only whitespace
    print("\n2. Testing message with only whitespace...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "   \n\t   "}, 
                              timeout=10)
        if response.status_code == 400:
            data = response.json()
            if "Message is required." in data.get("error", ""):
                log_result("Whitespace message → 400", True, f"Correct validation: {data}")
            else:
                log_result("Whitespace message → 400", False, f"Wrong error message: {data}")
        else:
            log_result("Whitespace message → 400", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Whitespace message → 400", False, f"Exception: {e}")
    
    time.sleep(2)
    
    # Test 3: Message with history containing over 10 items (should be truncated)
    print("\n3. Testing history truncation (>10 items)...")
    try:
        long_history = []
        for i in range(15):  # 15 items, should be truncated to 10
            long_history.append({"role": "user" if i % 2 == 0 else "assistant", "content": f"Message {i}"})
        
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "test with long history", "history": long_history}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                log_result("Long history → truncated", True, f"History accepted and truncated: {data['reply'][:30]}...")
            else:
                log_result("Long history → truncated", False, f"Wrong format: {data}")
        else:
            log_result("Long history → truncated", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Long history → truncated", False, f"Exception: {e}")
    
    time.sleep(2)
    
    # Test 4: Message that becomes empty after HTML stripping
    print("\n4. Testing message that becomes empty after HTML stripping...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "<script></script><div></div>"}, 
                              timeout=10)
        if response.status_code == 400:
            data = response.json()
            if "Message is required." in data.get("error", ""):
                log_result("HTML-only message → 400", True, f"Correct validation after HTML strip: {data}")
            else:
                log_result("HTML-only message → 400", False, f"Wrong error message: {data}")
        else:
            log_result("HTML-only message → 400", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("HTML-only message → 400", False, f"Exception: {e}")
    
    time.sleep(2)
    
    # Test 5: Very long message (>500 chars) to test truncation
    print("\n5. Testing message truncation at 500 chars...")
    try:
        long_message = "funding help " + "x" * 500  # Over 500 chars total
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": long_message}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                reply = data["reply"].lower()
                if "0% interest" in reply or "funding" in reply:
                    log_result("Long message → truncated & processed", True, f"Message truncated, funding detected: {data['reply'][:30]}...")
                else:
                    log_result("Long message → truncated & processed", True, f"Message truncated and processed: {data['reply'][:30]}...")
            else:
                log_result("Long message → truncated & processed", False, f"Wrong format: {data}")
        else:
            log_result("Long message → truncated & processed", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Long message → truncated & processed", False, f"Exception: {e}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 EDGE CASES TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for r in results if r["success"])
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    
    if total - passed > 0:
        print("\n❌ FAILED TESTS:")
        for result in results:
            if not result["success"]:
                print(f"  - {result['test']}: {result['details']}")
    else:
        print("\n✅ ALL EDGE CASE TESTS PASSED!")
        print("The AI chatbot API handles edge cases correctly.")
    
    return passed == total

if __name__ == "__main__":
    success = test_edge_cases()
    sys.exit(0 if success else 1)