#!/usr/bin/env python3
"""
KingChat Backend API Test Suite
Comprehensive testing for all backend endpoints
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

class KingChatAPITester:
    def __init__(self):
        self.base_url = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        if not self.base_url.endswith('/api'):
            self.base_url += '/api'
        
        self.session = requests.Session()
        self.auth_token = None
        self.demo_user = None
        self.test_results = []
        
        print(f"🔧 Testing KingChat API at: {self.base_url}")
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   📝 {details}")
        if not success and response_data:
            print(f"   🔍 Response: {response_data}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = kwargs.get('headers', {})
        
        if self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'
        
        kwargs['headers'] = headers
        
        try:
            response = self.session.request(method, url, **kwargs)
            return response
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            raise
    
    def test_health_endpoints(self):
        """Test basic health check endpoints"""
        print("\n🏥 Testing Health Endpoints...")
        
        # Test root endpoint
        try:
            response = self.make_request('GET', '/')
            if response.status_code == 200:
                data = response.json()
                if "KingChat API is running" in data.get('message', ''):
                    self.log_test("Root endpoint", True, f"Status: {response.status_code}")
                else:
                    self.log_test("Root endpoint", False, f"Unexpected message: {data}")
            else:
                self.log_test("Root endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Root endpoint", False, f"Exception: {str(e)}")
        
        # Test health endpoint
        try:
            response = self.make_request('GET', '/health')
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test("Health check", True, f"Service: {data.get('service')}")
                else:
                    self.log_test("Health check", False, f"Status not healthy: {data}")
            else:
                self.log_test("Health check", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Health check", False, f"Exception: {str(e)}")
    
    def test_authentication(self):
        """Test authentication system"""
        print("\n🔐 Testing Authentication...")
        
        # Test demo login
        try:
            response = self.make_request('POST', '/auth/demo-login')
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data and 'user' in data:
                    self.auth_token = data['access_token']
                    self.demo_user = data['user']
                    self.log_test("Demo login", True, f"User: {data['user']['name']}")
                else:
                    self.log_test("Demo login", False, f"Missing token or user: {data}")
            else:
                self.log_test("Demo login", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Demo login", False, f"Exception: {str(e)}")
        
        # Test get current user (requires auth)
        if self.auth_token:
            try:
                response = self.make_request('GET', '/auth/me')
                if response.status_code == 200:
                    data = response.json()
                    if data.get('id') == self.demo_user['id']:
                        self.log_test("Get current user", True, f"Authenticated as: {data['name']}")
                    else:
                        self.log_test("Get current user", False, f"User mismatch: {data}")
                else:
                    self.log_test("Get current user", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Get current user", False, f"Exception: {str(e)}")
        else:
            self.log_test("Get current user", False, "No auth token available")
    
    def test_chat_management(self):
        """Test chat creation and management"""
        print("\n💬 Testing Chat Management...")
        
        if not self.auth_token:
            self.log_test("Chat management", False, "No authentication token")
            return
        
        # Test get user chats
        try:
            response = self.make_request('GET', '/chats')
            if response.status_code == 200:
                chats = response.json()
                self.log_test("Get user chats", True, f"Found {len(chats)} chats")
                self.existing_chats = chats
            else:
                self.log_test("Get user chats", False, f"Status: {response.status_code}")
                self.existing_chats = []
        except Exception as e:
            self.log_test("Get user chats", False, f"Exception: {str(e)}")
            self.existing_chats = []
        
        # Test create private chat
        try:
            chat_data = {
                "name": "João Silva",
                "type": "private",
                "description": "Chat privado de teste",
                "participants": ["user_joao_123"],
                "is_public": False
            }
            response = self.make_request('POST', '/chats', json=chat_data)
            if response.status_code == 200:
                chat = response.json()
                self.test_private_chat_id = chat['id']
                self.log_test("Create private chat", True, f"Chat ID: {chat['id']}")
            else:
                self.log_test("Create private chat", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create private chat", False, f"Exception: {str(e)}")
        
        # Test create group chat
        try:
            chat_data = {
                "name": "Grupo de Trabalho 💼",
                "type": "group",
                "description": "Grupo para discussões de trabalho",
                "participants": ["user_ana_456", "user_carlos_789"],
                "is_public": False
            }
            response = self.make_request('POST', '/chats', json=chat_data)
            if response.status_code == 200:
                chat = response.json()
                self.test_group_chat_id = chat['id']
                self.log_test("Create group chat", True, f"Chat ID: {chat['id']}")
            else:
                self.log_test("Create group chat", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create group chat", False, f"Exception: {str(e)}")
        
        # Test create channel
        try:
            chat_data = {
                "name": "Canal de Notícias 📢",
                "type": "channel",
                "description": "Canal público para notícias importantes",
                "participants": [],
                "is_public": True
            }
            response = self.make_request('POST', '/chats', json=chat_data)
            if response.status_code == 200:
                chat = response.json()
                self.test_channel_id = chat['id']
                self.log_test("Create channel", True, f"Channel ID: {chat['id']}")
            else:
                self.log_test("Create channel", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create channel", False, f"Exception: {str(e)}")
        
        # Test create bot chat
        try:
            chat_data = {
                "name": "🤖 TestBot",
                "type": "bot",
                "description": "Bot de teste para automação",
                "participants": ["bot_test_123"],
                "is_public": False
            }
            response = self.make_request('POST', '/chats', json=chat_data)
            if response.status_code == 200:
                chat = response.json()
                self.test_bot_chat_id = chat['id']
                self.log_test("Create bot chat", True, f"Bot Chat ID: {chat['id']}")
            else:
                self.log_test("Create bot chat", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Create bot chat", False, f"Exception: {str(e)}")
    
    def test_specific_chat_operations(self):
        """Test operations on specific chats"""
        print("\n🔍 Testing Specific Chat Operations...")
        
        if not self.auth_token:
            self.log_test("Specific chat operations", False, "No authentication token")
            return
        
        # Test get specific chat (using demo chat if available)
        test_chat_id = getattr(self, 'test_private_chat_id', None)
        if not test_chat_id and hasattr(self, 'existing_chats') and self.existing_chats:
            test_chat_id = self.existing_chats[0]['id']
        
        if test_chat_id:
            try:
                response = self.make_request('GET', f'/chats/{test_chat_id}')
                if response.status_code == 200:
                    chat = response.json()
                    self.log_test("Get specific chat", True, f"Chat: {chat['name']}")
                else:
                    self.log_test("Get specific chat", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Get specific chat", False, f"Exception: {str(e)}")
        
        # Test get chats by type
        for chat_type in ['private', 'group', 'channel', 'bot']:
            try:
                response = self.make_request('GET', f'/chats?chat_type={chat_type}')
                if response.status_code == 200:
                    chats = response.json()
                    self.log_test(f"Get {chat_type} chats", True, f"Found {len(chats)} {chat_type} chats")
                else:
                    self.log_test(f"Get {chat_type} chats", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Get {chat_type} chats", False, f"Exception: {str(e)}")
    
    def test_message_operations(self):
        """Test message sending and retrieval"""
        print("\n📨 Testing Message Operations...")
        
        if not self.auth_token:
            self.log_test("Message operations", False, "No authentication token")
            return
        
        # Get a chat to send messages to
        test_chat_id = getattr(self, 'test_private_chat_id', None)
        if not test_chat_id and hasattr(self, 'existing_chats') and self.existing_chats:
            test_chat_id = self.existing_chats[0]['id']
        
        if not test_chat_id:
            self.log_test("Message operations", False, "No chat available for testing")
            return
        
        # Test send text message
        try:
            message_data = {
                "chat_id": test_chat_id,
                "text": "Olá! Esta é uma mensagem de teste do KingChat! 👋",
                "message_type": "text"
            }
            response = self.make_request('POST', f'/chats/{test_chat_id}/messages', json=message_data)
            if response.status_code == 200:
                message_response = response.json()
                message = message_response.get('message', message_response)
                self.test_message_id = message['id']
                self.log_test("Send text message", True, f"Message ID: {message['id']}")
            else:
                self.log_test("Send text message", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Send text message", False, f"Exception: {str(e)}")
        
        # Test send reply message
        if hasattr(self, 'test_message_id'):
            try:
                reply_data = {
                    "text": "Esta é uma resposta à mensagem anterior! 💬",
                    "message_type": "text",
                    "reply_to": self.test_message_id
                }
                response = self.make_request('POST', f'/chats/{test_chat_id}/messages', json=reply_data)
                if response.status_code == 200:
                    reply_response = response.json()
                    reply = reply_response.get('message', reply_response)
                    self.test_reply_id = reply['id']
                    self.log_test("Send reply message", True, f"Reply ID: {reply['id']}")
                else:
                    self.log_test("Send reply message", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Send reply message", False, f"Exception: {str(e)}")
        
        # Test get chat messages
        try:
            response = self.make_request('GET', f'/chats/{test_chat_id}/messages?limit=10')
            if response.status_code == 200:
                messages = response.json()
                self.log_test("Get chat messages", True, f"Retrieved {len(messages)} messages")
            else:
                self.log_test("Get chat messages", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get chat messages", False, f"Exception: {str(e)}")
        
        # Test message editing
        if hasattr(self, 'test_message_id'):
            try:
                edit_data = {
                    "text": "Mensagem editada! ✏️ (Esta mensagem foi modificada)"
                }
                response = self.make_request('PUT', f'/messages/{self.test_message_id}', json=edit_data)
                if response.status_code == 200:
                    edited_message = response.json()
                    self.log_test("Edit message", True, f"Message edited: {edited_message['is_edited']}")
                else:
                    self.log_test("Edit message", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Edit message", False, f"Exception: {str(e)}")
    
    def test_message_reactions(self):
        """Test message reactions"""
        print("\n😀 Testing Message Reactions...")
        
        if not self.auth_token or not hasattr(self, 'test_message_id'):
            self.log_test("Message reactions", False, "No auth token or test message")
            return
        
        # Test add reaction
        try:
            response = self.make_request('POST', f'/messages/{self.test_message_id}/react?emoji=👍')
            if response.status_code == 200:
                message = response.json()
                self.log_test("Add reaction", True, f"Reactions: {len(message.get('reactions', []))}")
            else:
                self.log_test("Add reaction", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Add reaction", False, f"Exception: {str(e)}")
        
        # Test remove reaction
        try:
            response = self.make_request('DELETE', f'/messages/{self.test_message_id}/react/👍')
            if response.status_code == 200:
                message = response.json()
                self.log_test("Remove reaction", True, "Reaction removed successfully")
            else:
                self.log_test("Remove reaction", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Remove reaction", False, f"Exception: {str(e)}")
    
    def test_user_data_with_folders(self):
        """Test user data and folder organization"""
        print("\n📁 Testing User Data with Folders...")
        
        if not self.auth_token:
            self.log_test("User data with folders", False, "No authentication token")
            return
        
        # Test get user chats with folders
        try:
            response = self.make_request('GET', '/users/chats')
            if response.status_code == 200:
                user_data = response.json()
                if 'user' in user_data and 'chats' in user_data and 'folders' in user_data:
                    folders = user_data['folders']
                    chats = user_data['chats']
                    self.log_test("Get user chats with folders", True, 
                                f"User: {user_data['user']['name']}, Chats: {len(chats)}, Folders: {len(folders)}")
                else:
                    self.log_test("Get user chats with folders", False, f"Missing data: {user_data.keys()}")
            else:
                self.log_test("Get user chats with folders", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get user chats with folders", False, f"Exception: {str(e)}")
        
        # Test get folders
        try:
            response = self.make_request('GET', '/folders')
            if response.status_code == 200:
                folders = response.json()
                folder_types = [f['folder_type'] for f in folders]
                self.log_test("Get folders", True, f"Folder types: {', '.join(folder_types)}")
            else:
                self.log_test("Get folders", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get folders", False, f"Exception: {str(e)}")
        
        # Test create custom folder
        try:
            folder_data = {
                "name": "Pasta de Teste 📂",
                "folder_type": "archived",
                "icon": "📂",
                "chat_ids": []
            }
            response = self.make_request('POST', '/folders', json=folder_data)
            if response.status_code == 200:
                folder = response.json()
                self.log_test("Create custom folder", True, f"Folder: {folder['name']}")
            else:
                self.log_test("Create custom folder", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Create custom folder", False, f"Exception: {str(e)}")
    
    def test_search_functionality(self):
        """Test search functionality"""
        print("\n🔍 Testing Search Functionality...")
        
        if not self.auth_token:
            self.log_test("Search functionality", False, "No authentication token")
            return
        
        # Test search messages
        try:
            response = self.make_request('GET', '/search/messages?q=teste&limit=10')
            if response.status_code == 200:
                messages = response.json()
                self.log_test("Search messages", True, f"Found {len(messages)} messages")
            else:
                self.log_test("Search messages", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Search messages", False, f"Exception: {str(e)}")
    
    def test_advanced_message_features(self):
        """Test advanced message features"""
        print("\n🚀 Testing Advanced Message Features...")
        
        if not self.auth_token:
            self.log_test("Advanced message features", False, "No authentication token")
            return
        
        # Test mark message as read
        if hasattr(self, 'test_message_id'):
            try:
                response = self.make_request('POST', f'/messages/{self.test_message_id}/read')
                if response.status_code == 200:
                    self.log_test("Mark message as read", True, "Message marked as read")
                else:
                    self.log_test("Mark message as read", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Mark message as read", False, f"Exception: {str(e)}")
        
        # Test forward message (if we have multiple chats)
        if hasattr(self, 'test_message_id') and hasattr(self, 'test_group_chat_id'):
            try:
                response = self.make_request('POST', 
                    f'/messages/{self.test_message_id}/forward?target_chat_id={self.test_group_chat_id}')
                if response.status_code == 200:
                    forwarded_message = response.json()
                    self.log_test("Forward message", True, f"Forwarded to: {self.test_group_chat_id}")
                else:
                    self.log_test("Forward message", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Forward message", False, f"Exception: {str(e)}")
    
    def test_chat_join_leave(self):
        """Test joining and leaving chats"""
        print("\n🚪 Testing Chat Join/Leave...")
        
        if not self.auth_token:
            self.log_test("Chat join/leave", False, "No authentication token")
            return
        
        # Test join public channel (if we created one)
        if hasattr(self, 'test_channel_id'):
            try:
                response = self.make_request('POST', f'/chats/{self.test_channel_id}/join')
                if response.status_code == 200:
                    self.log_test("Join public channel", True, "Successfully joined channel")
                else:
                    self.log_test("Join public channel", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Join public channel", False, f"Exception: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n⚠️ Testing Error Handling...")
        
        # Test invalid endpoint
        try:
            response = self.make_request('GET', '/invalid-endpoint')
            if response.status_code == 404:
                self.log_test("Invalid endpoint handling", True, "Correctly returned 404")
            else:
                self.log_test("Invalid endpoint handling", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Invalid endpoint handling", False, f"Exception: {str(e)}")
        
        # Test unauthorized access
        old_token = self.auth_token
        self.auth_token = "invalid_token"
        try:
            response = self.make_request('GET', '/auth/me')
            if response.status_code == 401:
                self.log_test("Unauthorized access handling", True, "Correctly returned 401")
            else:
                self.log_test("Unauthorized access handling", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Unauthorized access handling", False, f"Exception: {str(e)}")
        finally:
            self.auth_token = old_token
        
        # Test invalid chat ID
        if self.auth_token:
            try:
                response = self.make_request('GET', '/chats/invalid_chat_id')
                if response.status_code == 404:
                    self.log_test("Invalid chat ID handling", True, "Correctly returned 404")
                else:
                    self.log_test("Invalid chat ID handling", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("Invalid chat ID handling", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting KingChat Backend API Tests...")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_authentication()
        self.test_chat_management()
        self.test_specific_chat_operations()
        self.test_message_operations()
        self.test_message_reactions()
        self.test_user_data_with_folders()
        self.test_search_functionality()
        self.test_advanced_message_features()
        self.test_chat_join_leave()
        self.test_error_handling()
        
        # Summary
        end_time = time.time()
        duration = end_time - start_time
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"⏱️  Duration: {duration:.2f} seconds")
        print(f"📈 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📊 Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
        
        print("\n🎯 CRITICAL FUNCTIONALITY STATUS:")
        critical_tests = [
            "Root endpoint", "Health check", "Demo login", "Get current user",
            "Get user chats", "Send text message", "Get chat messages",
            "Get user chats with folders"
        ]
        
        for test_name in critical_tests:
            result = next((r for r in self.test_results if r['test'] == test_name), None)
            if result:
                status = "✅" if result['success'] else "❌"
                print(f"   {status} {test_name}")
        
        return passed_tests, failed_tests, total_tests

def main():
    """Main test execution"""
    tester = KingChatAPITester()
    
    try:
        passed, failed, total = tester.run_all_tests()
        
        # Exit with appropriate code
        if failed == 0:
            print("\n🎉 All tests passed! KingChat API is working correctly.")
            exit(0)
        else:
            print(f"\n⚠️  {failed} tests failed. Please check the issues above.")
            exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n💥 Test execution failed: {str(e)}")
        exit(1)

if __name__ == "__main__":
    main()