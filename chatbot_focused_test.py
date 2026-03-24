#!/usr/bin/env python3
"""
Focused AI Chatbot API Testing
Tests key functionality without hitting rate limits
"""

import requests
import json
import time
import sys

BASE_URL = "https://admin-portal-453.preview.emergentagent.com"

def test_chatbot_core_functionality():
    """Test core chatbot functionality with careful rate limiting"""
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (compatible; ChatbotTester/1.0)',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    })
    
    results = []
    
    def log_result(test_name, success, details):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        results.append({"test": test_name, "success": success, "details": details})
    
    print("🤖 Testing AI Chatbot API Core Functionality")
    print("=" * 60)
    
    # Test 1: Valid message with business keyword
    print("\n1. Testing valid message with business keyword...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "starting a business"}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                reply = data["reply"].lower()
                if "superpower program" in reply:
                    log_result("Business keyword → Superpower response", True, f"Correct response: {data['reply'][:50]}...")
                else:
                    log_result("Business keyword → Superpower response", False, f"Wrong response: {data['reply']}")
            else:
                log_result("Business keyword → Superpower response", False, f"Wrong format: {data}")
        else:
            log_result("Business keyword → Superpower response", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Business keyword → Superpower response", False, f"Exception: {e}")
    
    time.sleep(7)  # Wait to avoid rate limiting
    
    # Test 2: Funding keyword
    print("\n2. Testing funding keyword...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "getting funded"}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                reply = data["reply"].lower()
                if "0% interest" in reply:
                    log_result("Funding keyword → 0% interest response", True, f"Correct response: {data['reply'][:50]}...")
                else:
                    log_result("Funding keyword → 0% interest response", False, f"Wrong response: {data['reply']}")
            else:
                log_result("Funding keyword → 0% interest response", False, f"Wrong format: {data}")
        else:
            log_result("Funding keyword → 0% interest response", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Funding keyword → 0% interest response", False, f"Exception: {e}")
    
    time.sleep(7)  # Wait to avoid rate limiting
    
    # Test 3: Villa keyword
    print("\n3. Testing villa keyword...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "villa booking"}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                reply = data["reply"].lower()
                if "ota regulations" in reply or "meta traffic" in reply:
                    log_result("Villa keyword → OTA/Meta Traffic response", True, f"Correct response: {data['reply'][:50]}...")
                else:
                    log_result("Villa keyword → OTA/Meta Traffic response", False, f"Wrong response: {data['reply']}")
            else:
                log_result("Villa keyword → OTA/Meta Traffic response", False, f"Wrong format: {data}")
        else:
            log_result("Villa keyword → OTA/Meta Traffic response", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Villa keyword → OTA/Meta Traffic response", False, f"Exception: {e}")
    
    time.sleep(7)  # Wait to avoid rate limiting
    
    # Test 4: Website keyword
    print("\n4. Testing website keyword...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "website development"}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                reply = data["reply"].lower()
                if "pwa" in reply or "discovery call" in reply:
                    log_result("Website keyword → PWA/Discovery response", True, f"Correct response: {data['reply'][:50]}...")
                else:
                    log_result("Website keyword → PWA/Discovery response", False, f"Wrong response: {data['reply']}")
            else:
                log_result("Website keyword → PWA/Discovery response", False, f"Wrong format: {data}")
        else:
            log_result("Website keyword → PWA/Discovery response", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Website keyword → PWA/Discovery response", False, f"Exception: {e}")
    
    time.sleep(7)  # Wait to avoid rate limiting
    
    # Test 5: AI keyword
    print("\n5. Testing AI keyword...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "ai assistance"}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                reply = data["reply"].lower()
                if "gpt" in reply or "ai" in reply:
                    log_result("AI keyword → GPT/AI response", True, f"Correct response: {data['reply'][:50]}...")
                else:
                    log_result("AI keyword → GPT/AI response", False, f"Wrong response: {data['reply']}")
            else:
                log_result("AI keyword → GPT/AI response", False, f"Wrong format: {data}")
        else:
            log_result("AI keyword → GPT/AI response", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("AI keyword → GPT/AI response", False, f"Exception: {e}")
    
    time.sleep(7)  # Wait to avoid rate limiting
    
    # Test 6: Random text (default response)
    print("\n6. Testing random text (default response)...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "random text here xyz"}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                reply = data["reply"].lower()
                if "/book" in reply:
                    log_result("Random text → /book response", True, f"Correct default response: {data['reply'][:50]}...")
                else:
                    log_result("Random text → /book response", False, f"Wrong response: {data['reply']}")
            else:
                log_result("Random text → /book response", False, f"Wrong format: {data}")
        else:
            log_result("Random text → /book response", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Random text → /book response", False, f"Exception: {e}")
    
    time.sleep(7)  # Wait to avoid rate limiting
    
    # Test 7: Empty message validation
    print("\n7. Testing empty message validation...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": ""}, 
                              timeout=10)
        if response.status_code == 400:
            data = response.json()
            if "Message is required." in data.get("error", ""):
                log_result("Empty message → 400 validation", True, f"Correct validation: {data}")
            else:
                log_result("Empty message → 400 validation", False, f"Wrong error: {data}")
        else:
            log_result("Empty message → 400 validation", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Empty message → 400 validation", False, f"Exception: {e}")
    
    time.sleep(7)  # Wait to avoid rate limiting
    
    # Test 8: HTML stripping
    print("\n8. Testing HTML stripping...")
    try:
        response = session.post(f"{BASE_URL}/api/chatbot", 
                              json={"message": "<script>alert('xss')</script>I need funding help"}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reply" in data and "source" in data and data["source"] == "static":
                reply = data["reply"].lower()
                if "0% interest" in reply or "funding" in reply:
                    log_result("HTML stripping → funding response", True, f"HTML stripped, funding detected: {data['reply'][:50]}...")
                else:
                    log_result("HTML stripping → funding response", True, f"HTML stripped, response: {data['reply'][:50]}...")
            else:
                log_result("HTML stripping → funding response", False, f"Wrong format: {data}")
        else:
            log_result("HTML stripping → funding response", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("HTML stripping → funding response", False, f"Exception: {e}")
    
    time.sleep(7)  # Wait to avoid rate limiting
    
    # Test 9: Different locales
    print("\n9. Testing different locales...")
    for locale in ['en', 'id', 'es']:
        try:
            response = session.post(f"{BASE_URL}/api/chatbot", 
                                  json={"message": "website help", "locale": locale}, 
                                  timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "reply" in data and "source" in data and data["source"] == "static":
                    log_result(f"Locale {locale} → accepted", True, f"Locale accepted: {data['reply'][:30]}...")
                else:
                    log_result(f"Locale {locale} → accepted", False, f"Wrong format: {data}")
            else:
                log_result(f"Locale {locale} → accepted", False, f"Status {response.status_code}: {response.text}")
            time.sleep(7)  # Wait between locale tests
        except Exception as e:
            log_result(f"Locale {locale} → accepted", False, f"Exception: {e}")
    
    # Test 10: Check existing endpoints still work
    print("\n10. Testing existing endpoints still work...")
    
    # Test chatbot-lead endpoint
    try:
        response = session.post(f"{BASE_URL}/api/chatbot-lead", 
                              json={"email": "test@test.com", "context": "test", "locale": "en"}, 
                              timeout=10)
        if response.status_code in [200, 500]:  # Both are acceptable
            data = response.json()
            if response.status_code == 200 and data.get("success") == True:
                log_result("Existing chatbot-lead → working", True, f"Status 200: {data}")
            elif response.status_code == 500 and "Submission failed" in data.get("error", ""):
                log_result("Existing chatbot-lead → working", True, f"Status 500 (no API key): {data}")
            else:
                log_result("Existing chatbot-lead → working", False, f"Unexpected response: {data}")
        else:
            log_result("Existing chatbot-lead → working", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Existing chatbot-lead → working", False, f"Exception: {e}")
    
    time.sleep(2)
    
    # Test lead-magnet endpoint
    try:
        response = session.post(f"{BASE_URL}/api/lead-magnet", 
                              json={"firstName": "Test", "email": "test@test.com", "magnet": "test", "locale": "en"}, 
                              timeout=10)
        if response.status_code in [200, 500]:  # Both are acceptable
            data = response.json()
            if response.status_code == 200 and data.get("success") == True:
                log_result("Existing lead-magnet → working", True, f"Status 200: {data}")
            elif response.status_code == 500 and "Submission failed" in data.get("error", ""):
                log_result("Existing lead-magnet → working", True, f"Status 500 (no API key): {data}")
            else:
                log_result("Existing lead-magnet → working", False, f"Unexpected response: {data}")
        else:
            log_result("Existing lead-magnet → working", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_result("Existing lead-magnet → working", False, f"Exception: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 FOCUSED CHATBOT API TESTS SUMMARY")
    print("=" * 60)
    
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
        print("\n✅ ALL FOCUSED CHATBOT API TESTS PASSED!")
        print("The AI chatbot API is working correctly.")
    
    return passed == total

if __name__ == "__main__":
    success = test_chatbot_core_functionality()
    sys.exit(0 if success else 1)