import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMessage, chatService } from '../../src/services/ChatService';

export default function ChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Initial welcome message
        setMessages([{
            id: 'welcome',
            text: "Hi! I'm your MBTA Assistant. Ask me about train times like 'Next train to Alewife'.",
            sender: 'bot',
            timestamp: new Date()
        }]);

        // Network listener
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!(state.isConnected && state.isInternetReachable));
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const responseText = await chatService.sendMessage(userMsg.text);

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I encountered an error processing your request.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>MBTA Assistant</Text>
                {isOffline && (
                    <View style={styles.offlineBadge}>
                        <Ionicons name="cloud-offline" size={12} color="white" />
                        <Text style={styles.offlineText}>Offline Mode</Text>
                    </View>
                )}
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageBubble,
                        item.sender === 'user' ? styles.userBubble : styles.botBubble
                    ]}>
                        <Text style={[
                            styles.messageText,
                            item.sender === 'user' ? styles.userText : styles.botText
                        ]}>{item.text}</Text>
                    </View>
                )}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask about trains..."
                    placeholderTextColor="#666"
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Ionicons name="send" size={20} color="white" />
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C345F', // MBTA Navy
    },
    offlineBadge: {
        backgroundColor: '#F2A900', // Warning/Offline color
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    offlineText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    messageList: {
        padding: 16,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#1C345F', // MBTA Navy
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    userText: {
        color: 'white',
    },
    botText: {
        color: '#333',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#1C345F',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
});
