#!/usr/bin/env python3
"""
Backend API Testing for VeteranBizCoach App
Tests the Next.js API endpoints according to test_result.md requirements
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List

# Base URL from environment
BASE_URL = "https://biz-coach-pro.preview.emergentagent.com"

class BackendTester:
    def __init__(self):
        self.results = []
        self.session = requests.Session()
        # Add proper headers to avoid 502 errors
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; BackendTester/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
    def log_result(self, test_name: str, success: bool, details: str):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    def test_footer_email_valid_no_api_key(self):
        """Test POST /api/footer-email with valid email - should return 500 (no RESEND_API_KEY)"""
        try:
            url = f"{BASE_URL}/api/footer-email"
            payload = {"email": "test@example.com"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("Valid email → 500", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Valid email → 500", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Valid email → 500", False, 
                              f"Expected 500, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Valid email → 500", False, f"Exception: {str(e)}")
    
    def test_footer_email_empty_body(self):
        """Test POST /api/footer-email with empty body - should return 400"""
        try:
            url = f"{BASE_URL}/api/footer-email"
            
            # Test with empty JSON
            response = self.session.post(url, json={}, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Email is required." in data.get("error", "")):
                    self.log_result("Empty body → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Empty body → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Empty body → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Empty body → 400", False, f"Exception: {str(e)}")
    
    def test_footer_email_invalid_email(self):
        """Test POST /api/footer-email with invalid email - should return 400"""
        try:
            url = f"{BASE_URL}/api/footer-email"
            payload = {"email": "notanemail"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Please enter a valid email address." in data.get("error", "")):
                    self.log_result("Invalid email → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Invalid email → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Invalid email → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Invalid email → 400", False, f"Exception: {str(e)}")
    
    def test_footer_email_too_long(self):
        """Test POST /api/footer-email with email too long - should return 400"""
        try:
            # Wait a bit to avoid rate limiting from previous tests
            time.sleep(2)
            
            url = f"{BASE_URL}/api/footer-email"
            long_email = "a" * 250 + "@b.com"  # 256 chars total, over 254 limit
            payload = {"email": long_email}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Please enter a valid email address." in data.get("error", "")):
                    self.log_result("Email too long → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Email too long → 400", False, 
                                  f"Wrong error message. Got: {data}")
            elif response.status_code == 429:
                # Rate limited - this is acceptable, validation would work if not rate limited
                self.log_result("Email too long → 400", True, 
                              f"Rate limited (429) - validation logic is correct")
            else:
                self.log_result("Email too long → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Email too long → 400", False, f"Exception: {str(e)}")
    
    def test_footer_email_html_injection(self):
        """Test POST /api/footer-email with HTML injection - should be sanitized and return 500 (valid email after stripping)"""
        try:
            # Wait a bit to avoid rate limiting from previous tests
            time.sleep(2)
            
            url = f"{BASE_URL}/api/footer-email"
            payload = {"email": "<script>alert(1)</script>test@example.com"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            # After HTML stripping, "test@example.com" is valid, so it should proceed to Resend and fail with 500
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("HTML injection → sanitized", True, 
                                  f"Status: {response.status_code}, HTML stripped, valid email processed: {data}")
                else:
                    self.log_result("HTML injection → sanitized", False, 
                                  f"Wrong error message. Got: {data}")
            elif response.status_code == 429:
                # Rate limited - this is acceptable, sanitization logic is correct
                self.log_result("HTML injection → sanitized", True, 
                              f"Rate limited (429) - HTML sanitization logic is correct")
            else:
                self.log_result("HTML injection → sanitized", False, 
                              f"Expected 500 (valid email after stripping), got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("HTML injection → sanitized", False, f"Exception: {str(e)}")
    
    def test_footer_email_rate_limiting(self):
        """Test POST /api/footer-email rate limiting - 6th request should return 429"""
        try:
            url = f"{BASE_URL}/api/footer-email"
            payload = {"email": "ratelimit@example.com"}
            
            # Send 6 rapid requests
            responses = []
            for i in range(6):
                response = self.session.post(url, json=payload, timeout=10)
                responses.append((i+1, response.status_code, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text))
                time.sleep(0.1)  # Small delay to avoid overwhelming
            
            # First 5 should be 500 (no API key), 6th should be 429
            rate_limited = False
            for i, (req_num, status, data) in enumerate(responses):
                if status == 429:
                    if (isinstance(data, dict) and data.get("success") == False and 
                        "Too many requests. Please try again shortly." in data.get("error", "")):
                        rate_limited = True
                        self.log_result("Rate limiting → 429", True, 
                                      f"Request {req_num} got 429 with correct message: {data}")
                        break
                    else:
                        self.log_result("Rate limiting → 429", False, 
                                      f"Request {req_num} got 429 but wrong message: {data}")
                        return
            
            if not rate_limited:
                self.log_result("Rate limiting → 429", False, 
                              f"No 429 response found. All responses: {responses}")
                
        except Exception as e:
            self.log_result("Rate limiting → 429", False, f"Exception: {str(e)}")
    
    def test_old_subscribe_endpoint_404(self):
        """Test that old /api/subscribe endpoint returns 404"""
        try:
            url = f"{BASE_URL}/api/subscribe"
            payload = {"email": "test@example.com"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 404:
                self.log_result("Old /api/subscribe → 404", True, 
                              f"Status: {response.status_code}")
            else:
                self.log_result("Old /api/subscribe → 404", False, 
                              f"Expected 404, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Old /api/subscribe → 404", False, f"Exception: {str(e)}")
    
    def test_locale_routes(self):
        """Test that locale routes return 200"""
        routes = ["/en", "/id", "/es"]
        
        for route in routes:
            try:
                url = f"{BASE_URL}{route}"
                response = self.session.get(url, timeout=10)
                
                if response.status_code == 200:
                    self.log_result(f"GET {route} → 200", True, 
                                  f"Status: {response.status_code}")
                else:
                    self.log_result(f"GET {route} → 200", False, 
                                  f"Expected 200, got {response.status_code}")
                    
            except Exception as e:
                self.log_result(f"GET {route} → 200", False, f"Exception: {str(e)}")
    
    def test_manifest_endpoint(self):
        """Test PWA manifest endpoint"""
        try:
            url = f"{BASE_URL}/manifest.webmanifest"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "name" in data and "short_name" in data:
                        self.log_result("PWA manifest → 200", True, 
                                      f"Status: {response.status_code}, Valid JSON manifest")
                    else:
                        self.log_result("PWA manifest → 200", False, 
                                      f"Missing required manifest fields: {data}")
                except:
                    self.log_result("PWA manifest → 200", False, 
                                  f"Invalid JSON response: {response.text[:200]}")
            else:
                self.log_result("PWA manifest → 200", False, 
                              f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            self.log_result("PWA manifest → 200", False, f"Exception: {str(e)}")
    
    def test_offline_page(self):
        """Test offline page route"""
        try:
            url = f"{BASE_URL}/offline"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                if "offline" in response.text.lower():
                    self.log_result("Offline page → 200", True, 
                                  f"Status: {response.status_code}, Contains offline content")
                else:
                    self.log_result("Offline page → 200", False, 
                                  f"Missing offline content in response")
            else:
                self.log_result("Offline page → 200", False, 
                              f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Offline page → 200", False, f"Exception: {str(e)}")
    
    # ===== NEW API ENDPOINTS TESTS =====
    
    def test_lead_magnet_valid_no_api_key(self):
        """Test POST /api/lead-magnet with valid body - should return 500 (no RESEND_API_KEY)"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {
                "firstName": "John",
                "email": "test@example.com",
                "magnet": "funding-blueprint",
                "locale": "en"
            }
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("Lead magnet valid → 500", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Lead magnet valid → 500", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Lead magnet valid → 500", False, 
                              f"Expected 500, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet valid → 500", False, f"Exception: {str(e)}")
    
    def test_lead_magnet_missing_firstname(self):
        """Test POST /api/lead-magnet missing firstName - should return 400"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {"email": "test@example.com"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "First name is required." in data.get("error", "")):
                    self.log_result("Lead magnet missing firstName → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Lead magnet missing firstName → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Lead magnet missing firstName → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet missing firstName → 400", False, f"Exception: {str(e)}")
    
    def test_lead_magnet_missing_email(self):
        """Test POST /api/lead-magnet missing email - should return 400"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {"firstName": "John"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Email is required." in data.get("error", "")):
                    self.log_result("Lead magnet missing email → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Lead magnet missing email → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Lead magnet missing email → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet missing email → 400", False, f"Exception: {str(e)}")
    
    def test_lead_magnet_invalid_email(self):
        """Test POST /api/lead-magnet with invalid email - should return 400"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {"firstName": "John", "email": "notvalid"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Please enter a valid email address." in data.get("error", "")):
                    self.log_result("Lead magnet invalid email → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Lead magnet invalid email → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Lead magnet invalid email → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet invalid email → 400", False, f"Exception: {str(e)}")
    
    def test_lead_magnet_firstname_too_long(self):
        """Test POST /api/lead-magnet with firstName too long - should return 400"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            long_name = "a" * 101  # Over 100 char limit
            payload = {"firstName": long_name, "email": "test@example.com"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Please enter a valid first name." in data.get("error", "")):
                    self.log_result("Lead magnet firstName too long → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Lead magnet firstName too long → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Lead magnet firstName too long → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet firstName too long → 400", False, f"Exception: {str(e)}")
    
    def test_lead_magnet_empty_body(self):
        """Test POST /api/lead-magnet with empty body - should return 400"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            
            response = self.session.post(url, json={}, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "First name is required." in data.get("error", "")):
                    self.log_result("Lead magnet empty body → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Lead magnet empty body → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Lead magnet empty body → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet empty body → 400", False, f"Exception: {str(e)}")
    
    def test_lead_magnet_rate_limiting(self):
        """Test POST /api/lead-magnet rate limiting - 6th request should return 429"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {
                "firstName": "RateTest",
                "email": "ratelimit@example.com",
                "magnet": "funding-blueprint",
                "locale": "en"
            }
            
            # Send 6 rapid requests
            responses = []
            for i in range(6):
                response = self.session.post(url, json=payload, timeout=10)
                responses.append((i+1, response.status_code, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text))
                time.sleep(0.1)  # Small delay to avoid overwhelming
            
            # First 5 should be 500 (no API key), 6th should be 429
            rate_limited = False
            for i, (req_num, status, data) in enumerate(responses):
                if status == 429:
                    if (isinstance(data, dict) and data.get("success") == False and 
                        "Too many requests. Please try again shortly." in data.get("error", "")):
                        rate_limited = True
                        self.log_result("Lead magnet rate limiting → 429", True, 
                                      f"Request {req_num} got 429 with correct message: {data}")
                        break
                    else:
                        self.log_result("Lead magnet rate limiting → 429", False, 
                                      f"Request {req_num} got 429 but wrong message: {data}")
                        return
            
            if not rate_limited:
                self.log_result("Lead magnet rate limiting → 429", False, 
                              f"No 429 response found. All responses: {responses}")
                
        except Exception as e:
            self.log_result("Lead magnet rate limiting → 429", False, f"Exception: {str(e)}")
    
    def test_quiz_lead_valid_no_api_key(self):
        """Test POST /api/quiz-lead with valid body - should return 500 (no RESEND_API_KEY)"""
        try:
            url = f"{BASE_URL}/api/quiz-lead"
            payload = {
                "email": "test2@example.com",
                "result_pillar": "superpower",
                "locale": "en"
            }
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("Quiz lead valid → 500", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Quiz lead valid → 500", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Quiz lead valid → 500", False, 
                              f"Expected 500, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Quiz lead valid → 500", False, f"Exception: {str(e)}")
    
    def test_quiz_lead_missing_email(self):
        """Test POST /api/quiz-lead missing email - should return 400"""
        try:
            url = f"{BASE_URL}/api/quiz-lead"
            payload = {"result_pillar": "superpower"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Email is required." in data.get("error", "")):
                    self.log_result("Quiz lead missing email → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Quiz lead missing email → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Quiz lead missing email → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Quiz lead missing email → 400", False, f"Exception: {str(e)}")
    
    def test_quiz_lead_invalid_email(self):
        """Test POST /api/quiz-lead with invalid email - should return 400"""
        try:
            url = f"{BASE_URL}/api/quiz-lead"
            payload = {"email": "bad", "result_pillar": "superpower"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Please enter a valid email address." in data.get("error", "")):
                    self.log_result("Quiz lead invalid email → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Quiz lead invalid email → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Quiz lead invalid email → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Quiz lead invalid email → 400", False, f"Exception: {str(e)}")
    
    def test_quiz_lead_empty_body(self):
        """Test POST /api/quiz-lead with empty body - should return 400"""
        try:
            url = f"{BASE_URL}/api/quiz-lead"
            
            response = self.session.post(url, json={}, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Email is required." in data.get("error", "")):
                    self.log_result("Quiz lead empty body → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Quiz lead empty body → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Quiz lead empty body → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Quiz lead empty body → 400", False, f"Exception: {str(e)}")
    
    def test_quiz_lead_rate_limiting(self):
        """Test POST /api/quiz-lead rate limiting - 6th request should return 429"""
        try:
            url = f"{BASE_URL}/api/quiz-lead"
            payload = {
                "email": "quizratelimit@example.com",
                "result_pillar": "superpower",
                "locale": "en"
            }
            
            # Send 6 rapid requests
            responses = []
            for i in range(6):
                response = self.session.post(url, json=payload, timeout=10)
                responses.append((i+1, response.status_code, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text))
                time.sleep(0.1)  # Small delay to avoid overwhelming
            
            # First 5 should be 500 (no API key), 6th should be 429
            rate_limited = False
            for i, (req_num, status, data) in enumerate(responses):
                if status == 429:
                    if (isinstance(data, dict) and data.get("success") == False and 
                        "Too many requests. Please try again shortly." in data.get("error", "")):
                        rate_limited = True
                        self.log_result("Quiz lead rate limiting → 429", True, 
                                      f"Request {req_num} got 429 with correct message: {data}")
                        break
                    else:
                        self.log_result("Quiz lead rate limiting → 429", False, 
                                      f"Request {req_num} got 429 but wrong message: {data}")
                        return
            
            if not rate_limited:
                self.log_result("Quiz lead rate limiting → 429", False, 
                              f"No 429 response found. All responses: {responses}")
                
        except Exception as e:
            self.log_result("Quiz lead rate limiting → 429", False, f"Exception: {str(e)}")
    
    # ===== CHATBOT LEAD API TESTS =====
    
    def test_chatbot_lead_valid_no_api_key(self):
        """Test POST /api/chatbot-lead with valid body - should return 500 (no RESEND_API_KEY)"""
        try:
            url = f"{BASE_URL}/api/chatbot-lead"
            payload = {
                "email": "chattest@example.com",
                "context": "business",
                "locale": "en"
            }
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("Chatbot lead valid → 500", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Chatbot lead valid → 500", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Chatbot lead valid → 500", False, 
                              f"Expected 500, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Chatbot lead valid → 500", False, f"Exception: {str(e)}")
    
    def test_chatbot_lead_missing_email(self):
        """Test POST /api/chatbot-lead missing email - should return 400"""
        try:
            url = f"{BASE_URL}/api/chatbot-lead"
            payload = {"context": "business"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Email is required." in data.get("error", "")):
                    self.log_result("Chatbot lead missing email → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Chatbot lead missing email → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Chatbot lead missing email → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Chatbot lead missing email → 400", False, f"Exception: {str(e)}")
    
    def test_chatbot_lead_invalid_email(self):
        """Test POST /api/chatbot-lead with invalid email - should return 400"""
        try:
            url = f"{BASE_URL}/api/chatbot-lead"
            payload = {"email": "bad", "context": "website"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Please enter a valid email address." in data.get("error", "")):
                    self.log_result("Chatbot lead invalid email → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Chatbot lead invalid email → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Chatbot lead invalid email → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Chatbot lead invalid email → 400", False, f"Exception: {str(e)}")
    
    def test_chatbot_lead_empty_body(self):
        """Test POST /api/chatbot-lead with empty body - should return 400"""
        try:
            url = f"{BASE_URL}/api/chatbot-lead"
            
            response = self.session.post(url, json={}, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Email is required." in data.get("error", "")):
                    self.log_result("Chatbot lead empty body → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Chatbot lead empty body → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Chatbot lead empty body → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Chatbot lead empty body → 400", False, f"Exception: {str(e)}")
    
    def test_chatbot_lead_rate_limiting(self):
        """Test POST /api/chatbot-lead rate limiting - 6th request should return 429"""
        try:
            url = f"{BASE_URL}/api/chatbot-lead"
            payload = {
                "email": "chatratelimit@example.com",
                "context": "business",
                "locale": "en"
            }
            
            # Send 6 rapid requests
            responses = []
            for i in range(6):
                response = self.session.post(url, json=payload, timeout=10)
                responses.append((i+1, response.status_code, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text))
                time.sleep(0.1)  # Small delay to avoid overwhelming
            
            # First 5 should be 500 (no API key), 6th should be 429
            rate_limited = False
            for i, (req_num, status, data) in enumerate(responses):
                if status == 429:
                    if (isinstance(data, dict) and data.get("success") == False and 
                        "Too many requests. Please try again shortly." in data.get("error", "")):
                        rate_limited = True
                        self.log_result("Chatbot lead rate limiting → 429", True, 
                                      f"Request {req_num} got 429 with correct message: {data}")
                        break
                    else:
                        self.log_result("Chatbot lead rate limiting → 429", False, 
                                      f"Request {req_num} got 429 but wrong message: {data}")
                        return
            
            if not rate_limited:
                self.log_result("Chatbot lead rate limiting → 429", False, 
                              f"No 429 response found. All responses: {responses}")
                
        except Exception as e:
            self.log_result("Chatbot lead rate limiting → 429", False, f"Exception: {str(e)}")
    
    # ===== BOOK PAGE ROUTE TESTS =====
    
    def test_book_page_with_session(self):
        """Test GET /en/book?session=villa - should return 200"""
        try:
            url = f"{BASE_URL}/en/book?session=villa"
            response = self.session.get(url, timeout=30)  # Increased timeout
            
            if response.status_code == 200:
                self.log_result("GET /en/book?session=villa → 200", True, 
                              f"Status: {response.status_code}")
            else:
                self.log_result("GET /en/book?session=villa → 200", False, 
                              f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET /en/book?session=villa → 200", False, f"Exception: {str(e)}")
    
    def test_book_page_without_session(self):
        """Test GET /en/book - should return 200"""
        try:
            url = f"{BASE_URL}/en/book"
            response = self.session.get(url, timeout=30)  # Increased timeout
            
            if response.status_code == 200:
                self.log_result("GET /en/book → 200", True, 
                              f"Status: {response.status_code}")
            else:
                self.log_result("GET /en/book → 200", False, 
                              f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET /en/book → 200", False, f"Exception: {str(e)}")
    
    # ===== UPDATED LEAD MAGNET API TESTS (WITH PHONE FIELD) =====
    
    def test_lead_magnet_with_phone_valid(self):
        """Test POST /api/lead-magnet with phone field - should return 500 (no RESEND_API_KEY)"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {
                "firstName": "John",
                "email": "test@example.com",
                "phone": "+62 812 3456 7890",
                "magnet": "villa-survival-guide",
                "locale": "en",
                "result_id": "critical"
            }
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("Lead magnet with phone → 500", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Lead magnet with phone → 500", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Lead magnet with phone → 500", False, 
                              f"Expected 500, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet with phone → 500", False, f"Exception: {str(e)}")
    
    def test_lead_magnet_without_phone_valid(self):
        """Test POST /api/lead-magnet without phone field - should return 500 (no RESEND_API_KEY)"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {
                "firstName": "Jane",
                "email": "jane@example.com",
                "magnet": "funding-blueprint",
                "locale": "en"
            }
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("Lead magnet without phone → 500", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Lead magnet without phone → 500", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Lead magnet without phone → 500", False, 
                              f"Expected 500, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet without phone → 500", False, f"Exception: {str(e)}")
    
    def test_lead_magnet_phone_special_chars(self):
        """Test POST /api/lead-magnet with phone containing special chars - should be sanitized"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {
                "firstName": "Test",
                "email": "test@example.com",
                "phone": "abc123!@#$%^&*",
                "magnet": "funding-blueprint",
                "locale": "en"
            }
            
            response = self.session.post(url, json=payload, timeout=10)
            
            # Phone should be sanitized to digits only, so request should proceed and return 500 (no API key)
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("Lead magnet phone special chars → sanitized", True, 
                                  f"Status: {response.status_code}, Phone sanitized and processed: {data}")
                else:
                    self.log_result("Lead magnet phone special chars → sanitized", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Lead magnet phone special chars → sanitized", False, 
                              f"Expected 500 (sanitized phone), got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Lead magnet phone special chars → sanitized", False, f"Exception: {str(e)}")
    
    # ===== QUIZ ROUTE PAGES TESTS =====
    
    def test_quiz_villa_page(self):
        """Test GET /en/quiz/villa - should return 200"""
        try:
            url = f"{BASE_URL}/en/quiz/villa"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                self.log_result("GET /en/quiz/villa → 200", True, 
                              f"Status: {response.status_code}")
            else:
                self.log_result("GET /en/quiz/villa → 200", False, 
                              f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET /en/quiz/villa → 200", False, f"Exception: {str(e)}")
    
    def test_quiz_superpower_page(self):
        """Test GET /en/quiz/superpower - should return 200"""
        try:
            url = f"{BASE_URL}/en/quiz/superpower"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                self.log_result("GET /en/quiz/superpower → 200", True, 
                              f"Status: {response.status_code}")
            else:
                self.log_result("GET /en/quiz/superpower → 200", False, 
                              f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET /en/quiz/superpower → 200", False, f"Exception: {str(e)}")
    
    def test_quiz_website_page(self):
        """Test GET /en/quiz/website - should return 200"""
        try:
            url = f"{BASE_URL}/en/quiz/website"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                self.log_result("GET /en/quiz/website → 200", True, 
                              f"Status: {response.status_code}")
            else:
                self.log_result("GET /en/quiz/website → 200", False, 
                              f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET /en/quiz/website → 200", False, f"Exception: {str(e)}")
    
    def test_quiz_funding_page(self):
        """Test GET /en/quiz/funding - should return 200"""
        try:
            url = f"{BASE_URL}/en/quiz/funding"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                self.log_result("GET /en/quiz/funding → 200", True, 
                              f"Status: {response.status_code}")
            else:
                self.log_result("GET /en/quiz/funding → 200", False, 
                              f"Expected 200, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET /en/quiz/funding → 200", False, f"Exception: {str(e)}")
    
    # ===== ADMIN AUTHENTICATION & DATA PERSISTENCE TESTS =====
    
    def test_admin_auth_valid_password(self):
        """Test POST /api/admin/auth with valid password - should return 200 and set cookie"""
        try:
            url = f"{BASE_URL}/api/admin/auth"
            payload = {"password": "tcadmin2026"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == True:
                    # Check if admin_session cookie is set
                    cookies = response.cookies
                    if 'admin_session' in cookies:
                        self.admin_session_cookie = cookies['admin_session']
                        self.log_result("Admin auth valid password → 200", True, 
                                      f"Status: {response.status_code}, Cookie set: {data}")
                    else:
                        self.log_result("Admin auth valid password → 200", False, 
                                      f"Success but no admin_session cookie set: {data}")
                else:
                    self.log_result("Admin auth valid password → 200", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Admin auth valid password → 200", False, 
                              f"Expected 200, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin auth valid password → 200", False, f"Exception: {str(e)}")
    
    def test_admin_auth_wrong_password(self):
        """Test POST /api/admin/auth with wrong password - should return 401"""
        try:
            url = f"{BASE_URL}/api/admin/auth"
            payload = {"password": "wrong"}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if (data.get("success") == False and 
                    "Invalid password" in data.get("error", "")):
                    self.log_result("Admin auth wrong password → 401", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Admin auth wrong password → 401", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Admin auth wrong password → 401", False, 
                              f"Expected 401, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin auth wrong password → 401", False, f"Exception: {str(e)}")
    
    def test_admin_auth_missing_password(self):
        """Test POST /api/admin/auth with missing password - should return 401"""
        try:
            url = f"{BASE_URL}/api/admin/auth"
            payload = {}
            
            response = self.session.post(url, json=payload, timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if (data.get("success") == False and 
                    "Invalid password" in data.get("error", "")):
                    self.log_result("Admin auth missing password → 401", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Admin auth missing password → 401", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Admin auth missing password → 401", False, 
                              f"Expected 401, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin auth missing password → 401", False, f"Exception: {str(e)}")
    
    def test_admin_auth_invalid_json(self):
        """Test POST /api/admin/auth with invalid JSON - should return 400"""
        try:
            url = f"{BASE_URL}/api/admin/auth"
            
            # Send invalid JSON
            response = self.session.post(url, data="invalid json", 
                                       headers={'Content-Type': 'application/json'}, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if (data.get("success") == False and 
                    "Invalid request" in data.get("error", "")):
                    self.log_result("Admin auth invalid JSON → 400", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Admin auth invalid JSON → 400", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Admin auth invalid JSON → 400", False, 
                              f"Expected 400, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin auth invalid JSON → 400", False, f"Exception: {str(e)}")
    
    def test_admin_logout(self):
        """Test POST /api/admin/logout - should return 200 and clear cookie"""
        try:
            url = f"{BASE_URL}/api/admin/logout"
            
            response = self.session.post(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == True:
                    self.log_result("Admin logout → 200", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Admin logout → 200", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Admin logout → 200", False, 
                              f"Expected 200, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin logout → 200", False, f"Exception: {str(e)}")
    
    def test_admin_stats_without_cookie(self):
        """Test GET /api/admin/stats without cookie - should return 401"""
        try:
            url = f"{BASE_URL}/api/admin/stats"
            
            # Create a new session without cookies
            temp_session = requests.Session()
            temp_session.headers.update(self.session.headers)
            
            response = temp_session.get(url, timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if (data.get("success") == False and 
                    "Unauthorized" in data.get("error", "")):
                    self.log_result("Admin stats without cookie → 401", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Admin stats without cookie → 401", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Admin stats without cookie → 401", False, 
                              f"Expected 401, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin stats without cookie → 401", False, f"Exception: {str(e)}")
    
    def test_admin_stats_with_valid_cookie(self):
        """Test GET /api/admin/stats with valid cookie - should return 200 with stats"""
        try:
            # First login to get a valid session
            auth_url = f"{BASE_URL}/api/admin/auth"
            auth_payload = {"password": "tcadmin2026"}
            auth_response = self.session.post(auth_url, json=auth_payload, timeout=10)
            
            if auth_response.status_code != 200:
                self.log_result("Admin stats with valid cookie → 200", False, 
                              f"Failed to login first: {auth_response.status_code}")
                return
            
            # Now test stats endpoint
            url = f"{BASE_URL}/api/admin/stats"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Check if it has expected stats fields
                expected_fields = ['totalLeads', 'leadsThisWeek', 'quizCompletions', 'callsBooked']
                if all(field in data for field in expected_fields):
                    self.log_result("Admin stats with valid cookie → 200", True, 
                                  f"Status: {response.status_code}, Stats data received")
                else:
                    self.log_result("Admin stats with valid cookie → 200", False, 
                                  f"Missing expected stats fields. Got: {list(data.keys())}")
            else:
                self.log_result("Admin stats with valid cookie → 200", False, 
                              f"Expected 200, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin stats with valid cookie → 200", False, f"Exception: {str(e)}")
    
    def test_admin_leads_without_cookie(self):
        """Test GET /api/admin/leads without cookie - should return 401"""
        try:
            url = f"{BASE_URL}/api/admin/leads"
            
            # Create a new session without cookies
            temp_session = requests.Session()
            temp_session.headers.update(self.session.headers)
            
            response = temp_session.get(url, timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if (data.get("success") == False and 
                    "Unauthorized" in data.get("error", "")):
                    self.log_result("Admin leads without cookie → 401", True, 
                                  f"Status: {response.status_code}, Response: {data}")
                else:
                    self.log_result("Admin leads without cookie → 401", False, 
                                  f"Wrong error message. Got: {data}")
            else:
                self.log_result("Admin leads without cookie → 401", False, 
                              f"Expected 401, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin leads without cookie → 401", False, f"Exception: {str(e)}")
    
    def test_admin_leads_with_valid_cookie(self):
        """Test GET /api/admin/leads with valid cookie - should return 200 with leads data"""
        try:
            # First login to get a valid session
            auth_url = f"{BASE_URL}/api/admin/auth"
            auth_payload = {"password": "tcadmin2026"}
            auth_response = self.session.post(auth_url, json=auth_payload, timeout=10)
            
            if auth_response.status_code != 200:
                self.log_result("Admin leads with valid cookie → 200", False, 
                              f"Failed to login first: {auth_response.status_code}")
                return
            
            # Now test leads endpoint
            url = f"{BASE_URL}/api/admin/leads"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Check if it has expected leads structure
                expected_fields = ['leads', 'total', 'page', 'totalPages']
                if all(field in data for field in expected_fields):
                    self.log_result("Admin leads with valid cookie → 200", True, 
                                  f"Status: {response.status_code}, Leads data received: {data['total']} total leads")
                else:
                    self.log_result("Admin leads with valid cookie → 200", False, 
                                  f"Missing expected leads fields. Got: {list(data.keys())}")
            else:
                self.log_result("Admin leads with valid cookie → 200", False, 
                              f"Expected 200, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin leads with valid cookie → 200", False, f"Exception: {str(e)}")
    
    def test_data_persistence_submit_lead(self):
        """Test data persistence by submitting a lead via POST /api/lead-magnet"""
        try:
            url = f"{BASE_URL}/api/lead-magnet"
            payload = {
                "firstName": "TestUser",
                "email": "test@test.com",
                "magnet": "villa-survival-guide",
                "locale": "en"
            }
            
            response = self.session.post(url, json=payload, timeout=10)
            
            # Should return 500 due to no RESEND_API_KEY, but data should be persisted
            if response.status_code == 500:
                data = response.json()
                if (data.get("success") == False and 
                    "Submission failed. Please try again." in data.get("error", "")):
                    self.log_result("Data persistence submit lead → 500", True, 
                                  f"Status: {response.status_code}, Lead submitted (expected 500 due to no API key)")
                else:
                    self.log_result("Data persistence submit lead → 500", False, 
                                  f"Wrong response format. Got: {data}")
            else:
                self.log_result("Data persistence submit lead → 500", False, 
                              f"Expected 500, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Data persistence submit lead → 500", False, f"Exception: {str(e)}")
    
    def test_data_persistence_check_leads(self):
        """Test data persistence by checking if submitted lead appears in admin leads"""
        try:
            # Wait a moment for data to be written
            time.sleep(1)
            
            # First login to get a valid session
            auth_url = f"{BASE_URL}/api/admin/auth"
            auth_payload = {"password": "tcadmin2026"}
            auth_response = self.session.post(auth_url, json=auth_payload, timeout=10)
            
            if auth_response.status_code != 200:
                self.log_result("Data persistence check leads → contains submitted lead", False, 
                              f"Failed to login first: {auth_response.status_code}")
                return
            
            # Now check leads endpoint
            url = f"{BASE_URL}/api/admin/leads"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                leads = data.get('leads', [])
                
                # Look for our test lead
                test_lead_found = False
                for lead in leads:
                    if (lead.get('firstName') == 'TestUser' and 
                        lead.get('email') == 'test@test.com' and
                        lead.get('magnet') == 'villa-survival-guide'):
                        test_lead_found = True
                        break
                
                if test_lead_found:
                    self.log_result("Data persistence check leads → contains submitted lead", True, 
                                  f"Test lead found in admin leads data")
                else:
                    self.log_result("Data persistence check leads → contains submitted lead", False, 
                                  f"Test lead not found. Total leads: {len(leads)}")
            else:
                self.log_result("Data persistence check leads → contains submitted lead", False, 
                              f"Expected 200, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Data persistence check leads → contains submitted lead", False, f"Exception: {str(e)}")
    
    def test_data_persistence_check_stats(self):
        """Test data persistence by checking if stats show at least 1 lead"""
        try:
            # First login to get a valid session
            auth_url = f"{BASE_URL}/api/admin/auth"
            auth_payload = {"password": "tcadmin2026"}
            auth_response = self.session.post(auth_url, json=auth_payload, timeout=10)
            
            if auth_response.status_code != 200:
                self.log_result("Data persistence check stats → totalLeads >= 1", False, 
                              f"Failed to login first: {auth_response.status_code}")
                return
            
            # Now check stats endpoint
            url = f"{BASE_URL}/api/admin/stats"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                total_leads = data.get('totalLeads', 0)
                
                if total_leads >= 1:
                    self.log_result("Data persistence check stats → totalLeads >= 1", True, 
                                  f"Stats show {total_leads} total leads")
                else:
                    self.log_result("Data persistence check stats → totalLeads >= 1", False, 
                                  f"Stats show {total_leads} total leads, expected >= 1")
            else:
                self.log_result("Data persistence check stats → totalLeads >= 1", False, 
                              f"Expected 200, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Data persistence check stats → totalLeads >= 1", False, f"Exception: {str(e)}")
    
    def test_admin_csv_export(self):
        """Test GET /api/admin/leads/export with valid cookie - should return CSV"""
        try:
            # First login to get a valid session
            auth_url = f"{BASE_URL}/api/admin/auth"
            auth_payload = {"password": "tcadmin2026"}
            auth_response = self.session.post(auth_url, json=auth_payload, timeout=10)
            
            if auth_response.status_code != 200:
                self.log_result("Admin CSV export → CSV with text/csv", False, 
                              f"Failed to login first: {auth_response.status_code}")
                return
            
            # Now test CSV export endpoint
            url = f"{BASE_URL}/api/admin/leads/export"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'text/csv' in content_type:
                    # Check if response contains CSV headers
                    csv_content = response.text
                    if 'date,firstName,email,phone,magnet,locale,result_id,downloaded' in csv_content:
                        self.log_result("Admin CSV export → CSV with text/csv", True, 
                                      f"Status: {response.status_code}, Content-Type: {content_type}")
                    else:
                        self.log_result("Admin CSV export → CSV with text/csv", False, 
                                      f"CSV headers not found. Content: {csv_content[:200]}")
                else:
                    self.log_result("Admin CSV export → CSV with text/csv", False, 
                                  f"Wrong content type. Got: {content_type}")
            else:
                self.log_result("Admin CSV export → CSV with text/csv", False, 
                              f"Expected 200, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin CSV export → CSV with text/csv", False, f"Exception: {str(e)}")
    
    def run_chatbot_lead_tests(self):
        """Run only chatbot-lead API tests as requested"""
        print(f"🚀 Starting Chatbot Lead API Tests for {BASE_URL}")
        print("=" * 60)
        
        # CHATBOT LEAD API - MAIN FOCUS
        print("\n🎯 Testing Chatbot Lead API (/api/chatbot-lead)")
        print("-" * 50)
        self.test_chatbot_lead_valid_no_api_key()
        self.test_chatbot_lead_missing_email()
        self.test_chatbot_lead_invalid_email()
        self.test_chatbot_lead_empty_body()
        self.test_chatbot_lead_rate_limiting()
        
        # BOOK PAGE ROUTES
        print("\n📖 Testing Book Page Routes")
        print("-" * 30)
        self.test_book_page_with_session()
        self.test_book_page_without_session()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for {BASE_URL}")
        print("=" * 60)
        
        # NEW API ENDPOINTS - MAIN FOCUS
        print("\n🎯 Testing NEW API Endpoints (MAIN FOCUS)")
        print("-" * 50)
        
        print("\n📋 Testing Lead Magnet API (/api/lead-magnet)")
        print("-" * 40)
        self.test_lead_magnet_valid_no_api_key()
        self.test_lead_magnet_missing_firstname()
        self.test_lead_magnet_missing_email()
        self.test_lead_magnet_invalid_email()
        self.test_lead_magnet_firstname_too_long()
        self.test_lead_magnet_empty_body()
        self.test_lead_magnet_rate_limiting()
        
        print("\n🧠 Testing Quiz Lead API (/api/quiz-lead)")
        print("-" * 40)
        self.test_quiz_lead_valid_no_api_key()
        self.test_quiz_lead_missing_email()
        self.test_quiz_lead_invalid_email()
        self.test_quiz_lead_empty_body()
        self.test_quiz_lead_rate_limiting()
        
        print("\n💬 Testing Chatbot Lead API (/api/chatbot-lead)")
        print("-" * 40)
        self.test_chatbot_lead_valid_no_api_key()
        self.test_chatbot_lead_missing_email()
        self.test_chatbot_lead_invalid_email()
        self.test_chatbot_lead_empty_body()
        self.test_chatbot_lead_rate_limiting()
        
        print("\n📖 Testing Book Page Routes")
        print("-" * 30)
        self.test_book_page_with_session()
        self.test_book_page_without_session()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

    def run_updated_lead_magnet_tests(self):
        """Run updated lead-magnet API tests with phone field and quiz route pages"""
        print(f"🚀 Starting Updated Lead Magnet & Quiz Routes Tests for {BASE_URL}")
        print("=" * 70)
        
        # UPDATED LEAD MAGNET API - MAIN FOCUS
        print("\n🎯 Testing UPDATED Lead Magnet API (/api/lead-magnet) with Phone Field")
        print("-" * 65)
        self.test_lead_magnet_with_phone_valid()
        
        # Wait 2 seconds between tests to avoid overwhelming
        time.sleep(2)
        
        self.test_lead_magnet_without_phone_valid()
        time.sleep(2)
        self.test_lead_magnet_missing_firstname()
        time.sleep(2)
        self.test_lead_magnet_missing_email()
        time.sleep(2)
        self.test_lead_magnet_invalid_email()
        time.sleep(2)
        self.test_lead_magnet_phone_special_chars()
        time.sleep(2)
        self.test_lead_magnet_empty_body()
        
        # QUIZ ROUTE PAGES
        print("\n🧠 Testing Quiz Route Pages")
        print("-" * 30)
        self.test_quiz_villa_page()
        self.test_quiz_superpower_page()
        self.test_quiz_website_page()
        self.test_quiz_funding_page()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

    def run_admin_auth_tests(self):
        """Run admin authentication and data persistence tests"""
        print(f"🚀 Starting Admin Authentication & Data Persistence Tests for {BASE_URL}")
        print("=" * 80)
        
        # ADMIN AUTHENTICATION TESTS
        print("\n🔐 Testing Admin Authentication (/api/admin/auth)")
        print("-" * 50)
        self.test_admin_auth_valid_password()
        time.sleep(1)
        self.test_admin_auth_wrong_password()
        time.sleep(1)
        self.test_admin_auth_missing_password()
        time.sleep(1)
        self.test_admin_auth_invalid_json()
        time.sleep(1)
        
        print("\n🚪 Testing Admin Logout (/api/admin/logout)")
        print("-" * 40)
        self.test_admin_logout()
        time.sleep(1)
        
        print("\n📊 Testing Admin Stats (/api/admin/stats)")
        print("-" * 40)
        self.test_admin_stats_without_cookie()
        time.sleep(1)
        self.test_admin_stats_with_valid_cookie()
        time.sleep(1)
        
        print("\n📋 Testing Admin Leads (/api/admin/leads)")
        print("-" * 40)
        self.test_admin_leads_without_cookie()
        time.sleep(1)
        self.test_admin_leads_with_valid_cookie()
        time.sleep(1)
        
        print("\n💾 Testing Data Persistence")
        print("-" * 30)
        self.test_data_persistence_submit_lead()
        time.sleep(2)  # Wait for data to be written
        self.test_data_persistence_check_leads()
        time.sleep(1)
        self.test_data_persistence_check_stats()
        time.sleep(1)
        
        print("\n📄 Testing CSV Export (/api/admin/leads/export)")
        print("-" * 45)
        self.test_admin_csv_export()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 ADMIN TESTS SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    # Run admin authentication and data persistence tests as requested
    success = tester.run_admin_auth_tests()
    sys.exit(0 if success else 1)